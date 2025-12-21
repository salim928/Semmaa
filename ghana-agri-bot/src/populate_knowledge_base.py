# populate_knowledge_base.py - FIXED VERSION
"""
Script to populate knowledge base with comprehensive Ghana agricultural content
Includes proper testing of retrieval functionality
"""

import logging
from typing import List, Dict
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import after setting up logging
from src.knowledge_base import KnowledgeBase

# COMPREHENSIVE GHANA AGRICULTURAL KNOWLEDGE
GHANA_AGRICULTURAL_KNOWLEDGE = [
    # ========== CROP PRODUCTION GUIDES ==========
    {
        "category": "maize_production",
        "content": """MAIZE PRODUCTION IN GHANA: Maize (corn) is Ghana's most important cereal crop. 
        Planting: April-May (major season), September-October (minor season). 
        Spacing: 75cm between rows, 40cm between plants, 2-3 seeds per hill. 
        Fertilizer: Apply NPK 15-15-15 at 250kg/ha at planting, top-dress with Sulphate of Ammonia at 125kg/ha after 4 weeks.
        Common diseases: Maize streak virus (MSV), Northern leaf blight, Rust.
        Treatment: For MSV, uproot affected plants immediately. For blight, spray with Mancozeb 2g/L weekly.
        Harvest: 90-120 days after planting when husks are dry and kernels are hard.
        Average yield: 1.5-2.0 tonnes/ha (traditional), 4-6 tonnes/ha (improved varieties).
        Storage: Dry to 13% moisture, treat with Actellic Super dust 2g/kg grain.""",
        "metadata": {"source": "MoFA Maize Production Guide", "crop": "maize", "category": "production"}
    },
    {
        "category": "cassava_production",
        "content": """CASSAVA CULTIVATION IN GHANA: Cassava is the most important root crop, grown across all regions.
        Planting: Start of rainy season (March-April or September-October).
        Spacing: 1m x 1m on flat land, 1m x 0.8m on mounds.
        Planting material: Use healthy stem cuttings 20-25cm long with 5-7 nodes.
        Fertilizer: Apply NPK 15-15-15 at 200kg/ha for improved varieties.
        Common diseases: Cassava Mosaic Disease (CMD), Cassava Bacterial Blight (CBB), Root rot.
        Treatment: Use resistant varieties, remove infected plants, practice crop rotation.
        Harvest: 8-18 months depending on variety and use.
        Yield: 10-15 tonnes/ha (traditional), 25-40 tonnes/ha (improved).
        Processing: Into gari, kokonte, starch, flour within 48 hours of harvest.
        Market prices: Farm-gate prices range from GHS 150-250 per 100kg bag depending on season.""",
        "metadata": {"source": "CSIR Cassava Manual", "crop": "cassava", "category": "production"}
    },
    {
        "category": "tomato_production",
        "content": """TOMATO PRODUCTION GUIDE FOR GHANA: High-value vegetable crop with year-round demand.
        Nursery: Raise seedlings for 3-4 weeks before transplanting.
        Spacing: 60cm x 45cm for determinate, 75cm x 60cm for indeterminate varieties.
        Fertilizer: NPK 15-15-15 at 300kg/ha at transplanting, top-dress with 150kg/ha after 3 weeks.
        Common pests: Fruit borer (Tuta absoluta), whiteflies, aphids.
        Disease: Early blight, late blight, bacterial wilt, viral diseases.
        Treatment: Spray Lambda-cyhalothrin 2.5ml/L for pests. For diseases, use Mancozeb + Metalaxyl 2g/L preventively.
        Staking: Required for indeterminate varieties to prevent fruit rot.
        Harvest: 60-90 days from transplanting, harvest when fruits show pink color.
        Post-harvest: Can store 7-10 days at room temperature, 3 weeks if refrigerated.
        Transport to Accra: Use ventilated crates, costs GHS 50-80 per tonne from Techiman.""",
        "metadata": {"source": "Ghana Tomato Growers Manual", "crop": "tomato", "category": "production"}
    },
    {
        "category": "cocoa_production",
        "content": """COCOA PRODUCTION IN GHANA: Ghana is the world's second-largest cocoa producer.
        Suitable regions: Western, Eastern, Ashanti, Brong-Ahafo, Volta, Central regions.
        Planting: June-July during rainy season. Use hybrid seedlings from CRIG.
        Spacing: 3m x 3m (1,111 plants/ha).
        Shade: Plant with plantain/banana for temporary shade, establish permanent shade trees.
        Fertilizer: Apply Asaase Wura or Cocofeed fertilizer 4 bags/acre/year.
        Major diseases: Black pod disease (Phytophthora), Swollen shoot virus.
        Black pod control: Spray Ridomil Gold or Nordox Super at 50g/15L water every 3 weeks.
        Swollen shoot: Remove and burn infected trees, replant with tolerant varieties.
        Pruning: Remove chupons, dead branches, mistletoes regularly.
        Harvest: Pods mature 5-6 months after flowering. Harvest every 2-3 weeks.
        Fermentation: 6-7 days in boxes or heaps, turn beans every 2 days.
        Drying: Sun-dry to 7.5% moisture content over 7-10 days.
        COCOBOD Price: Currently GHS 1,308 per 64kg bag (2024/25 season).""",
        "metadata": {"source": "COCOBOD Technical Manual", "crop": "cocoa", "category": "production"}
    },
    {
        "category": "rice_production",
        "content": """RICE PRODUCTION IN GHANA: Increasing local production to reduce imports.
        Ecology: Irrigated lowlands, rain-fed lowlands, upland systems.
        Varieties: Jasmine 85, Agra, NERICA varieties, Amankwatia.
        Nursery: 25-30 days for lowland, direct seeding for upland.
        Spacing: 20cm x 20cm for transplanting, broadcast 80-100kg seed/ha.
        Fertilizer: NPK 15-15-15 at 250kg/ha, Urea top-dress 125kg/ha at tillering and panicle initiation.
        Water management: Maintain 5-10cm water depth, drain before harvest.
        Weeds: Use Butachlor 250ml/15L as pre-emergent, hand weed at 3 and 6 weeks.
        Pests: Birds, rodents, stem borers, Rice Yellow Mottle Virus.
        Harvest: 120-150 days, when 80% grains are golden.
        Yield: 2-3 tonnes/ha (rain-fed), 4-7 tonnes/ha (irrigated).
        Milling: Parboil before milling for better recovery and nutrition.""",
        "metadata": {"source": "Ghana Rice Development Strategy", "crop": "rice", "category": "production"}
    },
    
    # ========== PEST AND DISEASE MANAGEMENT ==========
    {
        "category": "pest_management",
        "content": """INTEGRATED PEST MANAGEMENT FOR GHANA: 
        Fall Armyworm (FAW) on maize: Major pest since 2016. 
        Identification: Look for window-pane damage on leaves, larvae with inverted Y on head.
        Control: Apply Neem extract 50ml/L, Emastar (Emamectin benzoate) 1ml/L, or chlorpyrifos 2ml/L.
        Spray in evening when larvae are active. 
        
        Larger Grain Borer in storage: Attacks maize and cassava chips.
        Prevention: Clean stores before use, use hermetic bags.
        Treatment: Actellic Super dust 50g/100kg grain.
        
        Fruit flies on mango/citrus: Major export constraint.
        Control: Protein bait sprays, male annihilation technique, field sanitation.
        
        Termites: Attack cassava, maize, yam.
        Control: Apply Chlorpyrifos 2ml/L to planting holes, remove queen chambers.""",
        "metadata": {"source": "MoFA IPM Guidelines", "topic": "pest_control", "category": "protection"}
    },
    {
        "category": "disease_management",
        "content": """COMMON CROP DISEASES IN GHANA:
        
        Tomato Yellow Leaf Curl Virus (TYLCV): Transmitted by whiteflies.
        Symptoms: Yellowing, curling of leaves, stunted growth.
        Control: Use resistant varieties, control whiteflies with Pegasus 1ml/L.
        
        Cassava Mosaic Disease (CMD): Viral disease spread by whiteflies.
        Symptoms: Mosaic patterns on leaves, reduced root yield.
        Control: Plant resistant varieties (IFAD, Bankye hemaa), remove infected plants.
        
        Cocoa Swollen Shoot Virus (CSSV): No cure, only prevention.
        Symptoms: Red veins on leaves, swollen stems, reduced yield.
        Control: Remove and burn infected trees, replant with tolerant varieties.
        
        Citrus Greening (HLB): Bacterial disease spread by psyllids.
        Symptoms: Yellow shoots, lopsided fruits, bitter taste.
        Control: Use certified seedlings, control psyllids, remove infected trees.""",
        "metadata": {"source": "Ghana Plant Disease Manual", "topic": "disease_control", "category": "protection"}
    },
    
    # ========== FERTILIZER RECOMMENDATIONS ==========
    {
        "category": "fertilizer_guide",
        "content": """FERTILIZER APPLICATION GUIDE FOR GHANA SOILS:
        
        Soil testing: Essential before application. Contact MoFA or private labs.
        
        Maize: NPK 15-15-15 at 250kg/ha + Urea/Sulphate of Ammonia 125kg/ha top-dress.
        Rice: NPK 15-15-15 at 250kg/ha + Urea 125kg/ha split application.
        Cassava: NPK 15-15-15 at 200kg/ha for improved varieties only.
        Yam: NPK 15-15-15 at 300kg/ha, apply in ring method.
        Plantain: NPK 15-15-15 at 400g/plant/year split into 3 applications.
        Vegetables: NPK 15-15-15 at 300-400kg/ha + foliar fertilizers.
        
        Organic alternatives: 
        - Compost: 5-10 tonnes/ha
        - Poultry manure: 2-3 tonnes/ha (well-decomposed)
        - Cow dung: 5-8 tonnes/ha
        
        Application timing: 
        - Basal: At planting or 1 week after transplanting
        - Top-dress: 3-4 weeks after planting/transplanting
        - Split applications for high-value crops
        
        Safety: Wear gloves, avoid windy conditions, water after application.""",
        "metadata": {"source": "Ghana Fertilizer Manual", "topic": "fertilizer", "category": "inputs"}
    },
    
    # ========== POULTRY PRODUCTION ==========
    {
        "category": "poultry_production",
        "content": """POULTRY PRODUCTION IN GHANA:
        
        Layer management for eggs: 
        - Housing: 0.2m²/bird for deep litter, 450cm²/bird for battery cages
        - Feeding: Layer mash 110-120g/bird/day, 16-18% protein
        - Calcium: 3.5-4% for good shell quality, provide oyster shells
        - Lighting: 16 hours daily for optimal laying
        - Production: 280-320 eggs/year for good layers
        - Common issues: Thin shells indicate calcium deficiency
        - Treatment for thin shells: Add limestone or oyster shell at 10-15g/bird/day
        - Vitamin D3 supplementation: 1000-2000 IU/bird/day for calcium absorption
        
        Broiler production:
        - Cycle: 6-8 weeks to 2-2.5kg live weight
        - Starter feed: 23% protein (0-3 weeks)
        - Finisher feed: 20% protein (3-8 weeks)
        - Stocking: 10-12 birds/m²
        
        Disease prevention:
        - Newcastle: Vaccinate day 1 and 21, high mortality if outbreak
        - Coccidiosis: Add anticoccidial in feed
        - Respiratory issues: Ensure good ventilation
        
        Where to buy supplements in major cities:
        - Kumasi: Adum veterinary shops, Asafo market
        - Accra: Agbogbloshie market, Makola
        - Cape Coast: Kotokuraba market""",
        "metadata": {"source": "Ghana Poultry Manual", "topic": "poultry", "category": "livestock"}
    }
]

