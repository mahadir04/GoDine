from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.review import Review
from app.models.venue import Venue
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.api.deps import get_current_user
from app.services.sentiment_service import analyze_review_sentiment

router = APIRouter()

# CREATE REVIEW
@router.post("/", response_model=ReviewResponse)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    venue = db.query(Venue).filter(Venue.id == review_in.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Target venue not found")
        
    # Analyze sentiment
    nlp_results = analyze_review_sentiment(review_in.review_text)
    
    db_review = Review(
        venue_id=review_in.venue_id,
        user_id=current_user.id,
        dish_name=review_in.dish_name,
        rating=review_in.rating,
        review_text=review_in.review_text,
        sentiment_score=nlp_results["overall_sentiment"],
        aspect_scores=nlp_results["aspect_scores"],
        is_flagged_spam=False
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Recalculate average rating for venue
    all_reviews = db.query(Review).filter(Review.venue_id == venue.id).all()
    if all_reviews:
        venue.average_rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2)
        db.add(venue)
        db.commit()
        
    return db_review

# READ REVIEWS FOR A VENUE
@router.get("/venue/{venue_id}", response_model=List[ReviewResponse])
def get_venue_reviews(venue_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.venue_id == venue_id).all()

# READ SINGLE REVIEW
@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

# UPDATE REVIEW
@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: str,
    review_in: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to update this review.")
        
    if review_in.review_text:
        review.review_text = review_in.review_text
        nlp_results = analyze_review_sentiment(review_in.review_text)
        review.sentiment_score = nlp_results["overall_sentiment"]
        review.aspect_scores = nlp_results["aspect_scores"]
        
    if review_in.rating is not None:
        review.rating = review_in.rating
        
    if review_in.dish_name is not None:
        review.dish_name = review_in.dish_name
        
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Recalculate average rating
    venue = db.query(Venue).filter(Venue.id == review.venue_id).first()
    if venue:
        all_reviews = db.query(Review).filter(Review.venue_id == venue.id).all()
        venue.average_rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2)
        db.add(venue)
        db.commit()
        
    return review

# DELETE REVIEW
@router.delete("/{review_id}")
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this review.")
        
    venue_id = review.venue_id
    db.delete(review)
    db.commit()
    
    # Recalculate average rating
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if venue:
        all_reviews = db.query(Review).filter(Review.venue_id == venue_id).all()
        venue.average_rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2) if all_reviews else 0.0
        db.add(venue)
        db.commit()
        
    return {"message": "Review deleted successfully", "id": review_id}
