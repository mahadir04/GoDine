import re
from typing import Dict, Any

# Simple rule-based aspect lexicon for English, Bangla, and Banglish
ASPECT_WORDS = {
    "taste": [
        "taste", "delicious", "tasty", "yummy", "mojar", "moza", "swad", "flavor", "flavour", 
        "smell", "tender", "juicy", "awesome", "chomotkar", "khabar", "dish", "food", "kacchi", 
        "platter", "brisket", "beef", "chicken", "mutton", "sauce", "spicy", "coffee", "tea", 
        "drink", "drinks", "beverage", "beverages", "juice", "shake", "espresso", "latte", "cappuccino"
    ],
    "ambience": [
        "ambience", "interior", "decoration", "vibe", "rooftop", "view", "music", "sitting", 
        "space", "crowded", "noise", "quiet", "clean", "hygiene", "toilet", "washroom", "ac", 
        "ac wasn't", "crowd", "space is too"
    ],
    "service": [
        "service", "waiter", "staff", "behavior", "behaviour", "manager", "fast", "slow", 
        "delay", "time", "helpful", "friendly", "wait", "served", "delivered"
    ],
    "portion": [
        "portion", "quantity", "size", "enough", "heavy", "plate", "pet bhore", "kom", 
        "amount", "fill", "small portion"
    ],
    "price": [
        "price", "cost", "expensive", "cheap", "taka", "value", "bill", "budget", 
        "affordable", "overpriced", "dam", "taka chilo"
    ]
}

POSITIVE_WORDS = [
    "good", "great", "excellent", "awesome", "delicious", "tasty", "yummy", "friendly", 
    "fast", "quiet", "clean", "affordable", "cheap", "juicy", "tender", "helpful", "best", 
    "love", "nice", "wonderful", "perfect", "bhalo", "mojar", "chomotkar", "sundor", 
    "darun", "sera", "moza", "jossh", "nice vibe"
]

NEGATIVE_WORDS = [
    "bad", "terrible", "poor", "slow", "delay", "expensive", "overpriced", "crowded", 
    "noisy", "dirty", "unhelpful", "rude", "worst", "hate", "wasn't", "not", "no", "never", 
    "kharap", "faltu", "baje", "bhalo na", "faka chilo na", "kom", "problem", "issue", "properly"
]

def analyze_review_sentiment(text: str) -> Dict[str, Any]:
    """
    Parses Bangla, Banglish, and English reviews to extract aspect scores
    and overall sentiment polarity (-1.0 to 1.0).
    """
    text_lower = text.lower()
    # Split by punctuation or coordinating conjunctions to isolate clauses
    sentences = re.split(r'[.,!?;\n।]|\b(?:but|kintu|and|ebong|yet|although|though|however|tobuo)\b', text_lower)
    
    aspect_sentiment = {
        "taste": 0.0,
        "ambience": 0.0,
        "service": 0.0,
        "portion": 0.0,
        "price": 0.0
    }
    
    aspect_counts = {
        "taste": 0,
        "ambience": 0,
        "service": 0,
        "portion": 0,
        "price": 0
    }

    # Helper function to check if word has negation context nearby
    def check_sentiment(sentence, word_idx, tokens):
        # Scan backward 2 tokens for negations
        start = max(0, word_idx - 2)
        negation = False
        for i in range(start, word_idx):
            if tokens[i] in ["not", "no", "wasn't", "doesn't", "na", "ni", "dont", "cant", "without"]:
                negation = True
        return negation

    for sentence in sentences:
        tokens = sentence.strip().split()
        if not tokens:
            continue
            
        for aspect, keywords in ASPECT_WORDS.items():
            # Check if sentence references this aspect using exact word tokens or phrases
            has_aspect = False
            for kw in keywords:
                if " " in kw:
                    if kw in sentence:
                        has_aspect = True
                        break
                else:
                    if any(kw == re.sub(r'[^a-zA-Z0-9\u0980-\u09ff]', '', t) for t in tokens):
                        has_aspect = True
                        break
                        
            if not has_aspect:
                continue
                
            # Score this sentence for the aspect
            score = 0.0
            matches = 0
            for idx, token in enumerate(tokens):
                # Clean token of symbols
                clean_token = re.sub(r'[^a-zA-Z0-9\u0980-\u09ff]', '', token)
                
                # Check match in positive/negative lists (exact word match, or phrase matches in sentence)
                is_pos = (clean_token in POSITIVE_WORDS) or any(pw in sentence for pw in POSITIVE_WORDS if " " in pw)
                is_neg = (clean_token in NEGATIVE_WORDS) or any(nw in sentence for nw in NEGATIVE_WORDS if " " in nw)
                
                if is_pos:
                    negated = check_sentiment(sentence, idx, tokens)
                    score += -1.0 if negated else 1.0
                    matches += 1
                elif is_neg:
                    negated = check_sentiment(sentence, idx, tokens)
                    score += 1.0 if negated else -1.0
                    matches += 1
            
            if matches > 0:
                final_score = max(-1.0, min(1.0, score / matches))
                aspect_sentiment[aspect] += final_score
                aspect_counts[aspect] += 1

    # Average the scores per aspect
    final_aspect_scores = {}
    total_valid_score = 0.0
    aspects_found = 0
    for aspect in aspect_sentiment:
        count = aspect_counts[aspect]
        if count > 0:
            avg_score = aspect_sentiment[aspect] / count
            # Map score range [-1, 1] to a rating scale [1, 5] for the UI
            rating = round(3.0 + (avg_score * 2.0), 1)
            final_aspect_scores[aspect] = rating
            total_valid_score += avg_score
            aspects_found += 1
        else:
            # Default fallback rating if not explicitly mentioned in the text
            final_aspect_scores[aspect] = 3.0

    # Calculate overall sentiment score
    overall_sentiment = 0.0
    if aspects_found > 0:
        overall_sentiment = round(total_valid_score / aspects_found, 2)
    else:
        # Fallback to general text sentiment
        pos_matches = sum(1 for pw in POSITIVE_WORDS if pw in text_lower)
        neg_matches = sum(1 for nw in NEGATIVE_WORDS if nw in text_lower)
        total_m = pos_matches + neg_matches
        if total_m > 0:
            overall_sentiment = round((pos_matches - neg_matches) / total_m, 2)
        else:
            overall_sentiment = 0.0

    return {
        "overall_sentiment": overall_sentiment,
        "aspect_scores": final_aspect_scores
    }
