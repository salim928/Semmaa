"""
Optimize document chunking and indexing based on usage patterns
"""

import json
import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.knowledge_base import KnowledgeBase

def analyze_document_performance():
    """Analyze which document sections are most useful"""
    
    feedback_file = Path("data/feedback/knowledge_base_feedback.jsonl")
    if not feedback_file.exists():
        print("No feedback data available")
        return
    
    # Load feedback data
    feedback_data = []
    with open(feedback_file, 'r') as f:
        for line in f:
            if line.strip():
                feedback_data.append(json.loads(line))
    
    # Analyze positive vs negative feedback patterns
    positive_queries = [item['query'] for item in feedback_data if item['feedback'] == 'positive']
    negative_queries = [item['query'] for item in feedback_data if item['feedback'] == 'negative']
    
    print(f"Positive feedback queries: {len(positive_queries)}")
    print(f"Negative feedback queries: {len(negative_queries)}")
    
    # Suggest document improvements
    print("\nDocument Optimization Suggestions:")
    print("1. Add more examples for commonly asked questions")
    print("2. Include more location-specific information")
    print("3. Add seasonal timing details")
    print("4. Include cost estimates and resource requirements")

def analyze_query_patterns():
    """Analyze common query patterns for document optimization"""
    
    feedback_file = Path("data/feedback/knowledge_base_feedback.jsonl")
    if not feedback_file.exists():
        print("No feedback data available for query analysis")
        return
    
    # Load and analyze query patterns
    queries = []
    with open(feedback_file, 'r') as f:
        for line in f:
            if line.strip():
                data = json.loads(line)
                queries.append(data['query'].lower())
    
    # Find common words/topics
    all_words = ' '.join(queries).split()
    word_freq = {}
    for word in all_words:
        if len(word) > 3:  # Skip short words
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Get top 10 most common topics
    common_topics = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    
    print("\nMost Common Query Topics:")
    for word, freq in common_topics:
        print(f"- {word}: {freq} times")

def suggest_document_improvements():
    """Suggest specific document improvements based on analysis"""
    
    print("\n📋 Specific Document Improvement Recommendations:")
    print("\n1. 🌱 Crop Guide Enhancements:")
    print("   - Add planting calendars for each region")
    print("   - Include variety-specific information")
    print("   - Add companion planting suggestions")
    
    print("\n2. 🐛 Pest Management Improvements:")
    print("   - Add photo identification guides")
    print("   - Include organic treatment recipes")
    print("   - Add prevention strategies by season")
    
    print("\n3. 🌱 Soil Fertility Updates:")
    print("   - Include soil testing procedures")
    print("   - Add local compost recipes")
    print("   - Include nutrient deficiency symptoms")
    
    print("\n4. 📅 Seasonal Calendar Enhancements:")
    print("   - Add regional variations")
    print("   - Include market timing information")
    print("   - Add weather-based adjustments")

if __name__ == "__main__":
    print("🔍 Analyzing Document Performance...")
    analyze_document_performance()
    
    print("\n" + "="*50)
    analyze_query_patterns()
    
    print("\n" + "="*50)
    suggest_document_improvements()