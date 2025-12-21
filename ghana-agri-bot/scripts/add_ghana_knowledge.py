"""
Add comprehensive Ghana-specific agricultural knowledge
"""

import json
from pathlib import Path
from datetime import datetime

def create_ghana_knowledge_base():
    """Create comprehensive Ghana-specific agricultural knowledge"""
    
    knowledge_base = {
        "ghana_regions": {
            "Greater Accra": {
                "climate": "Coastal savanna",
                "rainfall": "750-1200mm annually",
                "seasons": {
                    "dry_season": "November to March",
                    "wet_season": "April to October",
                    "peak_rains": "May to July"
                },
                "major_crops": ["Maize", "Cassava", "Vegetables", "Coconut"],
                "soil_types": ["Sandy loam", "Clay"],
                "challenges": ["Urban expansion", "Salt water intrusion", "Land scarcity"]
            },
            "Ashanti": {
                "climate": "Forest zone",
                "rainfall": "1200-2100mm annually", 
                "seasons": {
                    "major_season": "April to July",
                    "minor_season": "September to November",
                    "dry_season": "December to March"
                },
                "major_crops": ["Cocoa", "Plantain", "Yam", "Cassava", "Maize"],
                "soil_types": ["Forest Ochrosols", "Oxysols"],
                "challenges": ["Deforestation", "Soil degradation", "Climate variability"]
            },
            "Northern": {
                "climate": "Sudan savanna",
                "rainfall": "750-1100mm annually",
                "seasons": {
                    "rainy_season": "May to October", 
                    "dry_season": "November to April",
                    "harmattan": "December to February"
                },
                "major_crops": ["Maize", "Millet", "Sorghum", "Yam", "Rice", "Cowpea"],
                "soil_types": ["Savanna Ochrosols", "Groundwater laterite"],
                "challenges": ["Drought", "Soil erosion", "Short growing season"]
            },
            "Upper East": {
                "climate": "Sudan savanna",
                "rainfall": "950-1150mm annually",
                "seasons": {
                    "rainy_season": "May to September",
                    "dry_season": "October to April"
                },
                "major_crops": ["Millet", "Sorghum", "Rice", "Groundnut", "Cowpea"],
                "soil_types": ["Savanna Ochrosols", "Lithosols"],
                "challenges": ["Erratic rainfall", "Soil fertility decline", "Land degradation"]
            },
            "Upper West": {
                "climate": "Sudan savanna",
                "rainfall": "840-1400mm annually",
                "major_crops": ["Maize", "Millet", "Sorghum", "Yam", "Cowpea"],
                "challenges": ["Irregular rainfall", "Soil nutrient depletion"]
            },
            "Western": {
                "climate": "High forest zone",
                "rainfall": "1200-2000mm annually",
                "major_crops": ["Cocoa", "Oil Palm", "Rubber", "Plantain", "Cassava"],
                "challenges": ["Deforestation", "Soil acidity"]
            },
            "Central": {
                "climate": "Forest-savanna transition",
                "rainfall": "1000-1400mm annually",
                "major_crops": ["Cassava", "Maize", "Cocoa", "Oil Palm"],
                "challenges": ["Coastal erosion", "Saltwater intrusion"]
            },
            "Eastern": {
                "climate": "Forest zone", 
                "rainfall": "1250-1750mm annually",
                "major_crops": ["Cocoa", "Oil Palm", "Cassava", "Plantain", "Yam"],
                "challenges": ["Deforestation", "Land degradation"]
            },
            "Volta": {
                "climate": "Forest-savanna transition",
                "rainfall": "800-1400mm annually",
                "major_crops": ["Maize", "Cassava", "Yam", "Rice"],
                "challenges": ["Irregular rainfall", "Volta Lake flooding"]
            },
            "Brong Ahafo": {
                "climate": "Forest-savanna transition",
                "rainfall": "1200-1400mm annually", 
                "major_crops": ["Maize", "Yam", "Cassava", "Cocoa", "Cashew"],
                "challenges": ["Deforestation", "Bush fires"]
            }
        },
        
        "seasonal_calendar": {
            "January": {
                "activities": ["Land preparation", "Bush burning", "Cocoa harvesting"],
                "plantable_crops": ["Vegetables (tomato, pepper)", "Rice (irrigated)"],
                "weather": "Dry, harmattan winds",
                "advice": "Good time for land clearing and equipment maintenance"
            },
            "February": {
                "activities": ["Continued land preparation", "Seedbed preparation"],
                "plantable_crops": ["Rice (irrigated)", "Vegetables"],
                "weather": "Hot and dry",
                "advice": "Prepare for planting season, check seed quality"
            },
            "March": {
                "activities": ["Early planting preparation", "Seed procurement"],
                "plantable_crops": ["Early maize", "Yam", "Vegetables"],
                "weather": "Hot, occasional early rains",
                "advice": "Time to plant yam and prepare for major season"
            },
            "April": {
                "activities": ["Major season planting begins"],
                "plantable_crops": ["Maize", "Rice", "Cowpea", "Groundnut", "Vegetables"],
                "weather": "Rains begin",
                "advice": "Plant immediately after first reliable rains"
            },
            "May": {
                "activities": ["Peak planting season", "Weeding"],
                "plantable_crops": ["Maize", "Rice", "Cassava", "Plantain"],
                "weather": "Heavy rains",
                "advice": "Ensure good drainage, watch for pests"
            },
            "June": {
                "activities": ["Weeding", "Fertilizer application", "Pest control"],
                "plantable_crops": ["Late season maize", "Vegetables"],
                "weather": "Peak rains",
                "advice": "Critical time for crop care and pest management"
            },
            "July": {
                "activities": ["Weeding", "Disease management"],
                "plantable_crops": ["Minor season preparation"],
                "weather": "Heavy rains continue",
                "advice": "Monitor for fungal diseases, ensure proper drainage"
            },
            "August": {
                "activities": ["Harvesting early crops", "Storage preparation"],
                "plantable_crops": ["Minor season crops"],
                "weather": "Rains begin to reduce",
                "advice": "Harvest and store crops properly to avoid post-harvest losses"
            },
            "September": {
                "activities": ["Minor season planting", "Harvesting"],
                "plantable_crops": ["Maize", "Cowpea", "Vegetables"],
                "weather": "Moderate rains",
                "advice": "Good time for second season planting in forest zone"
            },
            "October": {
                "activities": ["Harvesting", "Field clearing for next season"],
                "plantable_crops": ["Vegetables", "Rice (in some areas)"],
                "weather": "Rains ending",
                "advice": "Focus on harvesting and post-harvest handling"
            },
            "November": {
                "activities": ["Major harvesting season", "Storage"],
                "plantable_crops": ["Dry season vegetables"],
                "weather": "Dry season begins",
                "advice": "Ensure proper drying and storage of grains"
            },
            "December": {
                "activities": ["Storage", "Marketing", "Land preparation"],
                "plantable_crops": ["Irrigated crops", "Vegetables"],
                "weather": "Cool and dry",
                "advice": "Good time for equipment maintenance and planning"
            }
        },
        
        "crop_varieties": {
            "Maize": {
                "local_varieties": {
                    "Abontem": {
                        "maturity": "90 days",
                        "characteristics": "Drought tolerant, yellow kernels",
                        "best_regions": ["Northern", "Upper East", "Upper West"]
                    },
                    "Mamaba": {
                        "maturity": "85 days", 
                        "characteristics": "Early maturing, white kernels",
                        "best_regions": ["All regions"]
                    },
                    "Obatanpa": {
                        "maturity": "95 days",
                        "characteristics": "High protein, orange kernels",
                        "best_regions": ["Forest and transition zones"]
                    }
                },
                "planting_tips": {
                    "spacing": "75cm x 25cm",
                    "seed_rate": "25kg per hectare",
                    "fertilizer": "NPK 15-15-15 at planting, Urea top-dress at 6 weeks"
                }
            },
            "Cassava": {
                "local_varieties": {
                    "Ampong": {
                        "maturity": "8-12 months",
                        "characteristics": "High yielding, disease resistant"
                    },
                    "Adira": {
                        "maturity": "10-12 months", 
                        "characteristics": "Good for gari production"
                    }
                },
                "planting_tips": {
                    "spacing": "1m x 1m",
                    "stake_length": "20-25cm",
                    "fertilizer": "NPK 15-15-15 at 2 months after planting"
                }
            }
        },
        
        "pest_and_diseases": {
            "Maize": {
                "Fall Armyworm": {
                    "local_name": "Army worm",
                    "symptoms": "Holes in leaves, frass in whorl",
                    "control": {
                        "biological": "Neem extract, Bt spray",
                        "cultural": "Early planting, resistant varieties",
                        "chemical": "Emamectin benzoate when severe"
                    }
                },
                "Maize Streak Virus": {
                    "symptoms": "Yellow streaks on leaves",
                    "control": {
                        "cultural": "Plant resistant varieties, control leafhoppers",
                        "prevention": "Use certified seeds"
                    }
                }
            },
            "Cassava": {
                "Cassava Mosaic Disease": {
                    "symptoms": "Yellow mosaic patterns on leaves",
                    "control": {
                        "cultural": "Use healthy planting material, remove infected plants",
                        "resistant_varieties": ["Tek-Bankye", "Ampong"]
                    }
                }
            }
        },
        
        "local_solutions": {
            "organic_pesticides": {
                "Neem spray": {
                    "ingredients": "Neem leaves/seeds, soap, water",
                    "preparation": "Grind neem, soak 24hrs, strain, add soap",
                    "uses": "Most insects and fungal diseases"
                },
                "Pepper spray": {
                    "ingredients": "Hot pepper, garlic, onion, soap, water", 
                    "preparation": "Blend ingredients, strain, dilute",
                    "uses": "Caterpillars, aphids"
                }
            },
            "local_fertilizers": {
                "Compost": {
                    "materials": "Crop residues, animal manure, kitchen waste",
                    "method": "Layer materials, turn regularly, ready in 3-4 months"
                },
                "Poultry manure": {
                    "application": "2-3 tons per hectare",
                    "timing": "Apply 2 weeks before planting"
                }
            }
        }
    }
    
    return knowledge_base

