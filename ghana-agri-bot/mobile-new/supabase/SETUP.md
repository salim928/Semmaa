# Supabase Setup Guide for Semma AgriBot

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project name**: `semma-agribot` (or your preferred name)
   - **Database password**: Generate a strong password (save this!)
   - **Region**: Choose closest to Ghana (e.g., `eu-west-1` or `eu-central-1`)
4. Click "Create new project" and wait for setup (~2 minutes)

## 2. Get Your API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

3. Update `config/supabase.ts`:
   ```typescript
   const SUPABASE_URL = 'https://your-project-ref.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

## 3. Run the Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned" for each statement

## 4. Enable Phone Authentication

1. Go to **Authentication** → **Providers**
2. Find **Phone** and enable it
3. Configure SMS provider (Twilio recommended for Ghana):

### Option A: Twilio Setup (Recommended)
1. Create account at [twilio.com](https://twilio.com)
2. Get your credentials:
   - Account SID
   - Auth Token
   - Messaging Service SID (or Phone Number)
3. In Supabase, enter these credentials

### Option B: Use Supabase's Built-in (Testing Only)
- Enable "Phone" provider
- For development, OTP codes appear in **Authentication** → **Users** logs

## 5. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Set these values:
   - **Site URL**: `exp://` (for Expo development) or your production URL
   - **Redirect URLs**: Add `exp://`, `semmaagribot://`
   
3. Under **Phone Auth**:
   - **OTP Expiry**: 300 (5 minutes)
   - **SMS Message**: 
     ```
     Your Semma AgriBot verification code is: {{.Token}}
     ```

## 6. Set Up Storage (For Images)

1. Go to **Storage**
2. Create these buckets:
   - `avatars` - for user profile pictures
   - `products` - for marketplace product images
   - `chat-images` - for chat attachments

3. Set bucket policies (click bucket → Policies):

For `avatars`:
```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public viewing of avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

For `products`:
```sql
-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow public viewing of product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

## 7. Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `orders`
   - `chat_messages`
   - `notifications`

## 8. Test Your Setup

Run the app and test:

```bash
cd ghana-agri-bot/mobile-new
npx expo start
```

1. **Sign Up**: Enter a Ghana phone number (+233...)
2. **Verify OTP**: Check your phone or Supabase logs
3. **Create Profile**: Fill in your details
4. **Test Orders**: Create a test order

## 9. Environment Variables (Production)

For production, create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Update `config/supabase.ts` to use environment variables:

```typescript
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
```

## Troubleshooting

### "Invalid API key"
- Check that you're using the `anon` key, not the `service_role` key
- Verify the URL matches exactly (no trailing slash)

### Phone OTP not received
- Check Twilio balance and logs
- Verify phone number format (+233xxxxxxxxx)
- Check Supabase Auth logs for errors

### RLS Policy Errors
- Make sure user is authenticated before making requests
- Check that policies are correctly created

### "relation does not exist"
- Run the schema.sql file again
- Check SQL Editor for any error messages

## Database Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │────<│   orders    │>────│  products   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │            ┌──────┴──────┐            │
       │            │             │            │
       ▼            ▼             ▼            ▼
┌─────────────┐ ┌─────────┐ ┌───────────┐ ┌─────────┐
│chat_messages│ │feedback │ │ai_chat    │ │saved_   │
└─────────────┘ └─────────┘ │_history   │ │crops    │
                            └───────────┘ └─────────┘
```

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
