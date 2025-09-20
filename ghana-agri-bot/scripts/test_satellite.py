# Create a test script
#cat > scripts/test_satellite.py << 'EOF'
import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from src.satellite_integration import SatelliteIntegration, format_satellite_report

async def test_satellite():
    sat = SatelliteIntegration()
    
    # Test Kumasi maize farm
    result = sat.get_farm_analysis(
        latitude=6.6666,
        longitude=-1.6163,
        crop_type="maize"
    )
    
    print("Raw data:", result)
    print("\n" + "="*50 + "\n")
    print(format_satellite_report(result))

if __name__ == "__main__":
    asyncio.run(test_satellite())