def save_ghana_knowledge():
    """Save Ghana knowledge to files"""
    knowledge = create_ghana_knowledge_base()
    
    # Create documents directory
    docs_dir = Path("data/documents/ghana_specific")
    docs_dir.mkdir(parents=True, exist_ok=True)
    
    # Save different sections as separate documents
    for section_name, section_data in knowledge.items():
        doc_file = docs_dir / f"{section_name}.json"
        with open(doc_file, "w", encoding="utf-8") as f:
            json.dump(section_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {section_name} knowledge")
    
    # Create searchable text documents
    create_searchable_documents(knowledge)

def create_searchable_documents(knowledge):
    """Create text documents optimized for vector search"""
    docs_dir = Path("data/documents/searchable")
    docs_dir.mkdir(parents=True, exist_ok=True)
    
    # Regional farming guides
    for region, data in knowledge["ghana_regions"].items():
        content = f"""
# {region} Region Farming Guide

## Climate and Weather
- Climate Type: {data.get('climate', 'N/A')}
- Annual Rainfall: {data.get('rainfall', 'N/A')}

## Major Crops
{', '.join(data.get('major_crops', []))}

## Soil Types  
{', '.join(data.get('soil_types', []))}

## Challenges and Solutions
{', '.join(data.get('challenges', []))}
"""
        
        with open(docs_dir / f"{region.lower().replace(' ', '_')}_guide.txt", "w") as f:
            f.write(content)
    
    # Seasonal calendar document
    seasonal_content = "# Ghana Seasonal Farming Calendar\n\n"
    for month, data in knowledge["seasonal_calendar"].items():
        seasonal_content += f"""
## {month}
**Weather:** {data.get('weather', 'N/A')}
**Main Activities:** {', '.join(data.get('activities', []))}
**Crops to Plant:** {', '.join(data.get('plantable_crops', []))}
**Farming Advice:** {data.get('advice', 'N/A')}
"""
    
    with open(docs_dir / "seasonal_calendar.txt", "w") as f:
        f.write(seasonal_content)
    
    print("✅ Created searchable documents")

if __name__ == "__main__":
    print("🇬🇭 Adding Ghana-specific agricultural knowledge...")
    save_ghana_knowledge()
    print("✅ Ghana knowledge base updated!")