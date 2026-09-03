import torch
import torch.optim as optim
import numpy as np
import os
import sys

# Add root folder to sys.path to enable absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.two_tower import TwoTowerModel, info_nce_loss

def train_recommender():
    print("Initiating Two-Tower Candidate Retrieval training simulation...")
    
    # 1. Initialize model
    model = TwoTowerModel(output_dim=128)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # 2. Generate simulated training inputs (100 batches of size 32)
    # Batch represents user contexts (Query tower) and clicked items (Candidate tower)
    epochs = 5
    batch_size = 32
    query_dim = 64 + 2 + 2 # user_gnn + geo + time
    candidate_dim = 768 + 1 + 2 # nlp + price + geo
    
    for epoch in range(epochs):
        epoch_loss = 0.0
        batches = 10
        
        for b in range(batches):
            # Generate simulated features
            query_features = torch.randn(batch_size, query_dim)
            candidate_features = torch.randn(batch_size, candidate_dim)
            
            # Forward pass through towers
            query_embeds = model.query_tower(query_features)
            candidate_embeds = model.candidate_tower(candidate_features)
            
            # Calculate InfoNCE loss (encouraging clicked pair alignment in vector space)
            loss = info_nce_loss(query_embeds, candidate_embeds)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
        avg_loss = epoch_loss / batches
        print(f"Epoch {epoch+1}/{epochs} - Average InfoNCE Loss: {avg_loss:.4f}")
        
    print("Training finished successfully! Saving weights placeholder...")
    os.makedirs("ml_pipeline/configs", exist_ok=True)
    torch.save(model.state_dict(), "ml_pipeline/configs/two_tower_weights.pt")
    print("Model saved to ml_pipeline/configs/two_tower_weights.pt")

if __name__ == "__main__":
    train_recommender()
