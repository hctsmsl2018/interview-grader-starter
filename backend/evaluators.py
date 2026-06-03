"""Evaluators for grading model outputs against reference answers."""

from rapidfuzz import fuzz
import math


def cosine_similarity(text1: str, text2: str) -> float:
    """
    Calculate cosine similarity between two text strings.
    Uses simple character-based TF approach.
    Returns a value between 0 and 1.
    """
    # Simple tokenization (split on whitespace and lowercase)
    tokens1 = text1.lower().split()
    tokens2 = text2.lower().split()

    if not tokens1 or not tokens2:
        return 1.0 if text1 == text2 else 0.0

    # Create frequency maps
    freq1 = {}
    freq2 = {}

    for token in tokens1:
        freq1[token] = freq1.get(token, 0) + 1

    for token in tokens2:
        freq2[token] = freq2.get(token, 0) + 1

    # Calculate dot product and magnitudes
    dot_product = 0.0
    for token in freq1:
        if token in freq2:
            dot_product += freq1[token] * freq2[token]

    magnitude1 = math.sqrt(sum(count**2 for count in freq1.values()))
    magnitude2 = math.sqrt(sum(count**2 for count in freq2.values()))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    return dot_product / (magnitude1 * magnitude2)


def fuzzy_match(text1: str, text2: str) -> float:
    """
    Calculate fuzzy match score between two text strings.
    Uses token_sort_ratio for robustness.
    Returns a value between 0 and 1.
    """
    # Use rapidfuzz for fuzzy matching
    score = fuzz.token_sort_ratio(text1, text2)
    return score / 100.0


def evaluate_text_similarity(
    model_output: str, reference_output: str, metric: str
) -> float:
    """
    Evaluate similarity between model output and reference answer.
    
    Args:
        model_output: The output from the model
        reference_output: The reference/expected answer
        metric: Either 'fuzzy_match' or 'cosine'
    
    Returns:
        A score between 0 and 1
    """
    if metric == "fuzzy_match":
        return fuzzy_match(model_output, reference_output)
    elif metric == "cosine":
        return cosine_similarity(model_output, reference_output)
    else:
        raise ValueError(f"Unknown metric: {metric}")
