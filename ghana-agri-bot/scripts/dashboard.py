"""
Simple Dashboard Generator
"""
import json
from pathlib import Path
from datetime import datetime
import matplotlib.pyplot as plt
from collections import Counter

def create_dashboard():
    # Load data
    feedback_dir = Path("data/feedback")
    interactions = []
    
    for file in feedback_dir.glob("interactions_*.jsonl"):
        with open(file) as f:
            for line in f:
                interactions.append(json.loads(line))
    
    # Create visualizations
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    
    # 1. Queries over time
    dates = [datetime.fromisoformat(i['timestamp']).date() 
             for i in interactions if 'timestamp' in i]
    date_counts = Counter(dates)
    
    axes[0, 0].bar(date_counts.keys(), date_counts.values())
    axes[0, 0].set_title('Queries Per Day')
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    # 2. Response times
    times = [i['response_time'] for i in interactions 
             if 'response_time' in i]
    axes[0, 1].hist(times, bins=20)
    axes[0, 1].set_title('Response Time Distribution')
    axes[0, 1].set_xlabel('Seconds')
    
    # 3. Confidence levels
    confidence = Counter(i.get('confidence', 'unknown') 
                        for i in interactions)
    axes[1, 0].pie(confidence.values(), labels=confidence.keys(), 
                   autopct='%1.1f%%')
    axes[1, 0].set_title('Confidence Distribution')
    
    # 4. Top users
    users = Counter(i.get('username', 'Unknown') 
                   for i in interactions)
    top_users = dict(users.most_common(5))
    axes[1, 1].bar(top_users.keys(), top_users.values())
    axes[1, 1].set_title('Top 5 Users')
    axes[1, 1].tick_params(axis='x', rotation=45)
    
    plt.suptitle('Ghana Agricultural Bot Dashboard', fontsize=16)
    plt.tight_layout()
    
    # Save dashboard
    plt.savefig('data/dashboard.png', dpi=300, bbox_inches='tight')
    print("✅ Dashboard saved to data/dashboard.png")
    
    # Also show stats
    print(f"\n📊 Summary Stats:")
    print(f"Total Queries: {len(interactions)}")
    print(f"Unique Users: {len(set(i.get('user_id') for i in interactions))}")
    print(f"Avg Response Time: {sum(times)/len(times):.2f}s" if times else "N/A")
    
    plt.show()

if __name__ == "__main__":
    # Install: pip install matplotlib
    create_dashboard()