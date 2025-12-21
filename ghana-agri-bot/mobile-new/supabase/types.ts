// supabase/types.ts
// Auto-generated types for Supabase tables
// You can also generate these automatically using:
// npx supabase gen types typescript --project-id your-project-id > supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          full_name: string | null;
          location: string | null;
          region: string | null;
          district: string | null;
          farm_size: string | null;
          crops: string[];
          preferred_language: string;
          avatar_url: string | null;
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          full_name?: string | null;
          location?: string | null;
          region?: string | null;
          district?: string | null;
          farm_size?: string | null;
          crops?: string[];
          preferred_language?: string;
          avatar_url?: string | null;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          full_name?: string | null;
          location?: string | null;
          region?: string | null;
          district?: string | null;
          farm_size?: string | null;
          crops?: string[];
          preferred_language?: string;
          avatar_url?: string | null;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          description: string | null;
          category: string;
          subcategory: string | null;
          price: number;
          unit: string;
          quantity_available: number;
          min_order_quantity: number;
          images: string[];
          location: string | null;
          region: string | null;
          is_available: boolean;
          is_organic: boolean;
          harvest_date: string | null;
          expiry_date: string | null;
          tags: string[];
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          description?: string | null;
          category: string;
          subcategory?: string | null;
          price: number;
          unit: string;
          quantity_available: number;
          min_order_quantity?: number;
          images?: string[];
          location?: string | null;
          region?: string | null;
          is_available?: boolean;
          is_organic?: boolean;
          harvest_date?: string | null;
          expiry_date?: string | null;
          tags?: string[];
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          subcategory?: string | null;
          price?: number;
          unit?: string;
          quantity_available?: number;
          min_order_quantity?: number;
          images?: string[];
          location?: string | null;
          region?: string | null;
          is_available?: boolean;
          is_organic?: boolean;
          harvest_date?: string | null;
          expiry_date?: string | null;
          tags?: string[];
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          type: 'purchase' | 'sale';
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          quantity: number;
          unit: string;
          price_per_unit: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
          buyer_id: string | null;
          seller_id: string | null;
          buyer_name: string | null;
          seller_name: string | null;
          delivery_address: string | null;
          payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | null;
          payment_status: 'pending' | 'paid' | 'refunded';
          notes: string | null;
          tracking_number: string | null;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'purchase' | 'sale';
          product_id?: string | null;
          product_name: string;
          product_image?: string | null;
          quantity: number;
          unit: string;
          price_per_unit: number;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
          buyer_id?: string | null;
          seller_id?: string | null;
          buyer_name?: string | null;
          seller_name?: string | null;
          delivery_address?: string | null;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | null;
          payment_status?: 'pending' | 'paid' | 'refunded';
          notes?: string | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'purchase' | 'sale';
          product_id?: string | null;
          product_name?: string;
          product_image?: string | null;
          quantity?: number;
          unit?: string;
          price_per_unit?: number;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
          buyer_id?: string | null;
          seller_id?: string | null;
          buyer_name?: string | null;
          seller_name?: string | null;
          delivery_address?: string | null;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | null;
          payment_status?: 'pending' | 'paid' | 'refunded';
          notes?: string | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          message_type: 'text' | 'image' | 'product' | 'order';
          metadata: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          message_type?: 'text' | 'image' | 'product' | 'order';
          metadata?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          receiver_id?: string;
          message?: string;
          message_type?: 'text' | 'image' | 'product' | 'order';
          metadata?: Json;
          is_read?: boolean;
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          rating: number;
          comment: string | null;
          location: string | null;
          language: string;
          feature: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          rating: number;
          comment?: string | null;
          location?: string | null;
          language?: string;
          feature?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          rating?: number;
          comment?: string | null;
          location?: string | null;
          language?: string;
          feature?: string | null;
          created_at?: string;
        };
      };
      ai_chat_history: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      saved_crops: {
        Row: {
          id: string;
          user_id: string;
          crop_name: string;
          planting_date: string | null;
          expected_harvest: string | null;
          field_size: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          crop_name: string;
          planting_date?: string | null;
          expected_harvest?: string | null;
          field_size?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          crop_name?: string;
          planting_date?: string | null;
          expected_harvest?: string | null;
          field_size?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: string;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type?: string;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          type?: string;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];

export type AIChatHistory = Database['public']['Tables']['ai_chat_history']['Row'];
export type AIChatHistoryInsert = Database['public']['Tables']['ai_chat_history']['Insert'];

export type SavedCrop = Database['public']['Tables']['saved_crops']['Row'];
export type SavedCropInsert = Database['public']['Tables']['saved_crops']['Insert'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
