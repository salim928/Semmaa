import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Dummy data: Replace with your real product list and coordinates
const DUMMY_PRODUCTS = [
  {
    id: '1',
    name: 'Fresh Maize',
    price: '20',
    unit: 'kg',
    location: 'Kumasi',
    latitude: 6.6884,
    longitude: -1.6244,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    name: 'Tomatoes',
    price: '15',
    unit: 'crate',
    location: 'Accra',
    latitude: 5.6037,
    longitude: -0.1870,
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
  // ...more products
];

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MapViewScreen = () => {
  const [products, setProducts] = useState(DUMMY_PRODUCTS); // Replace with real fetch
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Optionally, fetch products with coordinates here
  // useEffect(() => { ... }, []);

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <ActivityIndicator size="large" color="#006400" />
        </View>
      )}
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 7.9465, // Center of Ghana
          longitude: -1.0232,
          latitudeDelta: 3,
          longitudeDelta: 3,
        }}
      >
        {products.map(product => (
          <Marker
            key={product.id}
            coordinate={{
              latitude: product.latitude,
              longitude: product.longitude,
            }}
            title={product.name}
            description={`GHS ${product.price}/${product.unit} - ${product.location}`}
          >
            <Callout
              onPress={() =>
                router.push({
                  pathname: '/marketplace/ProductDetailScreen',
                  params: { product: JSON.stringify(product) },
                })
              }
            >
              <View style={{ width: 180 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{product.name}</Text>
                <Text style={{ color: '#006400', fontWeight: '600' }}>
                  GHS {product.price}/{product.unit}
                </Text>
                <Text style={{ color: '#888' }}>{product.location}</Text>
                {product.image && (
                  <View style={{ marginTop: 4, alignItems: 'center' }}>
                    <Image source={{ uri: product.image }} style={{ width: 120, height: 60, borderRadius: 8 }} />
                  </View>
                )}
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    backgroundColor: '#006400',
                    borderRadius: 8,
                    paddingVertical: 6,
                    alignItems: 'center',
                  }}
                  onPress={() =>
                    router.push({
                      pathname: '/marketplace/ProductDetailScreen',
                      params: { product: JSON.stringify(product) },
                    })
                  }
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {/* Optional: Add a button to recenter or filter */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 40,
          right: 20,
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 10,
          elevation: 3,
        }}
        onPress={() => {
          // Add filter or recenter logic here
        }}
      >
        <Ionicons name="options-outline" size={24} color="#006400" />
      </TouchableOpacity>
    </View>
  );
};

export default MapViewScreen;