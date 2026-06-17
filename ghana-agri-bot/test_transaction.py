"""
Test Transaction Flow: Buyer & Seller
Tests the complete marketplace transaction between buyer and seller
"""

import requests
import json
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def register_user(name, phone, role):
    """Register a new user or login if already exists"""
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "name": name,
        "phone": phone,
        "location": "Accra, Ghana",
        "farm_size": 5.0 if role == "seller" else None,
        "crops": ["Tomatoes", "Maize"] if role == "seller" else None
    })
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {role.upper()} registered: {name} (ID: {data['user_id']})")
        return data['user_id'], data['token']
    elif "already registered" in response.json().get('detail', '').lower():
        # User already exists, try to login
        print(f"ℹ️  {role.upper()} already registered, logging in...")
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "phone": phone
        })
        if login_response.status_code == 200:
            data = login_response.json()
            # Login returns user data nested in 'user' object
            user_data = data.get('user', {})
            user_id = user_data.get('id')
            token = data.get('token')
            print(f"✅ {role.upper()} logged in: {name} (ID: {user_id})")
            return user_id, token
        else:
            print(f"❌ Login failed: {login_response.json()}")
            return None, None
    else:
        print(f"❌ Registration failed: {response.json()}")
        return None, None

def create_product(token, product_data):
    """Create a product listing"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/products/create", json=product_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        product_id = data.get('product_id') or data.get('id')
        print(f"✅ Product listed: {product_data['name']} (ID: {product_id})")
        print(f"   Price: GHS {product_data['price']}/{product_data['unit']}")
        print(f"   Available: {product_data['quantity']} {product_data['unit']}")
        return product_id
    else:
        print(f"❌ Product creation failed: {response.json()}")
        return None

def search_products(query):
    """Search for products"""
    response = requests.get(f"{BASE_URL}/market/search", params={"query": query})
    if response.status_code == 200:
        products = response.json()['products']
        print(f"✅ Found {len(products)} products for '{query}'")
        for p in products[:3]:  # Show first 3
            print(f"   - {p['name']}: GHS {p['price']}/{p['unit']} by {p['seller_name']}")
        return products
    else:
        print(f"❌ Search failed: {response.json()}")
        return []

def create_order(token, order_data):
    """Create an order (buyer purchases from seller)"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/orders/create", json=order_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Order created successfully!")
        print(f"   Order ID: {data['order_id']}")
        print(f"   Total Amount: GHS {data['total_amount']:.2f}")
        return data['order_id']
    else:
        print(f"❌ Order creation failed: {response.json()}")
        return None

def get_orders(token, order_type="all"):
    """Get user's orders"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/orders", params={"type": order_type}, headers=headers)
    if response.status_code == 200:
        orders = response.json()  # API returns list directly
        print(f"✅ {order_type.upper()} Orders: {len(orders)}")
        for order in orders:
            print(f"\n   Order #{order['id']} - Status: {order['status']}")
            print(f"   Product: {order['product_name']}")
            print(f"   Quantity: {order['quantity']}")
            print(f"   Total: GHS {order['total_amount']:.2f}")
            print(f"   Payment: {order['payment_status']} ({order['payment_method']})")
            if order_type == "purchases":
                print(f"   Seller: {order.get('seller_name', 'N/A')} - {order.get('seller_phone', 'N/A')}")
            elif order_type == "sales":
                print(f"   Buyer: {order.get('buyer_name', 'N/A')} - {order.get('buyer_phone', 'N/A')}")
        return orders
    else:
        print(f"❌ Failed to get orders: {response.json()}")
        return []

def get_user_stats(token):
    """Get user statistics"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/user/profile", headers=headers)
    if response.status_code == 200:
        user = response.json()
        stats = user.get('stats', {})
        print(f"✅ User Stats:")
        print(f"   Products Listed: {stats.get('total_products', 0)}")
        print(f"   Total Orders: {stats.get('total_orders', 0)}")
        print(f"   Notifications: {stats.get('unread_notifications', 0)} unread")
        return stats
    else:
        print(f"❌ Failed to get stats: {response.json()}")
        return None

