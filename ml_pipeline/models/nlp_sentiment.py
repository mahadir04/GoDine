import torch
import torch.nn as nn

class ABSABertClassifier(nn.Module):
    def __init__(self, num_aspects=5, num_classes=3):
        super(ABSABertClassifier, self).__init__()
        # Simulated BERT encoder output dimension
        self.bert_dim = 768
        
        # Shared intermediate representations layer
        self.dropout = nn.Dropout(0.1)
        self.shared_dense = nn.Linear(self.bert_dim, 256)
        
        # Aspect-specific sentiment classification heads
        # Aspect mappings: Taste, Ambience, Service, Portion, Price
        # Classification output: 3 classes (Negative, Neutral, Positive)
        self.aspect_heads = nn.ModuleList([
            nn.Linear(256, num_classes) for _ in range(num_aspects)
        ])
        
        # Overall sentiment regression head (-1.0 to 1.0)
        self.sentiment_regressor = nn.Linear(256, 1)

    def forward(self, bert_hidden_states):
        """
        bert_hidden_states: CLS token embeddings, shape [batch_size, 768]
        """
        x = self.dropout(bert_hidden_states)
        x = torch.tanh(self.shared_dense(x))
        
        # Calculate logits for each aspect
        aspect_logits = []
        for head in self.aspect_heads:
            logits = head(x) # [batch_size, 3]
            aspect_logits.append(logits)
            
        # Overall sentiment regression
        overall_sentiment = torch.tanh(self.sentiment_regressor(x)) # [batch_size, 1]
        
        return aspect_logits, overall_sentiment
