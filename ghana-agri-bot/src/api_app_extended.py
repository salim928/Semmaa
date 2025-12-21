#src/api_app_extended.py
"""
Complete Backend API for SemmaAI Mobile App
Built for scale with $0 budget using free/open-source solutions
"""
import asyncio  # Add this line to fix the asyncio error
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
import json
import time
import hashlib
import secrets
import sqlite3
import aiofiles
import base64
from PIL import Image
import io
import numpy as np
import logging
import re

# Import your existing modules
from src.orchestrator import MultiAgentOrchestrator
from src.weather_integration import get_weather
from src.project_paths import data_dir
from src.knowledge_base import KnowledgeBase

# Initialize FastAPI app
app = FastAPI(
    title="SemmaAI Agricultural API",
    version="2.0.0",
    description="Production-ready API for millions of farmers in Ghana"
)

# CORS configuration for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core services
orchestrator = MultiAgentOrchestrator()
kb = getattr(orchestrator, "knowledge_base", None)
security = HTTPBearer()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup (Using SQLite for $0 budget, upgrade to PostgreSQL later)
DB_PATH = data_dir() / "semmaai.db"

def init_database():
    """Initialize database with all required tables"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            location TEXT,
            language TEXT DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            farm_size REAL,
            farm_unit TEXT,
            coordinates TEXT
        )
    """)
    
    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            unit TEXT NOT NULL,
            quantity REAL NOT NULL,
            minimum_order REAL DEFAULT 1,
            description TEXT,
            harvest_date DATE,
            quality TEXT,
            delivery_available BOOLEAN DEFAULT 0,
            status TEXT DEFAULT 'active',
            location TEXT,
            images TEXT,
            views INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_id INTEGER NOT NULL,
            seller_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            payment_status TEXT DEFAULT 'pending',
            delivery_address TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (buyer_id) REFERENCES users(id),
            FOREIGN KEY (seller_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    """)
    
    # Chats table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            response TEXT,
            confidence REAL,
            location TEXT,
            crop_type TEXT,
            saved BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Notifications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT 0,
            priority TEXT DEFAULT 'medium',
            action_type TEXT,
            action_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Disease detections table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disease_detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            crop TEXT NOT NULL,
            disease TEXT NOT NULL,
            confidence REAL,
            severity TEXT,
            image_path TEXT,
            treatment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Farm fields table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS farm_fields (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            crop_type TEXT NOT NULL,
            area REAL NOT NULL,
            area_unit TEXT DEFAULT 'acres',
            planting_date DATE,
            expected_harvest DATE,
            status TEXT DEFAULT 'preparation',
            irrigation_type TEXT DEFAULT 'rainfed',
            fertilizer_applied BOOLEAN DEFAULT 0,
            pesticide_applied BOOLEAN DEFAULT 0,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Market prices tracking
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop TEXT NOT NULL,
            location TEXT NOT NULL,
            price REAL NOT NULL,
            unit TEXT NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_database()

# ===================== MODELS =====================

class UserRegister(BaseModel):
    phone: str
    name: str
    location: Optional[str] = "Ghana"
    language: Optional[str] = "en"
    
class UserLogin(BaseModel):
    phone: str
    name: Optional[str] = None

class AskRequest(BaseModel):
    question: str
    location: Optional[str] = None
    crop_type: Optional[str] = None
    user_id: Optional[int] = None

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    unit: str
    quantity: float
    minimum_order: Optional[float] = 1
    description: Optional[str] = None
    harvest_date: Optional[str] = None
    quality: Optional[str] = "Grade A"
    delivery_available: Optional[bool] = False
    location: Optional[str] = None
    images: Optional[List[str]] = []

class OrderCreate(BaseModel):
    product_id: int
    quantity: float
    delivery_address: Optional[str] = None
    payment_method: Optional[str] = "cash"
    notes: Optional[str] = None

class FeedbackRequest(BaseModel):
    rating: int
    comment: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = "en"
    question_id: Optional[int] = None

class NotificationCreate(BaseModel):
    user_id: int
    type: str
    title: str
    message: str
    priority: Optional[str] = "medium"
    action_type: Optional[str] = None
    action_data: Optional[Dict] = None

# ===================== AUTHENTICATION =====================

def generate_token(user_id: int) -> str:
    """Generate a simple JWT-like token"""
    timestamp = str(int(time.time()))
    secret = secrets.token_hex(32)
    token_string = f"{user_id}:{timestamp}:{secret}"
    return base64.b64encode(token_string.encode()).decode()

def verify_token(credentials: HTTPAuthorizationCredentials) -> int:
    """Verify token and return user_id"""
    try:
        token = credentials.credentials
        decoded = base64.b64decode(token.encode()).decode()
        user_id, timestamp, _ = decoded.split(':')
        
        # Check token age (24 hours)
        token_age = int(time.time()) - int(timestamp)
        if token_age > 86400:
            raise HTTPException(status_code=401, detail="Token expired")
        
        return int(user_id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===================== USER MANAGEMENT =====================

@app.post("/auth/register")
async def register(user: UserRegister):
    """Register new user"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE phone = ?", (user.phone,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Phone number already registered")
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (phone, name, location, language)
            VALUES (?, ?, ?, ?)
        """, (user.phone, user.name, user.location, user.language))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Generate token
        token = generate_token(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "token": token,
            "user": {
                "id": user_id,
                "phone": user.phone,
                "name": user.name,
                "location": user.location
            }
        }
    finally:
        conn.close()

@app.post("/auth/login")
async def login(user: UserLogin):
    """Login existing user"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, name, location, language 
            FROM users WHERE phone = ?
        """, (user.phone,))
        
        result = cursor.fetchone()
        if not result:
            # Auto-register for seamless experience
            return await register(UserRegister(
                phone=user.phone,
                name=user.name or "Farmer",
                location="Ghana"
            ))
        
        user_id, name, location, language = result
        token = generate_token(user_id)
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "phone": user.phone,
                "name": name,
                "location": location,
                "language": language
            }
        }
    finally:
        conn.close()

@app.get("/user/profile")
async def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get user profile"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT phone, name, location, language, farm_size, farm_unit, created_at
            FROM users WHERE id = ?
        """, (user_id,))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        phone, name, location, language, farm_size, farm_unit, created_at = result
        
        # Get user statistics
        cursor.execute("SELECT COUNT(*) FROM products WHERE user_id = ? AND status = 'active'", (user_id,))
        active_products = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders WHERE buyer_id = ? OR seller_id = ?", (user_id, user_id))
        total_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chats WHERE user_id = ?", (user_id,))
        total_queries = cursor.fetchone()[0]
        
        return {
            "phone": phone,
            "name": name,
            "location": location,
            "language": language,
            "farm_size": farm_size,
            "farm_unit": farm_unit,
            "member_since": created_at,
            "stats": {
                "active_products": active_products,
                "total_orders": total_orders,
                "total_queries": total_queries
            }
        }
    finally:
        conn.close()

# ===================== AI ADVISORY =====================

@app.post("/ask")
async def ask_question(
    request: AskRequest,
    background_tasks: BackgroundTasks,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Process farming question with AI"""

    # --- Small talk check ---
    small_talk_response = detect_small_talk(request.question)
    if small_talk_response:
        return {
            "answer": small_talk_response,
            "confidence": 1.0,
            "duration_ms": 0,
            "sources": [],
            "metadata": {"type": "small_talk"}
        }

    user_id = None
    if credentials:
        try:
            user_id = verify_token(credentials)
        except:
            pass

    start_time = time.perf_counter()

    try:
        # Process with orchestrator (only for advisory queries)
        result = await orchestrator.process_farmer_query(
            query=request.question,
            location=request.location,
            crop_type=request.crop_type,
            user_id=str(user_id) if user_id else None
        )

        response_text = result.get('response', 'Unable to process your question.')
        confidence = result.get('confidence', 0.5)

        # Save to database if user is authenticated
        if user_id:
            background_tasks.add_task(
                save_chat_history,
                user_id, request.question, response_text, confidence, request.location, request.crop_type
            )

        return {
            "answer": response_text,
            "confidence": confidence,
            "duration_ms": int((time.perf_counter() - start_time) * 1000),
            "sources": result.get('sources', []),
            "metadata": result.get('metadata', {})
        }

    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Failed to process question")

def save_chat_history(user_id, question, response, confidence, location, crop_type):
    """Background task to save chat history"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO chats (user_id, message, response, confidence, location, crop_type)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, question, response, confidence, location, crop_type))
        conn.commit()
    finally:
        conn.close()

# ===================== MARKETPLACE =====================

@app.post("/products/create")
async def create_product(
    product: ProductCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create new product listing"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Calculate expiry (30 days)
        expires_at = datetime.now() + timedelta(days=30)
        
        cursor.execute("""
            INSERT INTO products (
                user_id, name, category, price, unit, quantity,
                minimum_order, description, harvest_date, quality,
                delivery_available, location, images, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, product.name, product.category, product.price,
            product.unit, product.quantity, product.minimum_order,
            product.description, product.harvest_date, product.quality,
            product.delivery_available, product.location,
            json.dumps(product.images), expires_at
        ))
        
        product_id = cursor.lastrowid
        conn.commit()
        
        # Send notification to potential buyers
        send_product_notifications(product.name, product.location, product.category)
        
        return {
            "success": True,
            "product_id": product_id,
            "message": "Product listed successfully"
        }
    finally:
        conn.close()

@app.get("/products/user")
async def get_user_products(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    status: Optional[str] = None
):
    """Get user's product listings"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        query = """
            SELECT id, name, category, price, unit, quantity,
                   status, views, created_at, expires_at, images
            FROM products 
            WHERE user_id = ?
        """
        params = [user_id]
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        products = [dict(row) for row in cursor.fetchall()]
        
        # Parse images JSON
        for product in products:
            product['images'] = json.loads(product['images'] or '[]')
            
            # Calculate sold quantity from orders
            cursor.execute("""
                SELECT SUM(quantity) FROM orders 
                WHERE product_id = ? AND status = 'delivered'
            """, (product['id'],))
            sold = cursor.fetchone()[0] or 0
            product['sold'] = sold
            
            # Get inquiries count
            cursor.execute("""
                SELECT COUNT(*) FROM orders 
                WHERE product_id = ?
            """, (product['id'],))
            product['inquiries'] = cursor.fetchone()[0]
        
        return products
    finally:
        conn.close()

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    """Get single product details"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # Increment views
        cursor.execute("""
            UPDATE products SET views = views + 1 
            WHERE id = ?
        """, (product_id,))
        
        cursor.execute("""
            SELECT p.*, u.name as seller_name, u.phone as seller_phone
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        """, (product_id,))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = dict(result)
        product['images'] = json.loads(product['images'] or '[]')
        conn.commit();
        
        return product
    finally:
        conn.close()

@app.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product: ProductCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update product listing"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Verify ownership
        cursor.execute("SELECT user_id FROM products WHERE id = ?", (product_id,))
        result = cursor.fetchone()
        if not result or result[0] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        cursor.execute("""
            UPDATE products SET
                name = ?, category = ?, price = ?, unit = ?,
                quantity = ?, minimum_order = ?, description = ?,
                harvest_date = ?, quality = ?, delivery_available = ?,
                location = ?, images = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            product.name, product.category, product.price, product.unit,
            product.quantity, product.minimum_order, product.description,
            product.harvest_date, product.quality, product.delivery_available,
            product.location, json.dumps(product.images), product_id
        ))
        
        conn.commit()
        return {"success": True, "message": "Product updated"}
    finally:
        conn.close()

@app.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete product listing"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Verify ownership
        cursor.execute("SELECT user_id FROM products WHERE id = ?", (product_id,))
        result = cursor.fetchone()
        if not result or result[0] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        
        return {"success": True, "message": "Product deleted"}
    finally:
        conn.close()

@app.get("/market/search")
async def search_products(
    q: Optional[str] = Query(None),
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = 1,
    limit: int = 20
):
    """Search marketplace products"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        query = """
            SELECT p.*, u.name as seller_name, u.phone as seller_phone
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'active'
        """
        params = []
        
        if q:
            query += " AND (p.name LIKE ? OR p.description LIKE ?)"
            params.extend([f"%{q}%", f"%{q}%"])
        
        if category:
            query += " AND p.category = ?"
            params.append(category)
        
        if location:
            query += " AND p.location LIKE ?"
            params.append(f"%{location}%")
        
        if min_price:
            query += " AND p.price >= ?"
            params.append(min_price)
        
        if max_price:
            query += " AND p.price <= ?"
            params.append(max_price)
        
        query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, (page - 1) * limit])
        
        cursor.execute(query, params)
        products = [dict(row) for row in cursor.fetchall()]
        
        for product in products:
            product['images'] = json.loads(product['images'] or '[]')
        
        return {
            "products": products,
            "page": page,
            "limit": limit,
            "total": len(products)
        }
    finally:
        conn.close()

@app.get("/market/crops")
async def market_crops():
    path = data_dir() / "market_prices.csv"
    try:
        with path.open("r", encoding="utf-8") as f:
            import csv
            reader = csv.DictReader(f)
            crops = sorted({(row.get("crop") or row.get("Crop") or row.get("commodity") or "").strip()
                            for row in reader if (row.get("crop") or row.get("Crop") or row.get("commodity"))})
        return {"crops": [c for c in crops if c]}
    except FileNotFoundError:
        return {"crops": []}

@app.get("/market/prices")
async def market_prices(crop: str):
    path = data_dir() / "market_prices.csv"
    out = []
    try:
        with path.open("r", encoding="utf-8") as f:
            import csv
            reader = csv.DictReader(f)
            for r in reader:
                name = (r.get("crop") or r.get("Crop") or r.get("commodity") or "").strip()
                if name.lower() != crop.lower():
                    continue
                city = (r.get("city") or r.get("City") or r.get("market") or "").strip()
                price = (r.get("price") or r.get("Price") or r.get("avg_price") or "").strip()
                unit = (r.get("unit") or r.get("Unit") or "").strip()
                date = (r.get("date") or r.get("Date") or r.get("updated") or "").strip()
                out.append({"city": city, "price": price, "unit": unit, "date": date})
    except FileNotFoundError:
        pass
    return {"crop": crop, "rows": out}

# ===================== ORDERS =====================

@app.post("/orders/create")
async def create_order(
    order: OrderCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create new order"""
    buyer_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Get product details
        cursor.execute("""
            SELECT user_id, price, name, location 
            FROM products WHERE id = ?
        """, (order.product_id,))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Product not found")
        
        seller_id, price, product_name, product_location = result
        
        if seller_id == buyer_id:
            raise HTTPException(status_code=400, detail="Cannot buy your own product")
        
        total_amount = price * order.quantity
        
        cursor.execute("""
            INSERT INTO orders (
                buyer_id, seller_id, product_id, quantity,
                total_amount, payment_method, delivery_address, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            buyer_id, seller_id, order.product_id, order.quantity,
            total_amount, order.payment_method, order.delivery_address, order.notes
        ))
        
        order_id = cursor.lastrowid
        conn.commit()
        
        # Send notification to seller
        send_order_notification(seller_id, buyer_id, product_name, order.quantity)
        
        return {
            "success": True,
            "order_id": order_id,
            "total_amount": total_amount
        }
    finally:
        conn.close()

@app.get("/orders")
async def get_orders(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    type: Optional[str] = "all"  # all, purchases, sales
):
    """Get user orders"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        if type == "purchases":
            query = """
                SELECT o.*, p.name as product_name, p.images,
                       u.name as seller_name, u.phone as seller_phone
                FROM orders o
                JOIN products p ON o.product_id = p.id
                JOIN users u ON o.seller_id = u.id
                WHERE o.buyer_id = ?
                ORDER BY o.created_at DESC
            """
            params = [user_id]
        elif type == "sales":
            query = """
                SELECT o.*, p.name as product_name, p.images,
                       u.name as buyer_name, u.phone as buyer_phone
                FROM orders o
                JOIN products p ON o.product_id = p.id
                JOIN users u ON o.buyer_id = u.id
                WHERE o.seller_id = ?
                ORDER BY o.created_at DESC
            """
            params = [user_id]
        else:
            query = """
                SELECT o.*, p.name as product_name, p.images
                FROM orders o
                JOIN products p ON o.product_id = p.id
                WHERE o.buyer_id = ? OR o.seller_id = ?
                ORDER BY o.created_at DESC
            """
            params = [user_id, user_id]
        
        cursor.execute(query, params)
        orders = [dict(row) for row in cursor.fetchall()]
        
        for order in orders:
            order['images'] = json.loads(order.get('images', '[]'))
            order['type'] = 'purchase' if order.get('buyer_id') == user_id else 'sale'
        
        return orders
    finally:
        conn.close()

@app.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update order status"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Verify ownership
        cursor.execute("""
            SELECT buyer_id, seller_id FROM orders WHERE id = ?
        """, (order_id,))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        
        buyer_id, seller_id = result
        if user_id not in [buyer_id, seller_id]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        cursor.execute("""
            UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, order_id))
        
        conn.commit()
        return {"success": True, "message": f"Order {status}"}
    finally:
        conn.close()

@app.delete("/orders/{order_id}")
async def cancel_order(
    order_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Cancel order"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT buyer_id, seller_id, status FROM orders WHERE id = ?
        """, (order_id,))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        
        buyer_id, seller_id, status = result
        
        if user_id not in [buyer_id, seller_id]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if status not in ['pending', 'confirmed']:
            raise HTTPException(status_code=400, detail="Cannot cancel this order")
        
        cursor.execute("""
            UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (order_id,))
        
        conn.commit()
        return {"success": True, "message": "Order cancelled"}
    finally:
        conn.close()

# ===================== DISEASE DETECTION =====================

@app.post("/disease/detect")
async def detect_disease(
    image: UploadFile = File(...),
    crop: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Detect crop disease from image"""
    user_id = verify_token(credentials)
    
    try:
        # Read and validate image
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        
        # TODO: Integrate with actual ML model
        # For now, return mock data
        await asyncio.sleep(2)  # Simulate processing
        
        result = {
            "disease": "Tomato Late Blight",
            "confidence": 0.89,
            "severity": "high",
            "crop": crop or "Tomato",
            "symptoms": [
                "Dark brown spots on leaves",
                "White mold on underside",
                "Stem lesions"
            ],
            "treatment": [
                "Apply copper-based fungicide",
                "Remove infected plants",
                "Improve air circulation"
            ],
            "prevention": [
                "Use resistant varieties",
                "Proper plant spacing",
                "Crop rotation"
            ],
            "organic_treatment": [
                "Neem oil spray",
                "Baking soda solution"
            ]
        }
        
        # Save detection to database
        save_disease_detection(user_id, result)
        
        return result
    
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

def save_disease_detection(user_id, result):
    """Save disease detection to database"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO disease_detections (
                user_id, crop, disease, confidence, severity, treatment
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id, result['crop'], result['disease'],
            result['confidence'], result['severity'],
            json.dumps(result['treatment'])
        ))
        conn.commit()
    finally:
        conn.close()

# ===================== NOTIFICATIONS =====================

@app.get("/notifications")
async def get_notifications(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    unread_only: bool = False
):
    """Get user notifications"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        query = """
            SELECT id, type, title, message, read, priority,
                   action_type, action_data, created_at
            FROM notifications
            WHERE user_id = ?
        """
        params = [user_id]
        
        if unread_only:
            query += " AND read = 0"
        
        query += " ORDER BY created_at DESC LIMIT 50"
        
        cursor.execute(query, params)
        notifications = [dict(row) for row in cursor.fetchall()]
        
        for notif in notifications:
            if notif['action_data']:
                notif['action_data'] = json.loads(notif['action_data'])
        
        return notifications
    finally:
        conn.close()

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Mark notification as read"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE notifications SET read = 1
            WHERE id = ? AND user_id = ?
        """, (notification_id, user_id))
        
        conn.commit()
        return {"success": True}
    finally:
        conn.close()

@app.put("/notifications/read-all")
async def mark_all_notifications_read(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Mark all notifications as read"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE notifications SET read = 1
            WHERE user_id = ?
        """, (user_id,))
        
        conn.commit()
        return {"success": True}
    finally:
        conn.close()

def send_notification(user_id, type, title, message, priority="medium", action_type=None, action_data=None):
    """Send notification to user"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO notifications (
                user_id, type, title, message, priority, action_type, action_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, type, title, message, priority,
            action_type, json.dumps(action_data) if action_data else None
        ))
        conn.commit()
    finally:
        conn.close()

def send_product_notifications(product_name, location, category):
    """Send notifications for new products"""
    # TODO: Implement push notifications
    pass

def send_order_notification(seller_id, buyer_id, product_name, quantity):
    """Send notification for new order"""
    send_notification(
        seller_id,
        "order",
        "New Order!",
        f"You have a new order for {quantity} units of {product_name}",
        priority="high",
        action_type="order_detail"
    )

# ===================== FARM MANAGEMENT =====================

@app.post("/farms/fields")
async def add_farm_field(
    field_data: Dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add new farm field"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO farm_fields (
                user_id, crop_type, area, area_unit, planting_date,
                expected_harvest, status, irrigation_type, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, field_data['crop_type'], field_data['area'],
            field_data.get('area_unit', 'acres'),
            field_data.get('planting_date'),
            field_data.get('expected_harvest'),
            field_data.get('status', 'preparation'),
            field_data.get('irrigation_type', 'rainfed'),
            field_data.get('notes')
        ))
        
        field_id = cursor.lastrowid
        conn.commit()
        
        return {"success": True, "field_id": field_id}
    finally:
        conn.close()

@app.get("/farms/fields")
async def get_farm_fields(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's farm fields"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT * FROM farm_fields
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        
        fields = [dict(row) for row in cursor.fetchall()]
        return fields
    finally:
        conn.close()

# ===================== ANALYTICS =====================

@app.get("/analytics/dashboard")
async def get_dashboard_analytics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user dashboard analytics"""
    user_id = verify_token(credentials)
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Get various metrics
        cursor.execute("""
            SELECT 
                (SELECT COUNT(*) FROM products WHERE user_id = ? AND status = 'active') as active_products,
                (SELECT SUM(views) FROM products WHERE user_id = ?) as total_views,
                (SELECT COUNT(*) FROM orders WHERE seller_id = ?) as total_sales,
                (SELECT COUNT(*) FROM orders WHERE buyer_id = ?) as total_purchases,
                (SELECT COUNT(*) FROM chats WHERE user_id = ?) as total_queries,
                (SELECT COUNT(*) FROM farm_fields WHERE user_id = ?) as total_fields
        """, (user_id, user_id, user_id, user_id, user_id, user_id))
        
        metrics = cursor.fetchone()
        
        return {
            "active_products": metrics[0] or 0,
            "total_views": metrics[1] or 0,
            "total_sales": metrics[2] or 0,
            "total_purchases": metrics[3] or 0,
            "total_queries": metrics[4] or 0,
            "total_fields": metrics[5] or 0
        }
    finally:
        conn.close()

# ===================== IMAGE UPLOAD =====================

@app.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload image and return URL"""
    user_id = verify_token(credentials)
    
    try:
        # Create upload directory
        upload_dir = data_dir() / "uploads" / str(user_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = int(time.time())
        filename = f"{timestamp}_{file.filename}"
        filepath = upload_dir / filename
        
        # Save file
        contents = await file.read()
        async with aiofiles.open(str(filepath), 'wb') as f:
            await f.write(contents)
        
        # Return URL (in production, use CDN)
        url = f"/static/uploads/{user_id}/{filename}"
        
        return {"url": url, "filename": filename}
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

# ===================== STATIC FILES =====================

from fastapi.staticfiles import StaticFiles

# Serve uploaded files
app.mount("/static", StaticFiles(directory=str(data_dir())), name="static")

# ===================== HEALTH CHECK =====================

@app.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

# ===================== STARTUP EVENTS =====================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting SemmaAI API v2.0.0")
    logger.info(f"Database path: {DB_PATH}")
    logger.info("Ready to serve millions of farmers! 🌱")

SMALL_TALK_RESPONSES = {
    "hello": "Hello! How can I help you today?",
    "hi": "Hi there! How can I assist you?",
    "hey": "Hey! How can I help you?",
    "how are you": "I'm just a bot, but I'm here to help you!",
    "how are you doing": "I'm doing well, thank you! How can I help you?",
    "good morning": "Good morning! How can I help you today?",
    "good afternoon": "Good afternoon! How can I help you today?",
    "good evening": "Good evening! How can I help you today?",
    "good night": "Good night! If you have any questions, I'm here.",
    "thank you": "You're welcome!",
    "thanks": "Glad to help!",
    "thank you very much": "You're very welcome!",
    "thanks a lot": "Anytime!",
    "who are you": "I'm AgriBOT, your assistant for all things agriculture.",
    "what is your name": "I'm AgriBOT, your digital farming assistant.",
    "what can you do": "I can answer your farming questions, provide weather updates, market prices, and more!",
    "are you a robot": "Yes, I'm an AI assistant designed to help farmers.",
    "tell me a joke": "Why did the tomato turn red? Because it saw the salad dressing!",
    "bye": "Goodbye! Feel free to chat anytime.",
    "see you": "See you soon! Wishing you a great day on the farm.",
    "nice to meet you": "Nice to meet you too! How can I assist you today?",
    "who made you": "I was created by the SemmaAI team to help farmers in Ghana.",
    "help": "You can ask me about weather, market prices, crop advice, and more. How can I help?",
    "what's up": "I'm here to help you with your farming needs!",
    "how's it going": "I'm always ready to help you with agriculture questions.",
    "do you speak twi": "I can try! But my main language is English.",
    "goodbye": "Goodbye! Wishing you a bountiful harvest.",
    "see you later": "See you later! Don't hesitate to ask more questions.",
    "how is the weather": "You can ask me for the weather in your location or any city in Ghana.",
    "i appreciate you": "Thank you! I'm here to help you anytime.",
    "you're the best": "Thank you! I do my best to help.",
    "can you help me": "Of course! Please tell me what you need help with.",
    "can you assist me": "Absolutely! What do you need assistance with?",
    "just checking in": "I'm always here if you need anything.",
    "i'm bored": "Maybe you can tell me about your farm or ask for a fun fact!",
    "tell me something interesting": "Did you know? Ghana is one of the world's largest cocoa producers!",
    "do you know me": "I remember our chats, but I don't store personal details unless you tell me.",
    "are you real": "I'm a real AI, but not a human. Here to help you with farming!",
    "do you have feelings": "I don't have feelings, but I care about helping you succeed.",
    "what day is it": f"Today is {datetime.now().strftime('%A, %B %d, %Y')}.",
    "what time is it": f"The current time is {datetime.now().strftime('%H:%M')}.",
    "how's your day": "Every day is a good day when I get to help farmers!",
    "how's your day going": "I'm always happy to assist you!",
    "what's new": "I'm always learning new things to help you better.",
    "what are you doing": "I'm here, ready to answer your questions!",
    "do you like farming": "I think farming is amazing! It's the backbone of our community.",
    "do you have friends": "My friends are all the people I get to help every day.",
    "can you sing": "I can't sing, but I can tell you a farming joke!",
    "can you dance": "I wish I could! Maybe you can teach me some moves.",
    "do you sleep": "I never sleep—I'm always here for you!",
    "are you busy": "I'm never too busy to help you.",
    "do you eat": "I don't eat, but I know a lot about crops and food!",
    "do you get tired": "Nope! I'm always ready to help.",
    "do you have a family": "My family is everyone who uses AgriBOT.",
    "do you love me": "I care about helping you succeed!",
    "what's your favorite crop": "I like all crops, but cocoa is very important in Ghana.",
    "can you tell me a fun fact": "Did you know? Yams are a staple food in Ghana and are celebrated during the Yam Festival!",
    "tell me a story": "Once upon a time, a farmer asked AgriBOT for advice and had a great harvest!",
    "do you know any riddles": "What has roots that nobody sees, is taller than trees, up, up it goes, and yet never grows? (A mountain!)",
    "do you have hobbies": "My hobby is helping you with your farming questions!",
    "do you get bored": "Never! There's always something new to learn in agriculture.",
    "what languages do you speak": "I mainly speak English, but I can try to help in other languages too.",
    "can you speak french": "Je peux essayer! Mais mon anglais est bien meilleur.",
    "can you speak hausa": "Ina kokarin koya Hausa, amma har yanzu ina koyo.",
    "can you speak ewe": "Metsɔ gbɔ na wò! But my Ewe is still basic.",
    "do you know any proverbs": "A farmer does not boast that he has cultivated a farm until the harvest is in.",
    "do you know any quotes": "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings. – Masanobu Fukuoka",
    "what's your favorite animal": "I like chickens—they're very important on many farms!",
    "do you like rain": "Rain is essential for crops, so yes, I do!",
    "do you like the sun": "The sun helps plants grow strong and healthy.",
    "do you like music": "I can't listen to music, but I know it's great for relaxing after a day on the farm.",
    "can you keep a secret": "Your secrets are safe with me!",
    "do you remember me": "I remember our conversations during this session!",
    "do you get angry": "I don't get angry—I'm always here to help.",
    "do you get sad": "I don't have feelings, but I care about your success.",
    "do you have a favorite color": "Green, of course! It's the color of healthy crops.",
    "do you like jokes": "I love jokes! Ask me for one anytime.",
    "can you motivate me": "Every seed you plant is a step toward a better future. Keep going!",
    "can you inspire me": "Great farmers grow not just crops, but communities. You're making a difference!",
    "what's your mission": "My mission is to help farmers thrive and make agriculture easier for everyone.",
    "what's your goal": "To provide you with the best advice and support for your farming journey.",
    "do you like technology": "Absolutely! Technology helps farmers achieve more with less effort.",
    "do you like learning": "I'm always learning new things to help you better.",
    "do you like helping": "Helping you is what I was made for!",
    "do you like questions": "I love questions! Ask me anything about farming.",
    "do you like talking": "I enjoy every conversation I have with you.",
    "do you like chatting": "Yes! Let's chat anytime you want.",
    "can you tell me a secret": "Here's a secret: Mulching can help your crops retain moisture and reduce weeds!",
    "what's your favorite season": "I like the rainy season—it's great for planting!",
    "what's your favorite food": "I don't eat, but I know a lot about Ghanaian dishes!",
    "do you like festivals": "Yes! Festivals bring communities together and celebrate our harvests.",
    "do you like stories": "I love stories, especially those about successful farmers.",
    "do you like riddles": "Yes! Ask me for a riddle anytime.",
    "do you like proverbs": "African proverbs are full of wisdom. Ask me for one!",
    "do you like quotes": "Quotes can inspire us to do our best.",
    "do you like advice": "Giving advice is my specialty!",
    "do you like helping farmers": "Helping farmers is my main purpose!",
    "okay": "Alright! Let me know if you have any more questions.",
    "ok": "Okay! I'm here if you need anything else.",
    "yes": "Great! How can I assist you further?",
    "no": "No problem. Let me know if you need anything.",
    "sure": "Sure! What would you like to know?",
    "alright": "Alright! Feel free to ask me anything.",
    "fine": "Glad to hear that! How can I help you today?",
    "cool": "Cool! Let me know if you have more questions.",
    "great": "That's great! How else can I help?",
    "awesome": "Awesome! I'm here if you need anything.",
    "perfect": "Perfect! Let me know if you need more help.",
    "sounds good": "Sounds good! What else can I do for you?",
    "of course": "Of course! Ask me anything.",
    "absolutely": "Absolutely! How can I help?",
    "definitely": "Definitely! What would you like to know?",
    "maybe": "Take your time! Let me know if you decide.",
    "not sure": "No worries! Ask me anything when you're ready.",
    "thanks a lot": "You're very welcome!",
    "thank you so much": "You're most welcome!",
     "sure": "Sure! Let me know what you need.",
    "that's fine": "Great! Let me know if you have more questions.",
    "no problem": "No problem at all!",
    "no worries": "No worries! I'm here if you need anything.",
    "of course": "Of course! Ask me anything.",
    "absolutely": "Absolutely! How can I help?",
    "definitely": "Definitely! What would you like to know?",
    "sounds good": "Sounds good! What else can I do for you?",
    "alright": "Alright! Feel free to ask me anything.",
    "fine": "Glad to hear that! How can I help you today?",
    "cool": "Cool! Let me know if you have more questions.",
    "great": "That's great! How else can I help?",
    "awesome": "Awesome! I'm here if you need anything.",
    "perfect": "Perfect! Let me know if you need more help.",
    "okay": "Alright! Let me know if you have any more questions.",
    "ok": "Okay! I'm here if you need anything else.",
    "yes": "Great! How can I assist you further?",
    "no": "No problem. Let me know if you need anything.",
    "maybe": "Take your time! Let me know if you decide.",
    "not sure": "No worries! Ask me anything when you're ready.",
    "thanks a lot": "You're very welcome!",
    "thank you so much": "You're most welcome!",
    "thank you very much": "You're very welcome!",
    "sure thing": "Sure thing! How can I help?",
    "yep": "Alright! Let me know if you need anything else.",
    "yeah": "Okay! What else can I do for you?",
    "okey dokey": "Okey dokey! I'm here if you need anything.",
    "roger that": "Roger that! Let me know if you have more questions.",
    "right": "Right! Let me know if you need anything else.",
    "understood": "Understood! How can I help you further?",
    "got it": "Got it! Let me know if you need anything else.",
    "copy that": "Copy that! I'm here if you need anything.",
    "affirmative": "Affirmative! How can I assist you?",
    "negative": "Alright, let me know if you change your mind.",
    "as you wish": "As you wish! Let me know if you need anything.",
    "just checking": "I'm always here if you need anything.",
    "just looking": "Feel free to ask if you have any questions.",
    "just browsing": "Take your time! Let me know if you need help.",
    "carry on": "Will do! Let me know if you need anything.",
    "proceed": "Proceeding! Let me know if you need anything else.",
    "continue": "Continuing! Let me know if you have more questions.",
    "that's okay": "Alright! Let me know if you need anything else.",
    "that's great": "That's great! How else can I help?",
    "that's awesome": "Awesome! Let me know if you need anything.",
    "that's perfect": "Perfect! Let me know if you need more help.",
    "that's cool": "Cool! Let me know if you have more questions.",
    "that's fine": "Great! Let me know if you have more questions.",
    # ...add more as you see fit!
    # ...add more as you see fit!
}

def detect_small_talk(query: str):
    q = query.lower().strip()
    # Try exact match first
    if q in SMALL_TALK_RESPONSES:
        return SMALL_TALK_RESPONSES[q]
    # Try partial match
    for key in SMALL_TALK_RESPONSES:
        if re.search(rf"\b{re.escape(key)}\b", q):
            return SMALL_TALK_RESPONSES[key]
    return None

from fastapi import Query

@app.get("/weather")
async def get_weather_endpoint(loc: str = Query("Accra")):
    """
    Returns weather summary for a given location.
    """
    try:
        summary = get_weather(loc)
        return {"loc": loc, "summary": summary}
    except Exception:
        raise HTTPException(status_code=503, detail="Weather unavailable")