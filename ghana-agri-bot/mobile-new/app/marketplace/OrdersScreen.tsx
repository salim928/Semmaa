import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BackButton from '../../components/BackButton';
import Card from '../../components/ui/Card';
import { formatCurrency, formatRelativeTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useOrders, Order } from '../../context/OrderContext';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { offlineCache } from '../../utils/offlineCache';
import { useReviews } from '../../context/ReviewContext';

const OrdersScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    orders, 
    loading, 
    refreshing, 
    refreshOrders, 
    cancelOrder,
    getOrderStats,
  } = useOrders();
  const { createReview, canReview } = useReviews();
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
  const [isOnline, setIsOnline] = useState(true);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(o => o.type === activeTab.slice(0, -1) as 'purchase' | 'sale');
  const stats = getOrderStats();

  useEffect(() => {
    // Check network status
    const checkNetwork = async () => {
      const online = await offlineCache.isOnline();
      setIsOnline(online);
    };
    checkNetwork();
  }, []);

  const onRefresh = async () => {
    await refreshOrders();
    const online = await offlineCache.isOnline();
    setIsOnline(online);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500'; // orange
      case 'confirmed':
        return '#1E90FF'; // blue
      case 'processing':
        return '#9932CC'; // purple
      case 'shipped':
      case 'in_transit':
        return '#8A2BE2'; // purple
      case 'delivered':
      case 'completed':
        return '#228B22'; // green
      case 'cancelled':
        return '#B22222'; // red
      default:
        return '#808080';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'confirmed':
        return 'checkmark.seal';
      case 'processing':
        return 'gearshape';
      case 'shipped':
      case 'in_transit':
        return 'truck';
      case 'delivered':
      case 'completed':
        return 'tray.and.arrow.down';
      case 'cancelled':
        return 'xmark.octagon';
      default:
        return 'questionmark';
    }
  };

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel this order for ${order.productName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelOrder(order.id);
            if (success) {
              Alert.alert('Success', 'Order cancelled successfully');
            } else {
              Alert.alert('Error', 'Failed to cancel order. It may have been queued for when you\'re back online.');
            }
          },
        },
      ]
    );
  };

  const openReviewModal = async (order: Order) => {
    // Check if user can review
    const canLeaveReview = await canReview(order.id);
    
    if (!canLeaveReview) {
      Alert.alert('Already Reviewed', 'You have already reviewed this order.');
      return;
    }

    // Show rating dialog
    Alert.prompt(
      'Rate Your Experience',
      `Rate your purchase of ${order.productName} (1-5 stars):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async (ratingText) => {
            const rating = parseInt(ratingText || '0', 10);
            if (rating < 1 || rating > 5 || isNaN(rating)) {
              Alert.alert('Invalid Rating', 'Please enter a rating between 1 and 5');
              return;
            }

            // Get comment
            Alert.prompt(
              'Review Comment (Optional)',
              'Share your thoughts about this product:',
              [
                { text: 'Skip', onPress: () => submitReview(order, rating, '') },
                {
                  text: 'Submit',
                  onPress: (comment) => submitReview(order, rating, comment || ''),
                },
              ],
              'plain-text'
            );
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const submitReview = async (order: Order, rating: number, comment: string) => {
    const result = await createReview({
      order_id: order.id,
      product_id: order.productId || '',
      seller_id: order.sellerId || '',
      rating,
      comment: comment || undefined,
    });

    if (result.success) {
      Alert.alert('Thank You!', 'Your review has been submitted successfully.');
    } else {
      Alert.alert('Error', result.error || 'Failed to submit review');
    }
  };

  // example helper to open marketplace chat about an order
  const openContact = (contactId: string | undefined, contactName: string | undefined, order: Order) => {
    if (!contactId) {
      Alert.alert('Contact unavailable', 'This listing has no contact information.');
      return;
    }
    // route path depends on where you placed MarketplaceChat; adjust if you use a different path
    router.push({
      pathname: '/marketplace/MarketplaceChat',
      params: {
        sellerId: contactId,
        sellerName: contactName,
        productName: order.productName,
        price: order.pricePerUnit.toString(),
      },
    });
  };

  const handleTrackOrder = (order: Order) => {
    // For now, show a simple tracking alert
    Alert.alert(
      'Order Tracking',
      `Order #${order.id.slice(0, 8)}\nStatus: ${order.status.replace('_', ' ').toUpperCase()}\n\nTracking details will be available soon.`,
      [{ text: 'OK' }]
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card className="mb-4">
      {/* Offline indicator */}
      {!isOnline && (
        <View className="bg-warning/10 px-2 py-1 rounded-t-lg mb-2 -mt-2 -mx-2">
          <Text className="text-xs text-warning text-center">📴 Offline - Some features limited</Text>
        </View>
      )}
      
      {/* Order Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-lg text-textPrimary">
            {item.productName}
          </Text>
          <Text className="text-sm text-textSecondary">
            {item.quantity} {item.unit} @ {formatCurrency(item.pricePerUnit)}/{item.unit}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
        >
          <IconSymbol
            name={getStatusIcon(item.status) as any}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text 
            className="text-xs font-medium ml-1"
            style={{ color: getStatusColor(item.status) }}
          >
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Order Details */}
      <View className="space-y-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-sm text-textMuted">Order ID:</Text>
          <Text className="text-sm text-textSecondary">#{item.id.slice(0, 8)}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-textMuted">
            {item.type === 'purchase' ? 'Seller:' : 'Buyer:'}
          </Text>
          <Text className="text-sm text-textSecondary">
            {item.type === 'purchase' ? (item.sellerName || item.sellerId?.slice(0, 8)) : (item.buyerName || item.buyerId?.slice(0, 8))}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm text-textMuted">Total Amount:</Text>
          <Text className="text-base font-semibold text-primary">
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm text-textMuted">Payment:</Text>
          <View className="flex-row items-center">
            <View 
              className={`w-2 h-2 rounded-full mr-1 ${
                item.paymentStatus === 'paid' ? 'bg-success' :
                item.paymentStatus === 'pending' ? 'bg-warning' : 'bg-error'
              }`} 
            />
            <Text className="text-sm text-textSecondary capitalize">
              {item.paymentStatus} ({item.paymentMethod?.replace('_', ' ')})
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm text-textMuted">Ordered:</Text>
          <Text className="text-sm text-textSecondary">
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>

        {item.notes && (
          <View className="bg-gray-50 p-2 rounded-lg mt-1">
            <Text className="text-xs text-textSecondary">{item.notes}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 pt-3 border-t border-borderColor">
        {item.status === 'in_transit' && (
          <TouchableOpacity
            onPress={() => handleTrackOrder(item)}
            className="flex-1 py-2 bg-info/10 rounded-lg"
          >
            <View className="flex-row justify-center items-center">
              <IconSymbol name={"location" as any} size={16} color="#17a2b8" />
              <Text className="text-xs text-info ml-1">Track</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => openContact(item.sellerId, item.sellerName, item)}
          className="flex-1 py-2 bg-primary/10 rounded-lg"
          disabled={!isOnline}
          style={{ opacity: isOnline ? 1 : 0.5 }}
        >
          <View className="flex-row justify-center items-center">
            <IconSymbol name={"chatbubble" as any} size={16} color="#006400" />
            <Text className="text-xs text-primary ml-1">Message</Text>
          </View>
        </TouchableOpacity>

        {(item.status === 'pending' || item.status === 'confirmed') && (
          <TouchableOpacity
            onPress={() => handleCancelOrder(item)}
            className="flex-1 py-2 bg-error/10 rounded-lg"
          >
            <View className="flex-row justify-center items-center">
              <IconSymbol name={"close-circle" as any} size={16} color="#dc3545" />
              <Text className="text-xs text-error ml-1">Cancel</Text>
            </View>
          </TouchableOpacity>
        )}

        {item.status === 'delivered' && item.type === 'purchase' && (
          <TouchableOpacity
            className="flex-1 py-2 bg-success/10 rounded-lg"
            onPress={() => openReviewModal(item)}
          >
            <View className="flex-row justify-center items-center">
              <IconSymbol name={"star" as any} size={16} color="#28a745" />
              <Text className="text-xs text-success ml-1">Review</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const TabButton = ({ 
    title, 
    value, 
    count 
  }: { 
    title: string; 
    value: 'purchases' | 'sales'; 
    count?: number;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(value)}
      className={`flex-1 py-3 rounded-lg ${
        activeTab === value ? 'bg-primary' : 'bg-gray-100'
      }`}
    >
      <View className="flex-row justify-center items-center">
        <Text className={`text-sm font-medium ${
          activeTab === value ? 'text-white' : 'text-textSecondary'
        }`}>
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <View className={`ml-2 px-2 py-0.5 rounded-full ${
            activeTab === value ? 'bg-white/20' : 'bg-gray-300'
          }`}>
            <Text className={`text-xs ${
              activeTab === value ? 'text-white' : 'text-textSecondary'
            }`}>
              {count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <BackButton />
      <View style={{ flex: 1, paddingTop: 24, paddingBottom: 16 }}>
        {/* Offline Banner */}
        {!isOnline && (
          <View className="bg-warning px-4 py-2">
            <Text className="text-white text-center text-sm font-medium">
              📴 You're offline - Showing cached orders
            </Text>
          </View>
        )}
        
        {/* Header Tabs */}
        <View className="px-4 py-3 bg-white border-b border-borderColor">
          <View className="flex-row gap-3">
            <TabButton 
              title="My Purchases" 
              value="purchases" 
              count={orders.filter(o => o.type === 'purchase').length}
            />
            <TabButton 
              title="My Sales" 
              value="sales" 
              count={orders.filter(o => o.type === 'sale').length}
            />
          </View>
        </View>

        {/* Order Stats */}
        <View className="bg-white px-4 py-3 mb-2">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-lg font-bold text-textPrimary">
                {stats.pendingOrders}
              </Text>
              <Text className="text-xs text-textMuted">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-info">
                {filteredOrders.filter(o => o.status === 'confirmed' || o.status === 'in_transit').length}
              </Text>
              <Text className="text-xs text-textMuted">In Progress</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-success">
                {filteredOrders.filter(o => o.status === 'delivered').length}
              </Text>
              <Text className="text-xs text-textMuted">Completed</Text>
            </View>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#006400" />
            <Text className="text-textMuted mt-2">Loading orders...</Text>
          </View>
        )}

        {/* Orders List */}
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 72, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <IconSymbol name={"receipt-outline" as any} size={64} color="#ccc" />
                <Text className="text-textMuted mt-4">
                  No {activeTab === 'purchases' ? 'purchases' : 'sales'} yet
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/marketplace')}
                  className="mt-4 px-4 py-2 bg-primary rounded-lg"
                >
                  <Text className="text-white text-sm">
                    {activeTab === 'purchases' ? 'Browse Products' : 'List a Product'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;
