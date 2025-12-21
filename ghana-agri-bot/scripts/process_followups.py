"""
Process scheduled follow-ups to check implementation
"""

import json
import time
from datetime import datetime
from pathlib import Path
import sys
import os

# Add the parent directory to the path so we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.feedback_system import FeedbackSystem

def process_follow_ups():
    """Process scheduled follow-ups"""
    feedback_system = FeedbackSystem()
    follow_up_file = Path("data/feedback/follow_up_queue.jsonl")
    
    if not follow_up_file.exists():
        print("No follow-ups to process")
        return
    
    current_time = time.time()
    processed_count = 0
    
    # Read follow-ups
    with open(follow_up_file, 'r') as f:
        follow_ups = [json.loads(line) for line in f if line.strip()]
    
    # Process due follow-ups
    remaining_follow_ups = []
    
    for follow_up in follow_ups:
        if follow_up['scheduled_date'] <= current_time:
            # Process this follow-up
            print(f"Processing follow-up for farmer {follow_up['farmer_id']}")
            # Here you would send the follow-up message via your preferred channel
            # For now, just log it
            processed_count += 1
        else:
            remaining_follow_ups.append(follow_up)
    
    # Write back remaining follow-ups
    with open(follow_up_file, 'w') as f:
        for follow_up in remaining_follow_ups:
            f.write(json.dumps(follow_up) + '\n')
    
    print(f"Processed {processed_count} follow-ups")

if __name__ == "__main__":
    process_follow_ups()