'use client'

// app/farmer/market/page.tsx – Full-featured marketplace mirroring mobile screen

import { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { api, MarketCropsResponse, MarketPricesResponse, MarketPricesRow } from '@/lib/api'

interface MarketProduct {
  id: string
  name: string
  price: string
  unit: string
  seller: string
  location: string
  distance?: string
  category: 'produce' | 'inputs' | 'tools'
  rating?: number
  reviews?: number
  isNew?: boolean
  isBestPrice?: boolean
  stock?: number
}

interface CartItem extends MarketProduct {
  quantity: number
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📱' },
  { key: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { key: 'grains', label: 'Grains', icon: '🌾' },
  { key: 'fruits', label: 'Fruits', icon: '🍎' },
  { key: 'inputs', label: 'Inputs', icon: '💧' },
  { key: 'tools', label: 'Tools', icon: '🔧' },
]

const MOCK_PRODUCTS: MarketProduct[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    price: '5.20',
    unit: 'kg',
    seller: 'John Mensah',
    location: 'Kumasi',
    distance: '8km',
    category: 'produce',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    stock: 200,
  },
  {
    id: '2',
    name: 'Yellow Maize',
    price: '2.80',
    unit: 'kg',
    seller: 'Mary Addo',
    location: 'Techiman',
    distance: '15km',
    category: 'produce',
    rating: 4.5,
    reviews: 89,
    isBestPrice: true,
    stock: 500,
  },
  {
    id: '3',
    name: 'NPK Fertilizer',
    price: '45.00',
    unit: 'bag',
    seller: 'AgriSupply Co',
    location: 'Accra',
    distance: '3km',
    category: 'inputs',
    rating: 4.6,
    reviews: 56,
    stock: 50,
  },
  {
    id: '4',
    name: 'Pesticide Sprayer',
    price: '120.00',
    unit: 'unit',
    seller: 'Farm Tools Ltd',
    location: 'Accra',
    distance: '10km',
    category: 'tools',
    rating: 4.7,
    reviews: 34,
    stock: 12,
  },
  {
    id: '5',
    name: 'Cassava (Fresh)',
    price: '1.50',
    unit: 'kg',
    seller: 'Kofi Farms',
    location: 'Volta',
    distance: '25km',
    category: 'produce',
    rating: 4.3,
    reviews: 67,
    stock: 300,
  },
  {
    id: '6',
    name: 'Organic Seeds Pack',
    price: '35.00',
    unit: 'pack',
    seller: 'GreenGrow Ghana',
    location: 'Kumasi',
    distance: '12km',
    category: 'inputs',
    rating: 4.9,
    reviews: 45,
    isNew: true,
    stock: 80,
  },
]

export default function FarmerMarketPage() {
  const { crops, marketPrices, products, marketLoading, refreshMarketData, createOrder, createProduct, userLocation } = useApp()
  const { user } = useAuth()
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'prices'>('buy')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'success'>('details')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash'>('momo')
  const [momoNumber, setMomoNumber] = useState('')
  const [sellLoading, setSellLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [myListings, setMyListings] = useState<MarketProduct[]>([])

  // Sell form state
  const [sellForm, setSellForm] = useState({
    product: '',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    category: 'produce' as 'produce' | 'inputs' | 'tools',
  })

  // Set initial selected crop from context
  useEffect(() => {
    if (crops && crops.length > 0 && !selectedCrop) {
      setSelectedCrop(crops[0])
    }
  }, [crops, selectedCrop])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('semmaai_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
    
    const savedWishlist = localStorage.getItem('semmaai_wishlist')
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist))
      } catch (e) {
        console.error('Error loading wishlist:', e)
      }
    }

    const savedListings = localStorage.getItem('semmaai_my_listings')
    if (savedListings) {
      try {
        setMyListings(JSON.parse(savedListings))
      } catch (e) {
        console.error('Error loading listings:', e)
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('semmaai_cart', JSON.stringify(cart))
    } else {
      localStorage.removeItem('semmaai_cart')
    }
  }, [cart])

  // Save wishlist to localStorage
  useEffect(() => {
    if (wishlist.length > 0) {
      localStorage.setItem('semmaai_wishlist', JSON.stringify(wishlist))
    } else {
      localStorage.removeItem('semmaai_wishlist')
    }
  }, [wishlist])

  // Fetch prices when crop changes
  useEffect(() => {
    if (selectedCrop) {
      refreshMarketData()
    }
  }, [selectedCrop, refreshMarketData])

  // Combine products from context with mock products
  const allProducts: MarketProduct[] = [
    // Map products from database
    ...products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price.toString(),
      unit: p.unit,
      seller: p.seller_name || 'Local Farmer',
      location: p.location || 'Ghana',
      category: (p.category || 'produce') as 'produce' | 'inputs' | 'tools',
      rating: 4.5,
      stock: p.quantity_available || p.quantity,
    })),
    // Add mock products if no real products
    ...(products.length === 0 ? MOCK_PRODUCTS : []),
  ]

  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: MarketProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowCart(false)
    setShowCheckout(true)
    setCheckoutStep('details')
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !deliveryPhone) {
      alert('Please fill in delivery details')
      return
    }
    if (paymentMethod === 'momo' && !momoNumber) {
      alert('Please enter your mobile money number')
      return
    }
    
    setOrderLoading(true)
    setCheckoutStep('payment')
    
    try {
      // Create orders for each cart item
      for (const item of cart) {
        const order = {
          user_id: user?.id || 'guest',
          type: 'purchase' as const,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: parseFloat(item.price),
          total_amount: parseFloat(item.price) * item.quantity,
          status: 'pending' as const,
          seller_name: item.seller,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod === 'momo' ? 'mobile_money' as const : 'cash' as const,
          payment_status: paymentMethod === 'cash' ? 'pending' as const : 'paid' as const,
        }
        
        // Try to save to Supabase
        await createOrder(order)
      }
      
      // Also save to localStorage for offline access
      const savedOrders = JSON.parse(localStorage.getItem('semmaai_orders') || '[]')
      const newOrder = {
        id: `ORD${Date.now()}`,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
        })),
        total: cartTotal,
        deliveryAddress,
        deliveryPhone,
        paymentMethod,
        momoNumber: paymentMethod === 'momo' ? momoNumber : undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      savedOrders.unshift(newOrder)
      localStorage.setItem('semmaai_orders', JSON.stringify(savedOrders))
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCheckoutStep('success')
      
      // Clear cart after successful order
      setTimeout(() => {
        setCart([])
        localStorage.removeItem('semmaai_cart')
        setShowCheckout(false)
        setCheckoutStep('details')
        setDeliveryAddress('')
        setDeliveryPhone('')
        setMomoNumber('')
      }, 3000)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
      setCheckoutStep('details')
    } finally {
      setOrderLoading(false)
    }
  }

  const handleSellSubmit = async () => {
    if (!sellForm.product || !sellForm.price || !sellForm.quantity) {
      alert('Please fill in all required fields')
      return
    }
    
    setSellLoading(true)
    
    try {
      // Create new product listing
      const newProduct = {
        seller_id: user?.id || 'guest',
        name: sellForm.product,
        description: sellForm.description || `Fresh ${sellForm.product} from local farmer`,
        category: sellForm.category,
        price: parseFloat(sellForm.price),
        unit: sellForm.unit,
        quantity_available: parseInt(sellForm.quantity),
        location: userLocation || 'Ghana',
        images: [],
        is_organic: false,
        status: 'active' as const,
      }
      
      // Try to save to Supabase
      const result = await createProduct(newProduct)
      
      // Also save to localStorage
      const listing: MarketProduct = {
        id: result?.id || `local_${Date.now()}`,
        name: sellForm.product,
        price: sellForm.price,
        unit: sellForm.unit,
        seller: user?.name || 'You',
        location: userLocation || 'Ghana',
        category: sellForm.category,
        stock: parseInt(sellForm.quantity),
        isNew: true,
      }
      
      const updatedListings = [listing, ...myListings]
      setMyListings(updatedListings)
      localStorage.setItem('semmaai_my_listings', JSON.stringify(updatedListings))
      
      // Show success message
      alert(`✅ Listing created successfully!\n\nProduct: ${sellForm.product}\nPrice: GHS ${sellForm.price}/${sellForm.unit}\nQuantity: ${sellForm.quantity} ${sellForm.unit}\n\nYour listing is now visible to buyers.`)
      
      // Reset form
      setSellForm({ product: '', price: '', unit: 'kg', quantity: '', description: '', category: 'produce' })
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Failed to create listing. Please try again.')
    } finally {
      setSellLoading(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-emerald-950 sm:text-2xl">
          🛒 Marketplace
        </h1>
        <p className="text-sm text-emerald-600 sm:text-base">
          Buy farm inputs, sell your produce, and check market prices.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-emerald-50 p-1">
        {(['buy', 'sell', 'prices'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-600 hover:text-emerald-900'
            }`}
          >
            {tab === 'buy' && '🛍️ '}
            {tab === 'sell' && '💰 '}
            {tab === 'prices' && '📈 '}
            {tab}
          </button>
        ))}
        {/* Cart button */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          🛒 {cart.length > 0 && <span className="ml-1">({cart.length})</span>}
        </button>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-emerald-900">Your Cart</h3>
            <button onClick={() => setShowCart(false)} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
          {cart.length === 0 ? (
            <p className="mt-4 text-center text-sm text-emerald-500">Your cart is empty</p>
          ) : (
            <div className="mt-3 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-emerald-50 p-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">{item.name}</p>
                    <p className="text-xs text-emerald-600">GHS {item.price}/{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 rounded bg-emerald-200 text-emerald-700 hover:bg-emerald-300"
                    >−</button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded bg-emerald-200 text-emerald-700 hover:bg-emerald-300"
                    >+</button>
                  </div>
                </div>
              ))}
              <div className="border-t border-emerald-100 pt-3">
                <div className="flex justify-between font-semibold text-emerald-900">
                  <span>Total:</span>
                  <span>GHS {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buy Tab */}
      {activeTab === 'buy' && (
        <>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            <span className="text-emerald-500">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, sellers, locations..."
              className="h-8 w-full border-none bg-transparent text-sm text-emerald-950 outline-none placeholder:text-emerald-400"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="relative rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Badges */}
                <div className="absolute right-2 top-2 flex gap-1">
                  {product.isNew && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">NEW</span>
                  )}
                  {product.isBestPrice && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">BEST PRICE</span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute left-2 top-2 text-lg"
                >
                  {wishlist.includes(product.id) ? '❤️' : '🤍'}
                </button>

                <div className="mt-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
                    {product.category === 'produce' ? '🥬' : product.category === 'inputs' ? '💧' : '🔧'}
                  </div>
                  <h3 className="mt-3 font-semibold text-emerald-900">{product.name}</h3>
                  <p className="text-xs text-emerald-500">{product.seller} • {product.location}</p>
                  
                  {product.rating && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-500">
                      ⭐ {product.rating.toFixed(1)} ({product.reviews})
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-emerald-700">GHS {product.price}</p>
                    <p className="text-xs text-emerald-500">per {product.unit}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-2 font-medium text-emerald-900">No products found</p>
              <p className="text-sm text-emerald-500">Try a different search or category</p>
            </div>
          )}
        </>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <>
          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-emerald-900">List Your Product</h3>
            <p className="mt-1 text-sm text-emerald-600">Sell your produce to other farmers and buyers</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-emerald-700">Product Name *</label>
                <input
                  type="text"
                  value={sellForm.product}
                  onChange={(e) => setSellForm(prev => ({ ...prev, product: e.target.value }))}
                  placeholder="e.g., Fresh Tomatoes"
                  className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-emerald-700">Category *</label>
                <select
                  value={sellForm.category}
                  onChange={(e) => setSellForm(prev => ({ ...prev, category: e.target.value as 'produce' | 'inputs' | 'tools' }))}
                  className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                >
                  <option value="produce">🥬 Produce (Vegetables, Fruits, Grains)</option>
                  <option value="inputs">💧 Farm Inputs (Seeds, Fertilizers)</option>
                  <option value="tools">🔧 Tools & Equipment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-emerald-700">Price (GHS) *</label>
                  <input
                    type="number"
                    value={sellForm.price}
                    onChange={(e) => setSellForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-emerald-700">Unit</label>
                  <select
                    value={sellForm.unit}
                    onChange={(e) => setSellForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="bag">bag</option>
                    <option value="crate">crate</option>
                    <option value="bunch">bunch</option>
                    <option value="unit">unit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-emerald-700">Quantity Available *</label>
                <input
                  type="number"
                  value={sellForm.quantity}
                  onChange={(e) => setSellForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="e.g., 100"
                  className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-emerald-700">Description (optional)</label>
                <textarea
                  value={sellForm.description}
                  onChange={(e) => setSellForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product quality, variety, etc."
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSellSubmit}
                disabled={sellLoading}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
              >
                {sellLoading ? '⏳ Creating Listing...' : '📝 Create Listing'}
              </button>
            </div>
          </section>

          {/* My Listings */}
          {myListings.length > 0 && (
            <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-emerald-900">Your Listings</h3>
              <p className="mt-1 text-sm text-emerald-600">Products you have listed for sale</p>
              
              <div className="mt-4 space-y-3">
                {myListings.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                      {listing.category === 'produce' ? '🥬' : listing.category === 'inputs' ? '💧' : '🔧'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-900">{listing.name}</p>
                      <p className="text-xs text-emerald-600">
                        GHS {listing.price}/{listing.unit} • {listing.stock} available
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.isNew && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">NEW</span>
                      )}
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">ACTIVE</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Prices Tab */}
      {activeTab === 'prices' && (
        <>
          <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Select Crop
                </p>
                <p className="text-xs text-emerald-500">
                  Live market prices from Ghana Commodity Exchange
                </p>
              </div>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {(!crops || crops.length === 0) && <option value="">No crops</option>}
                {crops && crops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="mt-3 text-xs text-amber-700 sm:text-sm">{error}</p>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-900 sm:text-base">
                {selectedCrop || 'No crop selected'}
              </p>
              {marketLoading && (
                <span className="animate-pulse text-xs text-emerald-500">Loading...</span>
              )}
            </div>

            {marketPrices.length === 0 && !marketLoading && !error && (
              <p className="text-sm text-emerald-500">
                No price data found for this crop.
              </p>
            )}

            <div className="space-y-2">
              {marketPrices.map((row, idx) => (
                <div
                  key={`${row.city}-${idx}-${row.date}`}
                  className="flex items-center justify-between rounded-xl border border-emerald-50 bg-emerald-50/60 px-3 py-2 text-sm sm:px-4 sm:py-3"
                >
                  <div>
                    <p className="font-semibold text-emerald-900">
                      {row.city || 'Unknown market'}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {row.date || 'Recent'} • {row.unit || 'unit'}
                    </p>
                  </div>
                  <p className="text-base font-bold text-emerald-800 sm:text-lg">
                    GHS {row.price || '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            {checkoutStep === 'details' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-emerald-900">🛒 Checkout</h3>
                  <button onClick={() => setShowCheckout(false)} className="text-emerald-500 hover:text-emerald-700">✕</button>
                </div>

                {/* Order Summary */}
                <div className="mb-4 rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-600 mb-2">Order Summary</p>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-emerald-900">
                      <span>{item.name} x{item.quantity}</span>
                      <span>GHS {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-between font-semibold text-emerald-900">
                    <span>Total</span>
                    <span>GHS {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-emerald-700">Delivery Address</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-emerald-700">Phone Number</label>
                    <input
                      type="tel"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="e.g., 0241234567"
                      className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-medium text-emerald-700">Payment Method</label>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setPaymentMethod('momo')}
                        className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                          paymentMethod === 'momo'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        📱 Mobile Money
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                          paymentMethod === 'cash'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        💵 Cash on Delivery
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'momo' && (
                    <div>
                      <label className="text-xs font-medium text-emerald-700">Mobile Money Number</label>
                      <input
                        type="tel"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="e.g., 0241234567"
                        className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Place Order - GHS {cartTotal.toFixed(2)}
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'payment' && (
              <div className="text-center py-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-emerald-900">Processing Payment</h3>
                <p className="mt-2 text-sm text-emerald-600">
                  {paymentMethod === 'momo' 
                    ? 'Please approve the payment on your phone...'
                    : 'Confirming your order...'}
                </p>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-lg font-semibold text-emerald-900">Order Placed!</h3>
                <p className="mt-2 text-sm text-emerald-600">
                  Your order has been confirmed. You&apos;ll receive a notification when it&apos;s on the way.
                </p>
                <p className="mt-4 text-xs text-emerald-500">
                  Order ID: #ORD{Date.now().toString().slice(-8)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


