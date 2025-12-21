import { Slot } from 'expo-router';
import { CartProvider } from '../../context/CartContext';

export default function MarketplaceLayout() {
  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}