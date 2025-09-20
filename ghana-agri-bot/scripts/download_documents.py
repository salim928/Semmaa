"""
Download Essential Agricultural Documents
"""
import requests
import json
from pathlib import Path

def download_essential_docs():
    """Download and create essential agricultural documents"""
    
    docs_dir = Path("data/documents")
    
    # 1. COMPREHENSIVE GHANAIAN CROPS GUIDE
    ghana_crops = """
COMPREHENSIVE GHANA CROP PRODUCTION GUIDE

MAIZE PRODUCTION
================
Varieties: Obatanpa, Mamaba, Abontem, Omankwa
Land Preparation: Plough 15-20cm deep, 2-3 weeks before rains
Planting Time: 
- Southern Ghana: Major (March-April), Minor (September)
- Northern Ghana: May-June (single season)
Seed Rate: 20-25 kg/ha
Spacing: 75cm x 25cm (2 seeds/hole) or 90cm x 40cm (2 plants/hill)
Fertilizer Application:
- Basal: NPK 15-15-15 @ 250kg/ha at planting
- Top dress: Urea @ 125kg/ha at 4 weeks or Sulphate of Ammonia @ 250kg/ha
Weed Control: 
- 1st weeding: 2-3 weeks after planting
- 2nd weeding: 6 weeks after planting
- Herbicides: Atrazine (pre-emergence) @ 2.5L/ha
Common Pests: Fall armyworm, stem borers, termites
Diseases: Streak virus, leaf blight, rust
Harvest: 90-120 days, when husks are dry
Expected Yield: 1.5-6.0 tons/ha

COCOA PRODUCTION
================
Varieties: Hybrid varieties, Amazon, Amelonado, Trinitario
Nursery: Raise seedlings for 3-4 months
Land Preparation: Clear land, leave shade trees (18-24 trees/ha)
Planting Time: April-June (beginning of rains)
Spacing: 3m x 3m (1,111 plants/ha)
Shade Management: 
- Temporary: Plantain/banana for first 3 years
- Permanent: Native forest trees
Fertilizer: 
- Young cocoa: NPK 0-22-28 @ 125g/plant/year
- Mature: Asaase Wura fertilizer @ 375g/plant/year
Pruning: 
- Formation: First 2-3 years
- Maintenance: Remove chupons, dead branches
- Sanitary: Remove diseased parts
Common Pests: Mirids (akate), cocoa pod borer
Diseases: 
- Black pod: Spray Ridomil Plus 72WP @ 50g/15L water
- Swollen shoot virus: Remove and burn infected trees
Harvest: Pods mature 5-6 months after pollination
Fermentation: 6-7 days, turn beans every 2 days
Expected Yield: 400-1000 kg/ha

CASSAVA PRODUCTION
==================
Varieties: Agbelifia, Afisiafi, Nkabom, Bankye fitaa, Tek bankye
Land Preparation: Plough or make mounds/ridges
Planting Time: March-April or September-October (onset of rains)
Planting Material: Stem cuttings 20-25cm, 10-12 months old
Spacing: 1m x 1m (10,000 plants/ha)
Fertilizer: NPK 15-15-15 @ 200kg/ha (optional for poor soils)
Weed Control: 
- 1st weeding: 4-6 weeks after planting
- 2nd weeding: 12 weeks after planting
Common Pests: Whitefly, green mite, mealybug
Diseases: 
- Cassava mosaic disease: Use resistant varieties
- Bacterial blight: Use clean planting material
- Root rot: Ensure good drainage
Intercropping: Maize, groundnuts, vegetables
Harvest: 10-24 months depending on variety
Expected Yield: 15-40 tons/ha

TOMATO PRODUCTION
=================
Varieties: Petomech, Power Rano, Pectomech, Tropimech
Nursery: 3-4 weeks before transplanting
Transplanting Time: 
- Southern: Year-round with irrigation
- Northern: November-March (dry season with irrigation)
Spacing: 60cm x 45cm (field), 50cm x 40cm (greenhouse)
Fertilizer:
- Basal: NPK 15-15-15 @ 250kg/ha
- Top dress: Urea @ 125kg/ha at flowering
Irrigation: Every 3-4 days (drip irrigation preferred)
Staking: Required for indeterminate varieties
Common Pests: Fruit worm, whitefly, leaf miner, aphids
Diseases:
- Bacterial wilt: Crop rotation, resistant varieties
- Early/Late blight: Spray Mancozeb @ 40g/15L water
- Viral diseases: Control whitefly vectors
Harvest: 60-90 days after transplanting
Expected Yield: 15-40 tons/ha

RICE PRODUCTION
===============
Varieties: AGRA rice, Jasmine 85, Marshall, Togo Marshall
Ecology Types:
- Irrigated lowland: Year-round with water control
- Rainfed lowland: Valleys, flood plains
- Upland: Well-drained soils
Land Preparation: 
- Lowland: Puddle when flooded
- Upland: Plough and harrow
Planting Time:
- Major season: April-May
- Minor season: September-October
Seed Rate: 
- Broadcasting: 80-100 kg/ha
- Dibbling: 60-80 kg/ha
- Transplanting: 40-60 kg/ha
Spacing:
- Transplanting: 20cm x 20cm
- Dibbling: 20cm x 20cm, 4-5 seeds/hill
Fertilizer:
- Basal: NPK 15-15-15 @ 250kg/ha
- Top dress: Urea @ 125kg/ha at tillering and panicle initiation
Water Management: 
- Maintain 5-10cm water depth
- Drain before harvest
Weed Control:
- Manual: 2-3 times
- Herbicide: Butachlor, Propanil
Common Pests: Stem borers, birds, rodents
Diseases: Rice blast, bacterial leaf blight
Harvest: 120-150 days, when 80% grains are golden
Expected Yield: 2.5-7.0 tons/ha

GROUNDNUT (PEANUT) PRODUCTION
==============================
Varieties: Chinese, Manipintar, Nkatie SARI, Shitaochi
Land Preparation: Plough 15-20cm deep
Planting Time:
- Southern: April-May, September
- Northern: May-June
Seed Rate: 80-100 kg/ha (shelled)
Spacing: 40cm x 15cm or 30cm x 20cm
Inoculation: Rhizobium bacteria for nitrogen fixation
Fertilizer: 
- SSP or TSP @ 125kg/ha at planting
- Gypsum @ 200kg/ha at flowering (for pod filling)
Weed Control: 
- 1st weeding: 3 weeks after planting
- 2nd weeding: 6 weeks after planting
Earthing Up: At flowering to facilitate pegging
Common Pests: Aphids, leaf miner, termites
Diseases:
- Leaf spot: Spray Mancozeb
- Rosette virus: Control aphid vectors
- Aflatoxin: Proper drying and storage
Harvest: 90-120 days, when leaves yellow
Expected Yield: 1.0-3.0 tons/ha

PLANTAIN PRODUCTION
===================
Varieties: Apantu, Apem, Asamienu, Oniaba
Land Preparation: Clear and prepare planting holes
Planting Time: Beginning of rainy season
Planting Material: Sword suckers preferred
Spacing: 3m x 3m (1,111 plants/ha)
Planting Depth: 30cm deep holes
Fertilizer:
- Organic: 20kg compost/manure per hole
- Inorganic: NPK @ 200g/plant split applications
Mulching: Important for moisture retention
De-suckering: Maintain mother, daughter, granddaughter system
Propping: Support plants with bamboo when fruiting
Common Pests: Weevils, nematodes
Diseases:
- Black sigatoka: Remove affected leaves
- Panama disease: Use resistant varieties
Harvest: 12-14 months after planting
Expected Yield: 15-30 tons/ha

YAM PRODUCTION
==============
Varieties: Pona, Laribako, Dente, Water yam
Land Preparation: Make mounds 1m high or ridges
Planting Time: March-April (onset of rains)
Planting Material: Seed yams (200-500g), mini-setts
Spacing: 1m x 1m (10,000 stands/ha)
Fertilizer: NPK 15-15-15 @ 400kg/ha in split doses
Staking: 2m poles for climbing varieties
Weed Control: 3-4 times before canopy closure
Common Pests: Yam beetles, termites, nematodes
Diseases:
- Anthracnose: Use resistant varieties
- Yam mosaic virus: Use clean planting material
- Tuber rot: Good drainage, crop rotation
Harvest: 8-10 months when leaves yellow
Storage: Yam barns, ensure ventilation
Expected Yield: 15-25 tons/ha
"""

    with open(docs_dir / "ghana_crop_guide.txt", "w") as f:
        f.write(ghana_crops)
    print("✅ Created comprehensive Ghana crop guide")

    # 2. PEST AND DISEASE MANAGEMENT
    pest_management = """
INTEGRATED PEST AND DISEASE MANAGEMENT FOR GHANA

FALL ARMYWORM (Spodoptera frugiperda)
======================================
Crops Affected: Maize, rice, sorghum
Identification: 
- Windowing of leaves
- Large ragged holes
- Row of dark spots on larvae
- Inverted Y on head capsule
Monitoring: Scout twice weekly, check 20 plants per acre
Economic Threshold: 20% plants infested
Control Methods:
1. Cultural:
   - Early planting
   - Intercropping with repellent plants
   - Remove crop residues
2. Biological:
   - Neem extract @ 50ml/15L water
   - Bt (Bacillus thuringiensis) sprays
3. Chemical:
   - Emamectin benzoate 5% @ 10ml/15L water
   - Spinetoram @ 6ml/15L water
   - Chlorantraniliprole @ 5ml/15L water
Application: Evening spraying when larvae are active

LARGER GRAIN BORER
===================
Crops: Stored maize and cassava
Identification: 
- Circular holes in grains
- Abundant grain dust
- Sweet smell in storage
Prevention:
- Clean stores before use
- Use hermetic bags
- Solar drying to 12% moisture
Control:
- Diatomaceous earth
- Actellic Super dust @ 50g/100kg grain
- Phostoxin tablets for fumigation

BLACK POD DISEASE (Phytophthora spp.)
=======================================
Crop: Cocoa
Symptoms:
- Brown/black spots on pods
- Spreads to cover entire pod
- White spores in humid conditions
Conditions: High humidity, rainfall
Management:
1. Cultural:
   - Remove infected pods weekly
   - Prune for aeration
   - Harvest regularly
2. Chemical:
   - Ridomil Plus 72WP @ 50g/15L water
   - Nordox 75WP @ 50g/15L water
   - Funguran OH @ 50g/15L water
   - Champion WP @ 60g/15L water
Spray Schedule: Every 3 weeks in rainy season

CASSAVA MOSAIC DISEASE
=======================
Symptoms:
- Mosaic patterns on leaves
- Leaf distortion and reduction
- Stunted growth
- Reduced root yield
Management:
- Use resistant varieties (IFAD, Bankye hemaa)
- Use clean planting material
- Remove infected plants
- Control whitefly vectors

TOMATO BACTERIAL WILT
======================
Pathogen: Ralstonia solanacearum
Symptoms:
- Wilting without yellowing
- Brown discoloration in stems
- Plant death in 2-3 days
Management:
- Crop rotation (3-4 years)
- Raised beds with good drainage
- Grafting on resistant rootstock
- Soil solarization

STRIGA (Witchweed)
==================
Crops: Maize, sorghum, millet
Identification: Purple/pink flowers, parasitic
Control:
- Hand pulling before flowering
- Trap crops (cotton, sunflower)
- Resistant varieties
- Imazapyr-coated seeds
- Improve soil fertility

PEST CALENDAR FOR MAJOR CROPS
==============================
MAIZE:
- Planting-2 weeks: Cutworms
- 2-6 weeks: Fall armyworm  
- 6-10 weeks: Stem borers
- Tasseling: Aphids
- Storage: Weevils, LGB

TOMATO:
- Nursery: Damping off
- 2-4 weeks: Whitefly, aphids
- Flowering: Fruit worm
- Fruiting: Tuta absoluta

SAFE PESTICIDE USE
==================
1. Read label instructions
2. Wear protective clothing
3. Spray early morning or evening
4. Don't spray during flowering
5. Observe pre-harvest intervals:
   - Vegetables: 7-14 days
   - Cereals: 14-21 days
   - Fruits: 14-30 days
6. Triple rinse containers
7. Store away from children
"""
    
    with open(docs_dir / "pest_disease_management.txt", "w") as f:
        f.write(pest_management)
    print("✅ Created pest and disease management guide")

    # 3. SOIL AND FERTILIZER GUIDE
    soil_guide = """
GHANA SOIL TYPES AND FERTILIZER RECOMMENDATIONS

MAJOR SOIL TYPES IN GHANA
==========================
1. FOREST OCHROSOLS (Forest Zone)
   - Characteristics: Well-drained, acidic (pH 4.5-6.0)
   - Nutrients: Low N, P, moderate K
   - Crops: Cocoa, oil palm, citrus, cassava
   - Management: Add lime, organic matter

2. SAVANNA OCHROSOLS (Savanna Zone)
   - Characteristics: Sandy loam, low organic matter
   - Nutrients: Very low N, P, K
   - Crops: Maize, sorghum, groundnuts, cotton
   - Management: Crop rotation, add compost

3. GROUNDWATER LATERITES
   - Characteristics: High iron, poor drainage
   - Limitations: Hard pan formation
   - Management: Deep ploughing, organic matter

FERTILIZER CALCULATIONS
========================
Formula: Fertilizer needed = (Recommended rate × Field size) ÷ 100

Example for 2 acres maize:
- NPK 15-15-15 @ 250kg/ha
- 2 acres = 0.8 ha
- Need: 250 × 0.8 = 200kg

ORGANIC FERTILIZERS
===================
COMPOST PREPARATION:
Materials:
- Green: Fresh grass, kitchen waste
- Brown: Dry leaves, sawdust
- Activator: Poultry manure
Method:
1. Layer green and brown (1:3 ratio)
2. Add water to 60% moisture
3. Turn every 2 weeks
4. Ready in 2-3 months

Application Rates:
- Vegetables: 20 tons/ha
- Maize: 10 tons/ha
- Tree crops: 10kg/tree

LIQUID FERTILIZERS
==================
1. COMPOST TEA:
   - 1 part compost: 5 parts water
   - Steep for 3 days
   - Strain and spray

2. FISH EMULSION:
   - Fish waste + water
   - Ferment 2 weeks
   - Dilute 1:10 before use

3. NEEM FERTILIZER:
   - Neem leaves + water
   - Ferment 1 week
   - Acts as fertilizer + pesticide

FERTILIZER SCHEDULE BY CROP
============================
MAIZE:
- Planting: NPK 15-15-15 @ 125kg/ha
- 4 weeks: Urea @ 65kg/ha
- 7 weeks: Urea @ 60kg/ha

RICE:
- Basal: NPK 15-15-15 @ 250kg/ha
- Tillering: Urea @ 65kg/ha
- Panicle: Urea @ 60kg/ha

TOMATO:
- Transplant: NPK 15-15-15 @ 250kg/ha
- 3 weeks: Urea @ 125kg/ha
- Flowering: 0-22-28 @ 125kg/ha

SIGNS OF NUTRIENT DEFICIENCY
=============================
NITROGEN (N):
- Yellowing of older leaves
- Stunted growth
- Solution: Apply urea or ammonium

PHOSPHORUS (P):
- Purple coloration
- Delayed maturity
- Solution: Apply SSP or TSP

POTASSIUM (K):
- Brown leaf edges
- Weak stems
- Solution: Apply MOP or SOP

CALCIUM:
- Blossom end rot (tomato)
- Tip burn
- Solution: Apply gypsum or lime

LIMING RECOMMENDATIONS
======================
When pH < 5.5, apply lime:
- Agricultural lime: 2-4 tons/ha
- Apply 2-4 weeks before planting
- Incorporate into soil
"""

    with open(docs_dir / "soil_fertilizer_guide.txt", "w") as f:
        f.write(soil_guide)
    print("✅ Created soil and fertilizer guide")

    # 4. SEASONAL CALENDAR
    seasonal_calendar = {
        "calendar": {
            "Southern Ghana": {
                "January": ["Land preparation", "Nursery preparation for vegetables"],
                "February": ["Continue land preparation", "Plant vegetables"],
                "March": ["Plant maize, cassava, yam (major season)", "Apply pre-emergence herbicides"],
                "April": ["Plant rice, groundnuts", "First weeding", "Plant cocoa seedlings"],
                "May": ["Fertilizer application", "Pest scouting"],
                "June": ["Second weeding", "Apply pesticides if needed"],
                "July": ["Harvest early maize", "Plant minor season vegetables"],
                "August": ["Land preparation for minor season"],
                "September": ["Plant maize, vegetables (minor season)"],
                "October": ["Weed control", "Harvest major season crops"],
                "November": ["Harvest rice", "Start cocoa harvest"],
                "December": ["Continue harvest", "Storage preparation"]
            },
            "Northern Ghana": {
                "January": ["Land preparation", "Repair storage facilities"],
                "February": ["Continue land preparation"],
                "March": ["Wait for rains"],
                "April": ["Watch for rain onset"],
                "May": ["Plant with first rains - maize, groundnuts, sorghum"],
                "June": ["Complete planting", "First weeding"],
                "July": ["Fertilizer application", "Second weeding"],
                "August": ["Pest management", "Third weeding"],
                "September": ["Monitor crops", "Harvest early varieties"],
                "October": ["Main harvest period"],
                "November": ["Complete harvest", "Storage"],
                "December": ["Marketing", "Land preparation for dry season"]
            }
        }
    }

    with open(docs_dir / "seasonal_calendar.json", "w") as f:
        json.dump(seasonal_calendar, f, indent=2)
    print("✅ Created seasonal calendar")

    print(f"\n✅ All documents created in {docs_dir}")
    print("Now run: python scripts/load_documents.py")

if __name__ == "__main__":
    download_essential_docs()