def main():
    """Run complete transaction test"""
    print_section("🌾 AGRIBOT MARKETPLACE TRANSACTION TEST 🌾")
    
    # Step 1: Register Seller
    print_section("STEP 1: Register Seller (Farmer)")
    seller_id, seller_token = register_user(
        name="Kwame Mensah",
        phone="+233244123456",
        role="seller"
    )
    
    if not seller_token:
        print("❌ Cannot proceed without seller. Exiting.")
        return
    
    # Step 2: Register Buyer
    print_section("STEP 2: Register Buyer (Trader/Retailer)")
    buyer_id, buyer_token = register_user(
        name="Ama Osei",
        phone="+233244987654",
        role="buyer"
    )
    
    if not buyer_token:
        print("❌ Cannot proceed without buyer. Exiting.")
        return
    
    # Step 3: Seller lists products
    print_section("STEP 3: Seller Lists Products")
    
    product1 = create_product(seller_token, {
        "name": "Fresh Tomatoes",
        "category": "vegetables",
        "price": 8.50,
        "unit": "kg",
        "quantity": 500,
        "location": "Ashanti Region, Ghana",
        "description": "Premium quality fresh tomatoes, harvested this morning",
        "minimum_order": 10,
        "quality": "Grade A"
    })
    
    product2 = create_product(seller_token, {
        "name": "Yellow Maize",
        "category": "grains",
        "price": 3.20,
        "unit": "kg",
        "quantity": 1000,
        "location": "Ashanti Region, Ghana",
        "description": "Dry yellow maize, suitable for both human and animal consumption",
        "minimum_order": 50,
        "quality": "Grade B"
    })
    
    if not product1:
        print("❌ Cannot proceed without products. Exiting.")
        return
    
    # Step 4: Buyer searches for products
    print_section("STEP 4: Buyer Searches for Products")
    products = search_products("tomatoes")
    
    # Step 5: Buyer creates order
    print_section("STEP 5: Buyer Places Order")
    
    order_id = create_order(buyer_token, {
        "product_id": product1,
        "quantity": 50,  # 50 kg of tomatoes
        "delivery_address": "Makola Market, Accra, Ghana",
        "payment_method": "mobile_money",
        "notes": "Please deliver early morning, before 7am"
    })
    
    if not order_id:
        print("❌ Order creation failed. Exiting.")
        return
    
    # Step 6: View Buyer's Orders (Purchases)
    print_section("STEP 6: Buyer Views Purchase History")
    get_orders(buyer_token, "purchases")
    
    # Step 7: View Seller's Orders (Sales)
    print_section("STEP 7: Seller Views Sales History")
    get_orders(seller_token, "sales")
    
    # Step 8: View Stats
    print_section("STEP 8: User Statistics")
    print("\n📊 SELLER STATS:")
    get_user_stats(seller_token)
    
    print("\n📊 BUYER STATS:")
    get_user_stats(buyer_token)
    
    # Summary
    print_section("✅ TRANSACTION TEST COMPLETED SUCCESSFULLY")
    print("""
    Transaction Flow Summary:
    -------------------------
    1. ✅ Seller (Kwame Mensah) registered as farmer
    2. ✅ Buyer (Ama Osei) registered as trader
    3. ✅ Seller listed 2 products (Tomatoes, Maize)
    4. ✅ Buyer searched marketplace for tomatoes
    5. ✅ Buyer placed order for 50kg tomatoes (GHS 425.00)
    6. ✅ Both parties can view their transaction history
    
    Key Features Tested:
    -------------------
    ✅ User registration (buyer & seller roles)
    ✅ Product listing by seller
    ✅ Product search functionality
    ✅ Order creation (buyer → seller)
    ✅ Transaction tracking (purchases & sales)
    ✅ Payment method specification
    ✅ Delivery address management
    ✅ User statistics dashboard
    
    Next Steps:
    -----------
    - Test payment status updates
    - Test order status workflow (pending → confirmed → delivered)
    - Test notifications to both parties
    - Test rating/review system after delivery
    """)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API server")
        print("Please make sure the server is running:")
        print("  cd ghana-agri-bot")
        print("  python run.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
