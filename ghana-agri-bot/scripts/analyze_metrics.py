"""
Metrics Analysis Script
Purpose: Generate detailed analytics and reports for grant applications
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import statistics

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config.settings import FEEDBACK_DIR
from src.data_collector import DataCollector

def load_jsonl_files(pattern: str) -> list:
    """Load all JSONL files matching pattern"""
    all_data = []
    
    for file_path in FEEDBACK_DIR.glob(f"{pattern}_*.jsonl"):
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    all_data.append(json.loads(line))
                except:
                    continue
    
    return all_data

def analyze_interactions():
    """Analyze all interactions"""
    interactions = load_jsonl_files("interactions")
    
    if not interactions:
        print("❌ No interaction data found")
        return
    
    print("\n📊 INTERACTION ANALYSIS")
    print("=" * 50)
    
    # Basic stats
    print(f"Total Interactions: {len(interactions)}")
    
    # Unique users
    users = set(i.get('user_id') for i in interactions)
    print(f"Unique Users: {len(users)}")
    
    # Response times
    response_times = [i.get('response_time', 0) for i in interactions if i.get('response_time')]
    if response_times:
        print(f"Avg Response Time: {statistics.mean(response_times):.2f}s")
        print(f"Median Response Time: {statistics.median(response_times):.2f}s")
    
    # Queries per user
    user_queries = Counter(i.get('user_id') for i in interactions)
    avg_queries = sum(user_queries.values()) / len(user_queries) if user_queries else 0
    print(f"Avg Queries per User: {avg_queries:.1f}")
    
    # Most active users
    print("\n👥 Most Active Users:")
    for user_id, count in user_queries.most_common(5):
        username = next((i.get('username') for i in interactions if i.get('user_id') == user_id), 'Unknown')
        print(f"  {username}: {count} queries")
    
    # Common queries (word frequency)
    all_words = []
    for interaction in interactions:
        query = interaction.get('query', '').lower()
        all_words.extend(query.split())
    
    # Filter out common words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'my', 'is', 'it'}
    filtered_words = [w for w in all_words if w not in stop_words and len(w) > 2]
    
    print("\n🔤 Most Common Topics:")
    word_freq = Counter(filtered_words)
    for word, count in word_freq.most_common(10):
        print(f"  {word}: {count} times")
    
    # Confidence levels
    confidence_levels = Counter(i.get('confidence') for i in interactions if i.get('confidence'))
    if confidence_levels:
        print("\n⭐ Confidence Distribution:")
        total = sum(confidence_levels.values())
        for level, count in confidence_levels.most_common():
            percentage = (count / total) * 100
            print(f"  {level}: {count} ({percentage:.1f}%)")
    
    # Time analysis
    print("\n⏰ Activity by Hour:")
    hours = Counter()
    for interaction in interactions:
        timestamp = interaction.get('timestamp')
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp)
                hours[dt.hour] += 1
            except:
                continue
    
    if hours:
        for hour in sorted(hours.keys()):
            bar = '█' * (hours[hour] // max(1, max(hours.values()) // 20))
            print(f"  {hour:02d}:00 {bar} {hours[hour]}")

def analyze_feedback():
    """Analyze feedback data"""
    feedback = load_jsonl_files("feedback")
    
    if not feedback:
        print("\n❌ No feedback data found")
        return
    
    print("\n📝 FEEDBACK ANALYSIS")
    print("=" * 50)
    
    # Overall feedback
    ratings = Counter(f.get('rating') for f in feedback)
    total = sum(ratings.values())
    
    print(f"Total Feedback: {total}")
    
    if total > 0:
        positive = ratings.get('positive', 0)
        negative = ratings.get('negative', 0)
        positive_rate = (positive / total) * 100
        
        print(f"Positive: {positive} ({positive_rate:.1f}%)")
        print(f"Negative: {negative} ({100-positive_rate:.1f}%)")
        
        # Satisfaction score
        satisfaction = positive_rate
        if satisfaction >= 90:
            emoji = "🌟"
            rating = "Excellent"
        elif satisfaction >= 75:
            emoji = "😊"
            rating = "Good"
        elif satisfaction >= 50:
            emoji = "😐"
            rating = "Fair"
        else:
            emoji = "😟"
            rating = "Needs Improvement"
        
        print(f"\n{emoji} Satisfaction Score: {satisfaction:.1f}% ({rating})")

def generate_grant_metrics():
    """Generate metrics specifically for grant applications"""
    print("\n🎯 GRANT APPLICATION METRICS")
    print("=" * 50)
    
    interactions = load_jsonl_files("interactions")
    feedback = load_jsonl_files("feedback")
    
    # Calculate key metrics
    total_users = len(set(i.get('user_id') for i in interactions))
    total_queries = len(interactions)
    
    # Calculate positive feedback rate
    if feedback:
        positive = sum(1 for f in feedback if f.get('rating') == 'positive')
        total_feedback = len(feedback)
        positive_rate = (positive / total_feedback * 100) if total_feedback > 0 else 0
    else:
        positive_rate = 0
        total_feedback = 0
    
    # Response time
    response_times = [i.get('response_time', 0) for i in interactions if i.get('response_time')]
    avg_response_time = statistics.mean(response_times) if response_times else 0
    
    # Create grant-ready statements
    print("\n📋 Copy these metrics for your grant application:\n")
    print(f"✅ Served {total_users} unique farmers")
    print(f"✅ Answered {total_queries} agricultural queries")
    print(f"✅ Achieved {positive_rate:.0f}% user satisfaction rate")
    print(f"✅ Delivered advice in average {avg_response_time:.1f} seconds")
    print(f"✅ Received {total_feedback} user feedback responses")
    
    # Time period
    if interactions:
        timestamps = []
        for i in interactions:
            try:
                timestamps.append(datetime.fromisoformat(i.get('timestamp')))
            except:
                continue
        
        if timestamps:
            days_active = (max(timestamps) - min(timestamps)).days + 1
            queries_per_day = total_queries / days_active if days_active > 0 else 0
            print(f"✅ Active for {days_active} days ({queries_per_day:.1f} queries/day)")
    
    # Impact statement
    print("\n💡 Suggested Impact Statement:")
    print(f'"Our AI-powered agricultural advisory system has successfully demonstrated ')
    print(f'proof-of-concept by serving {total_users} farmers with {total_queries} queries ')
    print(f'in just {days_active if "days_active" in locals() else "several"} days. ')
    print(f'With a {positive_rate:.0f}% satisfaction rate and {avg_response_time:.1f}-second ')
    print(f'response time, we have validated the demand for instant, localized farming advice."')
    
    # Extrapolation
    print("\n📈 Projected Annual Impact (based on current metrics):")
    if 'queries_per_day' in locals() and queries_per_day > 0:
        annual_queries = int(queries_per_day * 365)
        annual_users = int(total_users * (365 / max(days_active, 1)))
        print(f"  • {annual_users:,} farmers served")
        print(f"  • {annual_queries:,} queries answered")
        print(f"  • {annual_queries * 0.20:.0f} hectares improved (estimate)")
        print(f"  • ${annual_users * 200:,} increased farmer income")

def export_testimonials():
    """Export best interactions as testimonials"""
    print("\n💬 SAMPLE TESTIMONIALS")
    print("=" * 50)
    
    interactions = load_jsonl_files("interactions")
    
    # Find interactions with positive feedback
    feedback = load_jsonl_files("feedback")
    positive_queries = set()
    
    for f in feedback:
        if f.get('rating') == 'positive':
            positive_queries.add(f.get('query'))
    
    # Find matching interactions
    testimonials = []
    for i in interactions:
        if i.get('query') in positive_queries:
            testimonials.append(i)
    
    # Display top testimonials
    if testimonials:
        print("\nUse these for grant applications:\n")
        for i, testimonial in enumerate(testimonials[:5], 1):
            print(f"Testimonial {i}:")
            print(f"Q: {testimonial.get('query', 'N/A')[:100]}")
            print(f"Response time: {testimonial.get('response_time', 0):.1f}s")
            print("-" * 40)
    else:
        print("No testimonials with positive feedback found yet.")

def analyze_kb():
    """Analyze knowledge base documents"""
    with open('data/chromadb_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    sources = [doc.get('source', 'unknown') for doc in data]
    versions = [doc.get('version', '1.0') for doc in data]
    dates = [doc.get('date_added', 'unknown') for doc in data]
    print("Source coverage:", Counter(sources))
    print("Version distribution:", Counter(versions))
    print("Most recent document:", max(dates))
    print("Oldest document:", min(dates))

def main():
    """Run all analyses"""
    print("""
    📊 Ghana Agricultural Bot - Metrics Analysis
    ============================================
    Generating grant-ready metrics and insights
    """)
    
    analyze_interactions()
    analyze_feedback()
    generate_grant_metrics()
    export_testimonials()
    analyze_kb()
    
    print("\n" + "=" * 50)
    print("✅ Analysis complete! Use these metrics in your grant applications.")
    print("\n💡 Tip: Take screenshots of this output for your pitch deck!")

if __name__ == "__main__":
    main()

import json

feedback_file = "data/feedback/feedback_202509.jsonl"
bad_feedback = []

with open(feedback_file, "r", encoding="utf-8") as f:
    for line in f:
        entry = json.loads(line)
        if entry.get("rating", 5) < 4:  # Threshold for "bad" feedback
            bad_feedback.append(entry)

with open("data/feedback/needs_improvement.jsonl", "w", encoding="utf-8") as out_f:
    for entry in bad_feedback:
        out_f.write(json.dumps(entry) + "\n")