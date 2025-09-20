"""
Add Satellite Knowledge to ChromaDB
Purpose: Populate knowledge base with satellite interpretation guidelines
"""

import sys
from pathlib import Path
import uuid

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.knowledge_base import KnowledgeBase

def add_satellite_knowledge():
    """Add satellite-specific agricultural knowledge to ChromaDB"""
    
    print("📚 Adding satellite knowledge to ChromaDB...")
    
    kb = KnowledgeBase()
    
    # Satellite knowledge documents
    satellite_documents = [
        # NDVI Interpretation
        {
            "text": "NDVI (Normalized Difference Vegetation Index) values for crop monitoring: "
                   "0.7-1.0 indicates excellent crop health with dense green vegetation. "
                   "0.5-0.7 shows good health with active growth. "
                   "0.3-0.5 suggests moderate stress requiring monitoring. "
                   "0.2-0.3 indicates significant stress needing immediate intervention. "
                   "Below 0.2 shows severe stress, bare soil, or crop failure.",
            "metadata": {
                "source": "Sentinel-2 Agricultural Guidelines",
                "type": "satellite",
                "topic": "ndvi_interpretation",
                "crop": "general"
            }
        },
        
        # Maize-specific NDVI patterns
        {
            "text": "Maize NDVI patterns through growth stages: "
                   "Emergence (0.15-0.25), Early vegetative (0.25-0.40), "
                   "Late vegetative (0.60-0.80), Tasseling (0.75-0.85), "
                   "Grain filling (0.70-0.80), Maturity (0.40-0.60). "
                   "Sudden NDVI drop during vegetative stage often indicates "
                   "water stress, nutrient deficiency, or pest attack like fall armyworm.",
            "metadata": {
                "source": "CSIR Satellite Monitoring Guide",
                "type": "satellite",
                "topic": "growth_stages",
                "crop": "maize"
            }
        },
        
        # Water stress detection
        {
            "text": "Satellite detection of water stress: NDVI drops before visible symptoms. "
                   "NDWI (Normalized Difference Water Index) below 0.2 indicates water stress. "
                   "Thermal imagery shows temperature 2-3°C higher in water-stressed crops. "
                   "Combined NDVI decline + high surface temperature = urgent irrigation needed. "
                   "Best time to irrigate is when NDVI drops 10% from peak values.",
            "metadata": {
                "source": "FAO Remote Sensing Guide",
                "type": "satellite",
                "topic": "water_stress",
                "crop": "general"
            }
        },
        
        # Pest outbreak patterns
        {
            "text": "Fall armyworm satellite detection in maize: "
                   "Appears as irregular patches with NDVI 0.2-0.3 lower than surrounding areas. "
                   "Spreads in wind direction (northeast in Ghana). "
                   "Early detection possible 5-7 days before ground observation. "
                   "Small circular patterns (5-10m) that expand rapidly. "
                   "Monitor neighboring farms - outbreak spreads 2-5km per week.",
            "metadata": {
                "source": "Fall Armyworm Monitoring System",
                "type": "satellite",
                "topic": "pest_detection",
                "crop": "maize"
            }
        },
        
        # Nutrient deficiency patterns
        {
            "text": "Nitrogen deficiency from satellite: NDVI 0.3-0.4 with yellowing pattern "
                   "starting from older leaves. Phosphorus deficiency shows purple coloration "
                   "with NDVI 0.35-0.45. Potassium deficiency appears as edge browning with "
                   "NDVI dropping from edges inward. Iron deficiency shows interveinal "
                   "chlorosis with patchy NDVI reduction.",
            "metadata": {
                "source": "Precision Agriculture Manual",
                "type": "satellite",
                "topic": "nutrient_deficiency",
                "crop": "general"
            }
        },
        
        # Cocoa monitoring
        {
            "text": "Cocoa farm satellite monitoring: Healthy cocoa shows NDVI 0.7-0.85 year-round. "
                   "Black pod disease appears as dark patches with NDVI drop of 0.15-0.20. "
                   "Swollen shoot virus shows progressive NDVI decline over 2-3 months. "
                   "Shade trees should maintain NDVI above 0.8. "
                   "Monitor during wet season for disease outbreak patterns.",
            "metadata": {
                "source": "Ghana Cocoa Board Satellite Guide",
                "type": "satellite",
                "topic": "disease_monitoring",
                "crop": "cocoa"
            }
        },
        
        # Soil moisture interpretation
        {
            "text": "Soil moisture from satellite data: 0-30% is critically dry requiring immediate irrigation. "
                   "30-50% is moderate, monitor closely and prepare irrigation. "
                   "50-70% is optimal for most crops. "
                   "70-85% is good but watch for fungal diseases. "
                   "Above 85% risks waterlogging and root diseases. "
                   "Surface moisture below 25% for 3 days will stress shallow-rooted crops.",
            "metadata": {
                "source": "SMAP Soil Moisture Guidelines",
                "type": "satellite",
                "topic": "soil_moisture",
                "crop": "general"
            }
        },
        
        # Yield prediction
        {
            "text": "Yield prediction using satellite NDVI: "
                   "Peak NDVI during flowering correlates with final yield (R²=0.75). "
                   "Accumulated NDVI from planting to harvest predicts yield. "
                   "Formula: Yield (tons/ha) = 12.5 × Peak_NDVI - 3.2 for maize. "
                   "NDVI below 0.5 at tasseling indicates 30-40% yield loss. "
                   "Compare with 5-year average NDVI for yield forecast.",
            "metadata": {
                "source": "Crop Yield Prediction Model",
                "type": "satellite",
                "topic": "yield_prediction",
                "crop": "maize"
            }
        },
        
        # Drought monitoring
        {
            "text": "Drought stress detection from space: "
                   "VCI (Vegetation Condition Index) below 35% indicates drought stress. "
                   "Temperature Vegetation Dryness Index (TVDI) above 0.6 shows water stress. "
                   "NDVI deviation -20% from 5-year average suggests drought impact. "
                   "Surface temperature 3°C above normal with declining NDVI confirms drought. "
                   "Act when NDVI drops 15% from seasonal normal.",
            "metadata": {
                "source": "Drought Early Warning System",
                "type": "satellite",
                "topic": "drought_monitoring",
                "crop": "general"
            }
        },
        
        # Harvest timing
        {
            "text": "Optimal harvest timing using satellite data: "
                   "Maize ready when NDVI drops to 0.4-0.5 from peak of 0.8. "
                   "Rice harvest when NDVI falls below 0.35. "
                   "Monitor NDVI decline rate - rapid drop may indicate lodging. "
                   "Thermal imagery shows grain moisture - harvest when surface temp rises 2°C. "
                   "Cloud-free image 3 days before harvest helps plan logistics.",
            "metadata": {
                "source": "Harvest Optimization Guide",
                "type": "satellite",
                "topic": "harvest_timing",
                "crop": "general"
            }
        },
        
        # Field boundary detection
        {
            "text": "Farm boundary mapping from satellite: "
                   "NDVI differences of 0.2+ usually indicate field boundaries. "
                   "Sentinel-2 at 10m resolution can detect 0.25 acre plots. "
                   "Best detection during peak growing season when contrast is highest. "
                   "Multi-temporal analysis improves boundary accuracy to 95%. "
                   "Use for accurate farm size calculation and input planning.",
            "metadata": {
                "source": "Precision Farming Manual",
                "type": "satellite",
                "topic": "field_mapping",
                "crop": "general"
            }
        },
        
        # Cloud cover handling
        {
            "text": "Dealing with cloud cover in satellite monitoring: "
                   "Sentinel-2 provides clear images every 5-10 days in dry season. "
                   "Rainy season may have 20-30 day gaps. "
                   "Use radar (Sentinel-1) during cloudy periods - penetrates clouds. "
                   "MODIS daily imagery as backup despite lower resolution. "
                   "Combine multiple satellite sources for continuous monitoring.",
            "metadata": {
                "source": "Satellite Data Fusion Guide",
                "type": "satellite",
                "topic": "cloud_cover",
                "crop": "general"
            }
        },
        
        # Ghana-specific patterns
        {
            "text": "Ghana agricultural patterns from satellite: "
                   "Northern Ghana shows NDVI 0.2-0.4 in dry season (Nov-Mar). "
                   "Southern forest zone maintains NDVI 0.6-0.8 year-round. "
                   "Transition zone NDVI varies 0.3-0.7 seasonally. "
                   "Coastal savanna affected by salt stress shows NDVI below 0.5. "
                   "Volta basin irrigation areas show counter-seasonal NDVI peaks.",
            "metadata": {
                "source": "Ghana Agricultural Atlas",
                "type": "satellite",
                "topic": "regional_patterns",
                "crop": "general"
            }
        },
        
        # Alert thresholds
        {
            "text": "Satellite monitoring alert thresholds: "
                   "CRITICAL: NDVI below 0.3 or 30% drop in 5 days. "
                   "WARNING: NDVI 0.3-0.5 or 20% drop in 7 days. "
                   "WATCH: NDVI declining 10% from seasonal average. "
                   "Surface temperature 5°C above normal triggers heat stress alert. "
                   "Soil moisture below 30% for 5 days triggers irrigation alert.",
            "metadata": {
                "source": "Early Warning System Protocol",
                "type": "satellite",
                "topic": "alert_thresholds",
                "crop": "general"
            }
        },
        
        # Integration with ground data
        {
            "text": "Combining satellite with ground observations: "
                   "Satellite NDVI calibrate with leaf color charts (R²=0.82). "
                   "Soil moisture satellites validate with tensiometer readings. "
                   "Yield prediction improves 25% when combining satellite + farmer reports. "
                   "Use farmer photos to verify satellite anomalies. "
                   "Ground-truth 10% of satellite alerts for accuracy assessment.",
            "metadata": {
                "source": "Integrated Monitoring System",
                "type": "satellite",
                "topic": "ground_validation",
                "crop": "general"
            }
        }
    ]
    
    # Add documents to knowledge base
    success_count = 0
    for i, doc in enumerate(satellite_documents):
        try:
            doc_id = f"satellite_knowledge_{i}_{uuid.uuid4()}"
            kb.add_document(
                document_id=doc_id,
                text=doc["text"],
                metadata=doc["metadata"]
            )
            success_count += 1
            print(f"✅ Added: {doc['metadata']['topic']} - {doc['metadata']['crop']}")
        except Exception as e:
            print(f"❌ Failed to add document {i}: {e}")
    
    print(f"\n📊 Summary: Added {success_count}/{len(satellite_documents)} satellite knowledge documents")
    
    # Test retrieval
    print("\n🧪 Testing satellite knowledge retrieval...")
    test_queries = [
        "NDVI interpretation for crops",
        "How to detect water stress from satellite",
        "Fall armyworm detection using satellite",
        "When to harvest based on NDVI"
    ]
    
    for query in test_queries:
        results = kb.search(query, n_results=1)
        if results:
            print(f"\n✅ Query: '{query}'")
            print(f"   Found: {results[0]['text'][:100]}...")
        else:
            print(f"❌ No results for: '{query}'")
    
    print("\n✨ Satellite knowledge base ready!")
    
    return success_count

if __name__ == "__main__":
    # Run the knowledge addition
    count = add_satellite_knowledge()
    
    if count > 0:
        print(f"\n🎯 Next steps:")
        print("1. Test with: python scripts/test_bot.py")
        print("2. Try queries like:")
        print("   - 'Check my farm with satellite'")
        print("   - 'What does NDVI 0.4 mean?'")
        print("   - 'How to detect pests from satellite'")
        print("3. Run your bot: python run.py")