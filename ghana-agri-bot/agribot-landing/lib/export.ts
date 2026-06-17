// lib/export.ts
// Types + Supabase helpers for the export marketplace (see supabase/export-schema.sql)
import { supabase } from './supabase'

// ---------- enums (mirror the SQL enums) ----------
export type UserRole = 'farmer' | 'buyer' | 'admin'
export type CertType =
  | 'global_gap' | 'organic' | 'fairtrade' | 'phytosanitary'
  | 'iso22000' | 'haccp' | 'other'
export type ListingStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'archived'
export type RfqStatus = 'open' | 'quoted' | 'closed' | 'cancelled'
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
export type EscrowStatus =
  | 'awaiting_funding' | 'funded' | 'in_production' | 'shipped'
  | 'delivered' | 'released' | 'refunded' | 'disputed'

export const INCOTERMS = ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'] as const
export type Incoterm = (typeof INCOTERMS)[number]

// ---------- row types ----------
export interface BuyerProfile {
  id: string
  company_name: string
  country: string
  contact_name?: string
  website?: string
  vat_number?: string
  verified: boolean
  created_at: string
}

export interface Certification {
  id: string
  farmer_id: string
  type: CertType
  document_url?: string
  issued_date?: string
  expiry_date?: string
  verified: boolean
  created_at: string
}

export interface ExportListing {
  id: string
  farmer_id: string
  crop: string
  variety?: string
  grade?: string
  quantity_kg: number
  price_per_kg: number
  currency: string
  incoterm: string
  origin_region?: string
  available_from?: string
  harvest_window?: string
  certification_ids?: string[]
  photos?: string[]
  description?: string
  status: ListingStatus
  created_at: string
  updated_at: string
}

export interface Rfq {
  id: string
  buyer_id: string
  crop: string
  grade?: string
  quantity_kg: number
  target_price_per_kg?: number
  currency: string
  incoterm: string
  destination_country: string
  needed_by?: string
  notes?: string
  status: RfqStatus
  created_at: string
}

export interface Quote {
  id: string
  rfq_id?: string
  listing_id?: string
  farmer_id: string
  buyer_id: string
  price_per_kg: number
  quantity_kg: number
  currency: string
  incoterm: string
  valid_until?: string
  status: QuoteStatus
  created_at: string
}

export interface ExportOrder {
  id: string
  buyer_id: string
  farmer_id: string
  listing_id?: string
  quote_id?: string
  crop: string
  grade?: string
  quantity_kg: number
  price_per_kg: number
  total_amount: number
  currency: string
  incoterm: string
  destination_country?: string
  escrow_status: EscrowStatus
  tracking_ref?: string
  created_at: string
  updated_at: string
}

// Ordered escrow lifecycle (for progress UIs).
export const ESCROW_FLOW: EscrowStatus[] = [
  'awaiting_funding', 'funded', 'in_production', 'shipped', 'delivered', 'released',
]

// ---------- helpers ----------
export const exportApi = {
  // Listings (demand side browses active; supply side manages own)
  async activeListings(filters?: { crop?: string }): Promise<ExportListing[]> {
    let q = supabase.from('export_listings').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
    if (filters?.crop) q = q.ilike('crop', `%${filters.crop}%`)
    const { data, error } = await q
    if (error) { console.warn('activeListings:', error.message); return [] }
    return data ?? []
  },

  async myListings(farmerId: string): Promise<ExportListing[]> {
    const { data, error } = await supabase.from('export_listings').select('*')
      .eq('farmer_id', farmerId).order('created_at', { ascending: false })
    if (error) { console.warn('myListings:', error.message); return [] }
    return data ?? []
  },

  async createListing(
    listing: Omit<ExportListing, 'id' | 'created_at' | 'updated_at' | 'status'>
      & { status?: ListingStatus },
  ): Promise<ExportListing | null> {
    const { data, error } = await supabase.from('export_listings')
      .insert({ status: 'active', ...listing }).select().single()
    if (error) { console.error('createListing:', error.message); return null }
    return data
  },

  // RFQs (demand side)
  async openRfqs(): Promise<Rfq[]> {
    const { data, error } = await supabase.from('rfqs').select('*')
      .eq('status', 'open').order('created_at', { ascending: false })
    if (error) { console.warn('openRfqs:', error.message); return [] }
    return data ?? []
  },

  async createRfq(rfq: Omit<Rfq, 'id' | 'created_at' | 'status'>): Promise<Rfq | null> {
    const { data, error } = await supabase.from('rfqs')
      .insert({ status: 'open', ...rfq }).select().single()
    if (error) { console.error('createRfq:', error.message); return null }
    return data
  },

  // Quotes
  async createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'status'>): Promise<Quote | null> {
    const { data, error } = await supabase.from('quotes')
      .insert({ status: 'pending', ...quote }).select().single()
    if (error) { console.error('createQuote:', error.message); return null }
    return data
  },

  // Orders (buyer creates on accepting a quote; escrow starts awaiting_funding)
  async myOrders(profileId: string, side: 'buyer' | 'farmer'): Promise<ExportOrder[]> {
    const col = side === 'buyer' ? 'buyer_id' : 'farmer_id'
    const { data, error } = await supabase.from('export_orders').select('*')
      .eq(col, profileId).order('created_at', { ascending: false })
    if (error) { console.warn('myOrders:', error.message); return [] }
    return data ?? []
  },

  async createOrder(
    order: Omit<ExportOrder, 'id' | 'created_at' | 'updated_at' | 'escrow_status' | 'total_amount'>,
  ): Promise<ExportOrder | null> {
    const total_amount = order.quantity_kg * order.price_per_kg
    const { data, error } = await supabase.from('export_orders')
      .insert({ ...order, total_amount, escrow_status: 'awaiting_funding' })
      .select().single()
    if (error) { console.error('createOrder:', error.message); return null }
    return data
  },
}
