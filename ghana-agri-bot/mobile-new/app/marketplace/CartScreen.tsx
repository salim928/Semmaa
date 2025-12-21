import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useCart } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CartScreen = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const getTotal = () =>
    cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#064e3b" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#064e3b' }}>My Cart</Text>
      </View>
      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            padding: 12,
            backgroundColor: '#f3f3f3',
            borderRadius: 10,
          }}>
            <View>
              <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: '#666' }}>GHS {item.price} / {item.unit}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeFromCart(item.id)}
              style={{ padding: 6 }}
            >
              <Ionicons name="trash" size={20} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>Your cart is empty.</Text>}
      />
      {cart.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Total: GHS {getTotal().toFixed(2)}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#10b981',
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 12,
            }}
            onPress={() => Alert.alert('Checkout', 'Proceed to checkout (not implemented)')}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#f59e0b',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center',
            }}
            onPress={() =>
              Alert.alert('Clear Cart', 'Remove all items from cart?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearCart },
              ])
            }
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Clear Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;