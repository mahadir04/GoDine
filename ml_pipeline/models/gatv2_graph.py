import torch
import torch.nn as nn
import torch.nn.functional as F

class GATv2Layer(nn.Module):
    def __init__(self, in_features, out_features, edge_dim=16, concat=True, alpha=0.2):
        super(GATv2Layer, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.edge_dim = edge_dim
        self.concat = concat
        self.alpha = alpha

        # Linear transformations for target and source nodes
        self.W_t = nn.Linear(in_features, out_features, bias=False)
        self.W_s = nn.Linear(in_features, out_features, bias=False)
        self.W_e = nn.Linear(edge_dim, out_features, bias=False)

        # Attention parameter
        self.attn_a = nn.Parameter(torch.empty(size=(out_features, 1)))
        nn.init.xavier_uniform_(self.attn_a.data, gain=1.414)

        self.leakyrelu = nn.LeakyReLU(self.alpha)

    def forward(self, h, adj, edge_attr=None):
        """
        h: Node features, shape [num_nodes, in_features]
        adj: Adjacency list / edge index, shape [2, num_edges]
        edge_attr: Edge features, shape [num_edges, edge_dim]
        """
        num_nodes = h.size(0)
        num_edges = adj.size(1)

        # 1. Linear project node representations
        h_t = self.W_t(h)  # Target representations
        h_s = self.W_s(h)  # Source representations

        # Get node representations for edges
        row, col = adj[0], adj[1]
        h_i = h_t[row]  # [num_edges, out_features]
        h_j = h_s[col]  # [num_edges, out_features]

        # Edge features projection
        if edge_attr is not None:
            h_e = self.W_e(edge_attr)
            # Combine target || source || edge
            edge_repr = h_i + h_j + h_e
        else:
            edge_repr = h_i + h_j

        # 2. Compute attention coefficients
        # GATv2: a^T LeakyReLU(W_t h_i + W_s h_j + W_e e_ij)
        attn_scores = self.leakyrelu(edge_repr)
        attn_coefs = torch.matmul(attn_scores, self.attn_a).squeeze(-1) # [num_edges]

        # Softmax over neighborhood nodes for each target node
        # Using scatter-softmax or manual loop for standard PyTorch ease
        exp_coefs = torch.exp(attn_coefs - torch.max(attn_coefs))
        
        sum_exp = torch.zeros(num_nodes, device=h.device)
        sum_exp.scatter_add_(0, row, exp_coefs)
        
        # Avoid division by zero
        sum_exp = sum_exp + 1e-9
        normalized_attention = exp_coefs / sum_exp[row]

        # 3. Message passing aggregation
        # Weighted representations
        weighted_repr = normalized_attention.unsqueeze(-1) * h_j # [num_edges, out_features]
        
        out = torch.zeros(num_nodes, self.out_features, device=h.device)
        # Sum representations for each target node
        out.scatter_add_(0, row.unsqueeze(-1).expand(-1, self.out_features), weighted_repr)

        if self.concat:
            return F.elu(out)
        return out
