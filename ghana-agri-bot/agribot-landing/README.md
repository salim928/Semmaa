# 🌾 SEMMA-AI Landing Page

**Smarter Advice. Bigger Harvests.**

AI-powered agricultural platform revolutionizing farming in Ghana with smart insights, digital marketplace, and community features.

## ✨ Features

- 🏠 **Modern Landing Page** with hero section and animated 3D background
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Beautiful UI** with Tailwind CSS and Framer Motion animations
- 📄 **Multiple Pages**: Home, About, Features, Pricing, Blog, Support
- 📧 **Working Contact Form** with API integration
- 📨 **Newsletter Signup** functionality
- 📊 **Google Analytics** integration ready
- 🔍 **SEO Optimized** with sitemap and robots.txt
- ⚡ **Performance Optimized** with Next.js Image and lazy loading

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API keys (see SETUP.md)

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: [http://localhost:3000](http://localhost:3000)

Farmer web app routes:

- `/farmer` – Farmer dashboard (home)
- `/farmer/chat` – AI advisory chat (talks to FastAPI `/ask`)
- `/farmer/market` – Market prices view (uses `/market/crops` and `/market/prices`)

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions for email, analytics, etc.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment checklist and troubleshooting
- **[CONTENT-MANAGEMENT.md](./CONTENT-MANAGEMENT.md)** - Guide for updating content

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.6
- **UI**: React 19.1.0, Tailwind CSS 3.4.0
- **Animations**: Framer Motion 12.23.24
- **3D Graphics**: Three.js with React Three Fiber
- **Icons**: Lucide React
- **Language**: TypeScript

## 📁 Project Structure

```
agribot-landing/
├── app/
│   ├── about/          # About page
│   ├── blog/           # Blog listing and posts
│   ├── features/       # Features page
│   ├── pricing/        # Pricing page
│   ├── support/        # Support/Contact page
│   ├── api/            # API routes (contact, newsletter)
│   ├── components/     # Reusable components
│   ├── layout.tsx      # Root layout with analytics
│   ├── page.tsx        # Home page
│   ├── sitemap.ts      # SEO sitemap
│   └── robots.ts       # Robots.txt
├── public/
│   ├── team/           # Team member photos
│   └── semma-logo.svg  # Logo
└── ...config files
```

## 📧 Contact Form Setup

Choose and configure one email service (see SETUP.md):
- **Resend** (Recommended) - 3,000 emails/month free
- **Gmail SMTP** - Free, unlimited
- **SendGrid** - 100 emails/day free

## 📨 Newsletter Setup

Choose and configure one newsletter service (see SETUP.md):
- **Mailchimp** - 500 contacts free
- **ConvertKit** - 1,000 subscribers free
- **Save to Database** - Use Supabase/MongoDB

## 🚀 Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard

4. **Done!** Your site is live 🎉

## 📊 Performance

- ✅ Image optimization (AVIF/WebP)
- ✅ Code splitting and lazy loading
- ✅ Compression enabled
- ✅ SWC minification
- ✅ Responsive images with Next.js Image

## 🔐 Environment Variables

Required for production (add to Vercel dashboard):

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
RESEND_API_KEY=re_xxxxxxxxxxxxx
MAILCHIMP_API_KEY=xxxxxxxxxxxxx
MAILCHIMP_AUDIENCE_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=https://api.your-backend.com
NEXT_PUBLIC_MOBILE_API_KEY=your-mobile-api-key
```

## 🧪 Testing

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Test contact form**: Go to `/support`

3. **Test newsletter**: Go to `/blog` and scroll down

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 📱 Pages

- `/` - Home page with hero and features
- `/about` - Company story, team, values
- `/features` - Detailed feature breakdown
- `/pricing` - Pricing plans and comparison
- `/blog` - Blog listing with categories
- `/blog/[slug]` - Individual blog posts
- `/support` - Contact form and FAQ

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts` and `globals.css`
- **Content**: Edit page files in `app/` directory
- **Images**: Place in `public/` folder
- **Components**: Reusable components in `app/components/`

## 📞 Support

Need help? Check the documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## 📄 License

All rights reserved © 2024 SEMMA-AI

---

Built with ❤️ for Ghana's farmers
