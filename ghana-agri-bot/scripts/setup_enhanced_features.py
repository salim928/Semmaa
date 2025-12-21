"""
Setup script for enhanced Ghana AgriBOT features
"""

import subprocess
import sys
from pathlib import Path
import os

def setup_enhanced_features():
    """Setup all enhanced features"""
    
    print("🚀 Setting up enhanced SemmaAI features...")
    
    # 1. Create necessary directories
    directories = [
        "data/logs",
        "data/documents/ghana_specific", 
        "data/documents/searchable",
        "data/images/analysis"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    # 2. Install additional requirements for image processing
    additional_packages = [
        "Pillow>=9.0.0",
        "numpy>=1.21.0"
    ]
    
    for package in additional_packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ Installed {package}")
        except Exception as e:
            print(f"⚠️ Failed to install {package}: {e}")
    
    # 3. Load Ghana-specific knowledge (run the script directly)
    try:
        print("📚 Loading Ghana-specific knowledge...")
        # Change to the correct directory and run the script
        original_dir = os.getcwd()
        os.chdir(Path(__file__).parent.parent)  # Go to project root
        
        # Import and run the knowledge script
        subprocess.check_call([sys.executable, "scripts/add_ghana_knowledge.py"])
        print("✅ Loaded Ghana-specific knowledge base")
        
        os.chdir(original_dir)  # Return to original directory
    except Exception as e:
        print(f"⚠️ Failed to load Ghana knowledge: {e}")
    
    # 4. Test components (need to add project root to path)
    print("\n🧪 Testing components...")
    
    # Add project root to Python path
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))
    
    try:
        from src.error_handler import error_handler
        test_message = error_handler.get_friendly_message("general_error")
        print("✅ Error handler working")
    except Exception as e:
        print(f"❌ Error handler failed: {e}")
    
    try:
        from src.image_analyzer import image_analyzer
        print("✅ Image analyzer loaded")
    except Exception as e:
        print(f"❌ Image analyzer failed: {e}")
    
    print("\n🎉 Enhanced features setup complete!")
    print("\n📋 **New Capabilities:**")
    print("• 🚨 User-friendly error messages")
    print("• 🇬🇭 Ghana-specific agricultural knowledge")
    print("• 📸 Image analysis for crop/pest diagnosis")
    print("\n💡 **To use:**")
    print("• Run your bot: python run.py")
    print("• Send photos for crop analysis")
    print("• Ask Ghana-specific farming questions") 
    print("• Experience improved error handling")

if __name__ == "__main__":
    setup_enhanced_features()