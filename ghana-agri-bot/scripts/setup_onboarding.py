"""
Quick setup script for onboarding system
"""

import os
from pathlib import Path

def setup_onboarding_directories():
    """Create necessary directories for onboarding"""
    
    directories = [
        "data/onboarding",
        "data/feedback",
        "data/logs",
        "data/user_profiles"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def create_sample_data():
    """Create sample data files"""
    
    # Create sample user profiles
    sample_profile = {
        "12345": {
            "user_id": 12345,
            "username": "sample_farmer",
            "location": "Kumasi",
            "region": "Ashanti",
            "experience": "intermediate",
            "farm_size": "small-scale",
            "crop_interests": ["Staples", "Vegetables"],
            "onboarding_completed": "2024-01-15T10:30:00",
            "profile_version": "1.0"
        }
    }
    
    import json
    with open("data/onboarding/user_profiles.json", "w") as f:
        json.dump(sample_profile, f, indent=2)
    
    print("✅ Created sample user profiles")

if __name__ == "__main__":
    print("🔧 Setting up onboarding system...")
    setup_onboarding_directories()
    create_sample_data()
    print("🎉 Onboarding setup complete!")