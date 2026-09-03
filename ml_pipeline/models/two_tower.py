import torch
import torch.nn as nn
import torch.nn.functional as F

class QueryTower(nn.Module):
    def __init__(self, user_gnn_dim=64, output_dim=128):
        super(QueryTower, self).__init__()
        # Input features: User GNN embedding (64) + GPS lat/lon (2) + Time features (2)
        input_dim = user_gnn_dim + 2 + 2
        
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.LayerNorm(256),
            nn.GELU(),
            nn.Linear(256, 128),
            nn.GELU(),
            nn.Linear(128, output_dim)
        )
        
    def forward(self, user_features):
        # user_features shape: [batch_size, input_dim]
        embedding = self.mlp(user_features)
        # Normalize to hypersphere for cosine similarity
        return F.normalize(embedding, p=2, dim=1)

class CandidateTower(nn.Module):
    def __init__(self, text_nlp_dim=768, output_dim=128):
        super(CandidateTower, self).__init__()
        # Input features: NLP content embedding (768) + Price tier (1) + GPS coordinates (2)
        input_dim = text_nlp_dim + 1 + 2
        
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.LayerNorm(512),
            nn.GELU(),
            nn.Linear(512, 256),
            nn.GELU(),
            nn.Linear(256, output_dim)
        )
        
    def forward(self, candidate_features):
        # candidate_features shape: [batch_size, input_dim]
        embedding = self.mlp(candidate_features)
        return F.normalize(embedding, p=2, dim=1)

class TwoTowerModel(nn.Module):
    def __init__(self, output_dim=128):
        super(TwoTowerModel, self).__init__()
        self.query_tower = QueryTower(output_dim=output_dim)
        self.candidate_tower = CandidateTower(output_dim=output_dim)
        
    def forward(self, query_feats, candidate_feats):
        u = self.query_tower(query_feats)
        v = self.candidate_tower(candidate_feats)
        # Compute dot product similarity (scores)
        return torch.sum(u * v, dim=1)

def info_nce_loss(query_embeds, candidate_embeds, temperature=0.07):
    """
    Computes in-batch negative contrastive loss (InfoNCE).
    """
    # Dot product matrix [B, B]
    similarity_matrix = torch.matmul(query_embeds, candidate_embeds.T) / temperature
    labels = torch.arange(query_embeds.size(0), device=query_embeds.device)
    loss = F.cross_entropy(similarity_matrix, labels)
    return loss
