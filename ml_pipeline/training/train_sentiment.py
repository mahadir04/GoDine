import torch
import torch.nn as nn
import torch.optim as optim
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.nlp_sentiment import ABSABertClassifier

def train_sentiment():
    print("Initiating Multi-Task ABSA Transformer training simulation...")
    
    # 1. Initialize model
    model = ABSABertClassifier(num_aspects=5, num_classes=3)
    optimizer = optim.Adam(model.parameters(), lr=5e-5)
    
    # Loss functions
    aspect_criterion = nn.CrossEntropyLoss()
    sentiment_criterion = nn.MSELoss()
    
    # 2. Simulated inputs (BERT CLS tokens)
    epochs = 5
    batch_size = 16
    bert_dim = 768
    
    for epoch in range(epochs):
        epoch_loss = 0.0
        batches = 10
        
        for b in range(batches):
            # Simulated BERT output
            inputs = torch.randn(batch_size, bert_dim)
            
            # Simulated targets:
            # 5 aspects, each gets random label in [0, 1, 2] (Negative, Neutral, Positive)
            aspect_targets = [torch.randint(0, 3, (batch_size,)) for _ in range(5)]
            # Overall sentiment score target in range [-1.0, 1.0]
            sentiment_targets = torch.rand(batch_size, 1) * 2 - 1.0
            
            # Forward pass
            aspect_logits, overall_sent = model(inputs)
            
            # Compute loss = sum(aspect losses) + sentiment regression loss
            loss = 0.0
            for pred, target in zip(aspect_logits, aspect_targets):
                loss += aspect_criterion(pred, target)
                
            loss += sentiment_criterion(overall_sent, sentiment_targets) * 2.0
            
            # Backpropagation
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
        avg_loss = epoch_loss / batches
        print(f"Epoch {epoch+1}/{epochs} - Combined ABSA Multi-Task Loss: {avg_loss:.4f}")
        
    print("Training finished successfully! Saving weights placeholder...")
    os.makedirs("ml_pipeline/configs", exist_ok=True)
    torch.save(model.state_dict(), "ml_pipeline/configs/absa_weights.pt")
    print("Model saved to ml_pipeline/configs/absa_weights.pt")

if __name__ == "__main__":
    train_sentiment();
