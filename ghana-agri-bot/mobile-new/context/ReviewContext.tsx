// context/ReviewContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

export interface Review {
  id: string;
  order_id: string;
  product_id: string;
  user_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  // joined data
  product_name?: string;
  reviewer_name?: string;
}

interface ReviewContextType {
  reviews: Review[];
  loading: boolean;
  createReview: (review: {
    order_id: string;
    product_id: string;
    seller_id: string;
    rating: number;
    comment?: string;
    images?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  getProductReviews: (productId: string) => Promise<Review[]>;
  getOrderReview: (orderId: string) => Promise<Review | null>;
  canReview: (orderId: string) => Promise<boolean>;
  averageRating: (productId: string) => Promise<number>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createReview = async (review: {
    order_id: string;
    product_id: string;
    seller_id: string;
    rating: number;
    comment?: string;
    images?: string[];
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      setLoading(true);

      // Check if review already exists
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', review.order_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return { success: false, error: 'You have already reviewed this order' };
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setReviews(prev => [data, ...prev]);
      return { success: true };
    } catch (error: any) {
      console.error('Create review error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getProductReviews = async (productId: string): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((r: any) => ({
        ...r,
        reviewer_name: r.profiles?.full_name,
      })) || [];
    } catch (error) {
      console.error('Get product reviews error:', error);
      return [];
    }
  };

  const getOrderReview = async (orderId: string): Promise<Review | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Get order review error:', error);
      return null;
    }
  };

  const canReview = async (orderId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if order is delivered and not already reviewed
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .single();

      if (orderError || order?.status !== 'delivered') return false;

      const { data: review } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('user_id', user.id)
        .single();

      return !review;
    } catch (error) {
      return false;
    }
  };

  const averageRating = async (productId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error || !data || data.length === 0) return 0;

      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      return sum / data.length;
    } catch (error) {
      return 0;
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        loading,
        createReview,
        getProductReviews,
        getOrderReview,
        canReview,
        averageRating,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within ReviewProvider');
  }
  return context;
};
