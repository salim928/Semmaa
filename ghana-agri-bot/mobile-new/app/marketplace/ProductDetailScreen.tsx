import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart } from '../../context/CartContext';


const screenWidth = Dimensions.get('window').width;
const FOOTER_HEIGHT = 84;

const ProductDetailScreen = () => {
  const router = useRouter();
  const { product: productParam } = useLocalSearchParams<{ product: string }>();
  const { addToCart } = useCart();

  // Parse product from params (defensive)
  let product: any = {};
  try {
    product = productParam ? JSON.parse(productParam) : {};
  } catch {
    product = {};
  }

  const [quantity, setQuantity] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const basePrice = parseFloat(product?.price) || 0;

  // Mock price trend data (defensive with basePrice)
  const priceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [
          +(basePrice * 0.95).toFixed(2),
          +(basePrice * 0.97).toFixed(2),
          +(basePrice * 0.94).toFixed(2),
          +(basePrice * 0.98).toFixed(2),
          +basePrice.toFixed(2),
          +(basePrice * 1.02).toFixed(2),
          +basePrice.toFixed(2),
        ],
        color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#006400',
    },
  };

  const handleContactSeller = () => {
    router.push({
      pathname: '/marketplace/MarketplaceChatScreen',
      params: {
        seller: JSON.stringify({
          id: product.sellerId || '1',
          name: product.seller || 'Seller',
          phone: product.sellerPhone || '+233241234567',
          avatar: product.sellerAvatar || undefined,
        }),
        product: JSON.stringify({
          name: product.name,
          price: product.price,
          image: product.image,
        }),
      },
    });
  };

  const handleAddToCart = () => {
    addToCart?.(product);
    Alert.alert(
      'Added to Cart',
      `${quantity} ${product.unit || 'unit'}(s) of ${product.name} added to your cart.`,
      [{ text: 'OK' }]
    );
  };

  const handleSave = () => {
    setIsSaved(prev => !prev);
    Alert.alert(
      isSaved ? 'Removed from Saved' : 'Saved',
      isSaved
        ? `${product.name} removed from your saved items.`
        : `${product.name} saved for later.`,
      [{ text: 'OK' }]
    );
  };

  const adjustQuantity = (increment: boolean) => {
    setQuantity(prev => {
      if (increment) return prev + 1;
      return prev > 1 ? prev - 1 : prev;
    });
  };

  const calculateTotal = () => {
    return (basePrice * quantity).toFixed(2);
  };

  if (!product || !product.name) {
    return (
      <SafeAreaView style={[styles.flex1, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ textAlign: 'center', color: '#888' }}>
          Product not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex1}>
      <StatusBar barStyle="dark-content" />
      {/* Back button overlay */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={22} color="#006400" />
      </TouchableOpacity>

      <ScrollView
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT + 32 }}
      >
        {/* Product Image */}
        <View style={styles.productImageSection}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImageIconContainer}>
              <Ionicons name="basket" size={80} color="#ffffff" />
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} accessibilityRole="button">
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color={isSaved ? '#dc3545' : '#333'} />
          </TouchableOpacity>

          {/* Badges */}
          {product.isNew && (
            <View style={styles.badgeNew}>
              <Text style={styles.badgeNewText}>New</Text>
            </View>
          )}
          {product.isBestPrice && (
            <View style={styles.badgeBest}>
              <Text style={styles.badgeBestText}>Best Price</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.productTitle}>{product.name}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.productPrice}>GHS {basePrice.toFixed(2)}</Text>
              <Text style={styles.productUnit}>per {product.unit || 'kg'}</Text>
            </View>
          </View>

          <View style={styles.rowAlign}>
            <Ionicons name="location" size={16} color="#999" />
            <Text style={styles.productLocationText}>
              {product.location ?? 'Unknown location'} {product.distance ? `• ${product.distance}` : ''}
            </Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.rowAlign}>
            <View style={styles.sellerAvatar}>
              {product.sellerAvatar ? (
                <Image source={{ uri: product.sellerAvatar }} style={styles.sellerAvatarImg} />
              ) : (
                <Ionicons name="person" size={24} color="#ffffff" />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{product.seller ?? 'Seller'}</Text>
              <View style={[styles.rowAlign, { marginTop: 4 }]}>
                <Ionicons name="star" size={14} color="#ffc107" />
                <Text style={styles.sellerRating}>4.8 (124 reviews) • Member since 2023</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleContactSeller()}
              style={styles.contactSellerSmall}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#006400" />
              <Text style={{ color: '#006400', marginLeft: 6, fontWeight: '600' }}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Details */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Category:</Text>
            <Text style={styles.detailsValue}>{product.category || 'N/A'}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Tags:</Text>
            <Text style={styles.detailsValue}>{Array.isArray(product.tags) ? product.tags.join(', ') : 'N/A'}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Quality:</Text>
            <Text style={styles.detailsValue}>Premium Grade A</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Available:</Text>
            <Text style={styles.detailsValue}>500 {product.unit || 'kg'}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Harvest:</Text>
            <Text style={styles.detailsValue}>2 days ago</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Stock:</Text>
            <Text style={[styles.detailsValue, { color: (product.stock || 0) > 0 ? '#006400' : '#ff5252' }]}>
              {(product.stock || 0) > 0 ? `${product.stock} available` : 'Out of stock'}
            </Text>
          </View>
        </View>

        {/* Price Trend */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Price Trend (Last 7 Days)</Text>
          <LineChart
            data={priceData}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            yAxisLabel="GHS "
            yAxisInterval={1}
          />
        </View>

        {/* Quantity Selector */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.rowBetween}>
            <View style={styles.rowAlign}>
              <TouchableOpacity onPress={() => adjustQuantity(false)} style={styles.qtyButton}>
                <Ionicons name="remove" size={18} color="#333" />
              </TouchableOpacity>

              <Text style={styles.qtyText}>{quantity} {product.unit || 'kg'}</Text>

              <TouchableOpacity onPress={() => adjustQuantity(true)} style={styles.qtyButton}>
                <Ionicons name="add" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>GHS {calculateTotal()}</Text>
            </View>
          </View>
        </View>

        {/* Discount Badge */}
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={{ color: '#fff', fontSize: 12 }}>{product.discount}% OFF</Text>
          </View>
        )}

        {/* Similar Products */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <Text style={styles.sectionTitle}>Similar Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {[1, 2, 3].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.similarProductCard}
                activeOpacity={0.85}
                onPress={() => {
                  // Navigate to another product (demo only)
                  router.push({
                    pathname: '/marketplace/ProductDetailScreen',
                    params: { product: JSON.stringify({ ...product, name: `Similar ${item}`, price: (basePrice - item * 0.2).toFixed(2) }) },
                  });
                }}
              >
                <View style={styles.similarProductImage}>
                  <Ionicons name="basket-outline" size={32} color="#ffffff" />
                </View>
                <View style={styles.similarProductInfo}>
                  <Text style={styles.similarProductName}>Fresh Produce</Text>
                  <Text style={styles.similarProductPrice}>GHS {(basePrice - 0.2 * item).toFixed(2)}/kg</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Reviews */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontWeight: '600', color: '#222', marginBottom: 8 }}>Recent Reviews</Text>
          {[{ user: 'Ama', comment: 'Very fresh!', rating: 5 }].map((rev, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="person-circle" size={20} color="#888" />
              <Text style={{ marginLeft: 8, fontWeight: '500' }}>{rev.user}:</Text>
              <Text style={{ marginLeft: 8 }}>{rev.comment}</Text>
              <Ionicons name="star" size={14} color="#ffc107" style={{ marginLeft: 8 }} />
              <Text style={{ color: '#888', marginLeft: 4 }}>{rev.rating}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer actions: Map + Contact + Add to Cart */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/marketplace/MapView', params: { location: product.location } })}
          style={styles.mapButton}
        >
          <Ionicons name="map" size={20} color="#006400" />
          <Text style={{ color: '#006400', marginLeft: 6, fontWeight: '600' }}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleContactSeller} style={[styles.actionButton, styles.actionButtonOutline]}>
          <Text style={styles.actionButtonOutlineText}>Contact Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAddToCart} style={[styles.actionButton, styles.actionButtonFilled]}>
          <Text style={styles.actionButtonFilledText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: '#f7f7f7' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  productImageSection: {
    height: 280,
    backgroundColor: '#b7e0c7',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: { width: '100%', height: '100%' },
  productImageIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 18,
    right: 16,
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeNew: {
    position: 'absolute',
    top: 18,
    left: 16,
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  badgeNewText: { color: '#fff', fontSize: 12 },
  badgeBest: {
    position: 'absolute',
    top: 58,
    left: 16,
    backgroundColor: '#ffc107',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  badgeBestText: { color: '#222', fontSize: 12 },

  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006400',
  },
  productUnit: {
    fontSize: 13,
    color: '#888',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productLocationText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },

  sellerAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#006400',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerAvatarImg: { width: 48, height: 48, borderRadius: 24 },
  sellerName: {
    fontWeight: '600',
    color: '#222',
    fontSize: 15,
  },
  sellerRating: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },

  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 13,
    color: '#888',
    width: 100,
  },
  detailsValue: {
    fontSize: 13,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },

  chart: {
    marginVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },

  qtyButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  totalLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
    textAlign: 'right',
  },

  similarProductCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    width: 140,
    elevation: 1,
  },
  similarProductImage: {
    height: 70,
    backgroundColor: '#b7e0c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarProductInfo: {
    padding: 10,
  },
  similarProductName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#222',
    marginBottom: 2,
  },
  similarProductPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#006400',
  },

  discountBadge: {
    backgroundColor: '#ff5252',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 6,
  },

  footer: {
    height: FOOTER_HEIGHT,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.06)',
    marginRight: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButtonOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#006400',
  },
  actionButtonOutlineText: {
    color: '#006400',
    fontWeight: '600',
    fontSize: 15,
  },
  actionButtonFilled: {
    backgroundColor: '#006400',
  },
  actionButtonFilledText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  contactSellerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },

  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 12,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
});