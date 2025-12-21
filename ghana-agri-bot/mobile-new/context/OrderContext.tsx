// context/OrderContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { offlineCache } from '../utils/offlineCache';
import { useAuth } from './AuthContext';

// Order types
export type OrderType = 'purchase' | 'sale';
export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  productId?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  status: OrderStatus;
  buyerId?: string;
  sellerId?: string;
  buyerName?: string;
  sellerName?: string;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  type: OrderType;
  productId?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  buyerId?: string;
  sellerId?: string;
  buyerName?: string;
  sellerName?: string;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

interface OrderContextType {
  orders: Order[];
  purchases: Order[];
  sales: Order[];
  isLoading: boolean;
  loading: boolean; // alias for isLoading
  refreshing: boolean;
  error: string | null;
  
  // CRUD operations
  fetchOrders: (type?: OrderType) => Promise<void>;
  refreshOrders: () => Promise<void>; // for pull-to-refresh
  createOrder: (input: CreateOrderInput) => Promise<{ order: Order | null; error: Error | null }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ error: Error | null }>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<{ error: Error | null }>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  
  // Statistics
  getOrderStats: () => { totalPurchases: number; totalSales: number; pendingOrders: number };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const purchases = orders.filter(o => o.type === 'purchase');
  const sales = orders.filter(o => o.type === 'sale');

  // Fetch orders on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders();
    }
  }, [isAuthenticated, user?.id]);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order change received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        const newOrder = mapDbOrderToOrder(newRecord);
        setOrders(prev => [newOrder, ...prev]);
        break;

      case 'UPDATE':
        setOrders(prev =>
          prev.map(order =>
            order.id === newRecord.id ? mapDbOrderToOrder(newRecord) : order
          )
        );
        break;

      case 'DELETE':
        setOrders(prev => prev.filter(order => order.id !== oldRecord.id));
        break;
    }
  };

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async (type?: OrderType) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to get cached orders first
      const cachedOrders = await offlineCache.getOrders(user.id, type || 'all');
      if (cachedOrders && !offlineCache.isOnline()) {
        setOrders(cachedOrders as Order[]);
        setIsLoading(false);
        return;
      }

      // Fetch from Supabase
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Fetch orders error:', fetchError);
        setError(fetchError.message);
        
        // Fall back to cache on error
        if (cachedOrders) {
          setOrders(cachedOrders as Order[]);
        }
        return;
      }

      const mappedOrders = (data || []).map(mapDbOrderToOrder);
      setOrders(mappedOrders);

      // Cache the orders
      await offlineCache.cacheOrders(user.id, type || 'all', mappedOrders);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Create a new order
  const createOrder = async (input: CreateOrderInput): Promise<{ order: Order | null; error: Error | null }> => {
    if (!user?.id) {
      return { order: null, error: new Error('Not authenticated') };
    }

    const totalAmount = input.quantity * input.pricePerUnit;

    const orderData = {
      user_id: user.id,
      type: input.type,
      product_id: input.productId || null,
      product_name: input.productName,
      product_image: input.productImage || null,
      quantity: input.quantity,
      unit: input.unit,
      price_per_unit: input.pricePerUnit,
      total_amount: totalAmount,
      status: 'pending' as OrderStatus,
      buyer_id: input.buyerId || (input.type === 'purchase' ? user.id : null),
      seller_id: input.sellerId || (input.type === 'sale' ? user.id : null),
      buyer_name: input.buyerName || (input.type === 'purchase' ? user.name : null),
      seller_name: input.sellerName || (input.type === 'sale' ? user.name : null),
      delivery_address: input.deliveryAddress || null,
      payment_method: input.paymentMethod || null,
      payment_status: 'pending' as PaymentStatus,
      notes: input.notes || null,
    };

    // If offline, queue for sync
    if (!offlineCache.isOnline()) {
      const tempId = `temp_${Date.now()}`;
      const tempOrder: Order = {
        id: tempId,
        userId: user.id,
        type: input.type,
        productId: input.productId,
        productName: input.productName,
        productImage: input.productImage,
        quantity: input.quantity,
        unit: input.unit,
        pricePerUnit: input.pricePerUnit,
        totalAmount,
        status: 'pending',
        buyerId: orderData.buyer_id || undefined,
        sellerId: orderData.seller_id || undefined,
        buyerName: orderData.buyer_name || undefined,
        sellerName: orderData.seller_name || undefined,
        deliveryAddress: input.deliveryAddress,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'pending',
        notes: input.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to local state
      setOrders(prev => [tempOrder, ...prev]);

      // Queue for sync
      await offlineCache.addPendingSync({
        type: 'create',
        table: 'orders',
        data: orderData,
      });

      return { order: tempOrder, error: null };
    }

    // Online - create directly
    try {
      const { data, error: createError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (createError) {
        return { order: null, error: new Error(createError.message) };
      }

      const newOrder = mapDbOrderToOrder(data);
      setOrders(prev => [newOrder, ...prev]);

      return { order: newOrder, error: null };
    } catch (err) {
      console.error('Create order error:', err);
      return { order: null, error: err as Error };
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<{ error: Error | null }> => {
    if (!offlineCache.isOnline()) {
      // Queue for sync
      await offlineCache.addPendingSync({
        type: 'update',
        table: 'orders',
        data: { id: orderId, status },
      });

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
        )
      );

      return { error: null };
    }

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) {
        return { error: new Error(updateError.message) };
      }

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
        )
      );

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus): Promise<{ error: Error | null }> => {
    if (!offlineCache.isOnline()) {
      await offlineCache.addPendingSync({
        type: 'update',
        table: 'orders',
        data: { id: orderId, payment_status: paymentStatus },
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, paymentStatus, updatedAt: new Date() } : order
        )
      );

      return { error: null };
    }

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId);

      if (updateError) {
        return { error: new Error(updateError.message) };
      }

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, paymentStatus, updatedAt: new Date() } : order
        )
      );

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const result = await updateOrderStatus(orderId, 'cancelled');
    return result.error === null;
  };

  // Refresh orders (for pull-to-refresh)
  const refreshOrders = async (): Promise<void> => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Get order by ID
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    // Check local state first
    const localOrder = orders.find(o => o.id === orderId);
    if (localOrder) return localOrder;

    // Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !data) return null;

      return mapDbOrderToOrder(data);
    } catch (err) {
      console.error('Get order by ID error:', err);
      return null;
    }
  };

  // Get order statistics
  const getOrderStats = () => {
    const totalPurchases = purchases.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSales = sales.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return { totalPurchases, totalSales, pendingOrders };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        purchases,
        sales,
        isLoading,
        loading: isLoading, // alias for backward compatibility
        refreshing,
        error,
        fetchOrders,
        refreshOrders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        cancelOrder,
        getOrderById,
        getOrderStats,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// Helper to map database order to Order interface
function mapDbOrderToOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    userId: dbOrder.user_id,
    type: dbOrder.type,
    productId: dbOrder.product_id || undefined,
    productName: dbOrder.product_name,
    productImage: dbOrder.product_image || undefined,
    quantity: Number(dbOrder.quantity),
    unit: dbOrder.unit,
    pricePerUnit: Number(dbOrder.price_per_unit),
    totalAmount: Number(dbOrder.total_amount),
    status: dbOrder.status,
    buyerId: dbOrder.buyer_id || undefined,
    sellerId: dbOrder.seller_id || undefined,
    buyerName: dbOrder.buyer_name || undefined,
    sellerName: dbOrder.seller_name || undefined,
    deliveryAddress: dbOrder.delivery_address || undefined,
    paymentMethod: dbOrder.payment_method || undefined,
    paymentStatus: dbOrder.payment_status,
    notes: dbOrder.notes || undefined,
    trackingNumber: dbOrder.tracking_number || undefined,
    createdAt: new Date(dbOrder.created_at),
    updatedAt: new Date(dbOrder.updated_at),
  };
}

export default OrderContext;
