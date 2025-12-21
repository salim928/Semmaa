//app/_layout

import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { CartProvider } from '../context/CartContext';
import { NotificationsProvider } from '../context/NotificationsContext';
import { OrderProvider } from '../context/OrderContext';
import { WalletProvider } from '../context/WalletContext';
import { ReviewProvider } from '../context/ReviewContext';

export default function RootLayout() {
  return (
    <NotificationsProvider>
      <AuthProvider>
        <AppProvider>
          <WalletProvider>
            <OrderProvider>
              <ReviewProvider>
                <CartProvider>
                  <Slot />
                </CartProvider>
              </ReviewProvider>
            </OrderProvider>
          </WalletProvider>
        </AppProvider>
      </AuthProvider>
    </NotificationsProvider>
  );
}