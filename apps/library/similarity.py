from difflib import SequenceMatcher

def is_similar(text1, text2, threshold=0.8):
    """
    Returns True if the similarity ratio between two strings exceeds the threshold.
    Standard threshold is 0.8 (80%).
    """
    if not text1 or not text2:
        return False
    
    # Simple preprocessing: lowercase and strip
    t1 = text1.lower().strip()
    t2 = text2.lower().strip()
    
    ratio = SequenceMatcher(None, t1, t2).ratio()
    return ratio >= threshold, ratio