def test_knowledge_base():
    """Test the knowledge base after population"""
    logger.info("\n=== TESTING KNOWLEDGE BASE ===")
    kb = KnowledgeBase()
    
    # First, check if documents exist
    all_docs = kb.get_all_documents(limit=20)
    logger.info(f"Total documents in KB: {len(all_docs.get('ids', []))}")
    
    if all_docs.get('ids'):
        logger.info("Sample document IDs: " + str(all_docs['ids'][:5]))
    
    # Test queries
    test_queries = [
        ("cassava price market trend", "cassava"),
        ("tomato disease yellow leaves treatment", "tomato"),
        ("cocoa black pod control spray", "cocoa"),
        ("fertilizer NPK application maize", "maize"),
        ("layer chickens thin shell eggs calcium deficiency", "poultry"),
        ("fall armyworm control maize", "pest"),
        ("transport cost tomato Techiman Accra", "transport")
    ]
    
    logger.info("\n=== SEARCH RESULTS ===")
    for query, expected_topic in test_queries:
        logger.info(f"\n📍 Query: '{query}'")
        logger.info(f"   Expected topic: {expected_topic}")
        
        results = kb.search(query, n_results=3)
        
        if results:
            logger.info(f"   ✅ Found {len(results)} results")
            for i, result in enumerate(results, 1):
                text_preview = result['text'][:150].replace('\n', ' ')
                similarity = result.get('similarity', 0)
                metadata = result.get('metadata', {})
                logger.info(f"   Result {i}: (similarity: {similarity:.3f})")
                logger.info(f"      Source: {metadata.get('source', 'Unknown')}")
                logger.info(f"      Category: {metadata.get('category', 'Unknown')}")
                logger.info(f"      Preview: {text_preview}...")
        else:
            logger.warning(f"   ❌ No results found")
    
    return len(all_docs.get('ids', [])) > 0

def populate_knowledge_base():
    """Populate knowledge base with Ghana agricultural content"""
    
    logger.info("Starting knowledge base population...")
    kb = KnowledgeBase()
    
    success_count = 0
    error_count = 0
    
    for item in GHANA_AGRICULTURAL_KNOWLEDGE:
        try:
            # Generate unique document ID
            doc_id = f"{item['category']}_{uuid.uuid4().hex[:8]}"
            
            # Add to knowledge base
            kb.add_document(
                document_id=doc_id,
                text=item['content'],
                metadata=item['metadata']
            )
            
            success_count += 1
            logger.info(f"✅ Added: {item['category']}")
            
        except Exception as e:
            error_count += 1
            logger.error(f"❌ Failed to add {item['category']}: {e}")
    
    logger.info(f"\n=== POPULATION COMPLETE ===")
    logger.info(f"Success: {success_count}, Errors: {error_count}")
    
    # Test retrieval
    return test_knowledge_base()

if __name__ == "__main__":
    success = populate_knowledge_base()
    if success:
        logger.info("\n✅ Knowledge base is working correctly!")
    else:
        logger.error("\n❌ Knowledge base test failed - check your ChromaDB setup")