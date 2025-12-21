# SEMMA-AI Setup Instructions

## 📧 Email Service Setup (Choose One)

### Option 1: Resend (Recommended - Free Tier)
1. Sign up at https://resend.com
2. Verify your domain or use their test domain
3. Get your API key from dashboard
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
5. Install package:
   ```bash
   npm install resend
   ```
6. Uncomment the Resend code in `app/api/contact/route.ts`

### Option 2: Gmail SMTP (Free)
1. Enable 2-factor authentication on your Gmail
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Add to `.env.local`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
4. Install nodemailer:
   ```bash
   npm install nodemailer
   ```

## 📨 Newsletter Setup (Choose One)

### Option 1: Mailchimp (Free up to 500 contacts)
1. Sign up at https://mailchimp.com
2. Create an Audience
3. Get API Key: Account > Extras > API keys
4. Get Audience ID: Audience > Settings > Audience name and defaults
5. Add to `.env.local`:
   ```
   MAILCHIMP_API_KEY=xxxxxxxxxxxxx-us21
   MAILCHIMP_AUDIENCE_ID=xxxxxxxxxxxxx
   ```
6. Uncomment the Mailchimp code in `app/api/newsletter/route.ts`

### Option 2: ConvertKit (Free up to 1000 subscribers)
1. Sign up at https://convertkit.com
2. Create a form
3. Get API key from Settings

### Option 3: Save to Database
- Use Supabase, MongoDB, or your preferred database
- Uncomment the database save code in the API routes

## 📊 Google Analytics Setup

1. Go to https://analytics.google.com
2. Create a new property for your website
3. Get your Measurement ID (starts with G-)
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
5. Deploy - Analytics will start tracking automatically!

## 🌐 Production Deployment

1. Create `.env.local` file (copy from `.env.example`)
2. Fill in all your API keys
3. Update `NEXT_PUBLIC_SITE_URL` to your actual domain
4. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```
5. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`

## 🚀 Performance Optimizations Applied

✅ Next.js Image optimization (AVIF/WebP formats)
✅ Compression enabled
✅ SWC minification
✅ Lazy loading for images
✅ Code splitting
✅ Static generation where possible

## 📝 Notes

- Test contact form locally before deploying
- Newsletter submissions are logged to console until you configure a service
- Sitemap auto-generates at `/sitemap.xml`
- Robots.txt available at `/robots.txt`
- Google Analytics only loads in production

## 🔒 Security

- Never commit `.env.local` to Git
- Keep API keys secure
- Use environment variables for all sensitive data
- Enable CORS protection in production
