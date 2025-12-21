// lib/storage.ts - Supabase storage utilities for image uploads

import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

// Upload an image to Supabase storage
export async function uploadImage(
  file: File,
  bucket: string = 'posts',
  folder?: string
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Image must be less than 5MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Upload multiple images
export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'posts',
  folder?: string
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(file => uploadImage(file, bucket, folder))
  )
  return results
}

// Delete an image from storage
export async function deleteImage(
  path: string,
  bucket: string = 'posts'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

// Get a signed URL for private files
export async function getSignedUrl(
  path: string,
  bucket: string = 'posts',
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL error:', error)
    return null
  }
}

// Compress image before upload (client-side)
export function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Scale down if necessary
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file) // Return original if canvas not supported
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}

// Create image preview URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// Revoke image preview URL to free memory
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}
