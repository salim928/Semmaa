# Content Management Guide

## 📝 How to Update Content Without Coding

### Option 1: Use a Headless CMS (Recommended)

**Sanity.io Setup** (Free, Easy to Use)

1. **Install Sanity**:
   ```bash
   npm install next-sanity @sanity/client @sanity/image-url
   npm install -g @sanity/cli
   ```

2. **Initialize Sanity**:
   ```bash
   sanity init
   ```
   - Choose: "Create new project"
   - Select: "Blog" schema
   - Deploy studio

3. **Access Sanity Studio**:
   - Go to: `http://localhost:3333`
   - Create blog posts visually
   - Upload images
   - Publish content

4. **Content Auto-Updates**: Your site fetches from Sanity API

### Option 2: Markdown Files (Simple, Free)

**Add Blog Post**:
1. Create file: `content/blog/my-new-post.md`
2. Add frontmatter:
   ```markdown
   ---
   title: "My Amazing Blog Post"
   date: "2024-03-20"
   author: "Your Name"
   category: "Farming Tips"
   image: "/images/blog/post.jpg"
   ---
   
   Your blog content here...
   ```
3. Commit and push to GitHub
4. Site auto-deploys with new content

### Option 3: Direct File Editing

#### Update Team Members
File: `app/about/page.tsx`
```typescript
const team = [
  {
    name: "Your Name",
    role: "Your Title",
    bio: "Your bio...",
    image: "/team/your-photo.jpg"
  },
  // Add more team members
]
```

#### Update Pricing
File: `app/pricing/page.tsx`
```typescript
const plans = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "Feature 1",
      "Feature 2",
    ]
  }
]
```

#### Update Features
File: `app/features/page.tsx` - Edit the `features` array

#### Update Contact Info
File: `app/components/Footer.tsx` - Edit email, phone, address

## 🎨 Update Images

1. **Team Photos**: Place in `public/team/`
2. **Blog Images**: Place in `public/blog/`
3. **General Images**: Place in `public/images/`

Reference in code: `/team/photo.jpg` (without "public")

## 📧 View Form Submissions

### Option 1: Email Notifications (Recommended)
- Set up Resend/SendGrid
- Get emails for each submission

### Option 2: Save to Database
```bash
npm install @vercel/postgres
# or
npm install mongodb
```

Create table/collection for:
- Contact form submissions
- Newsletter subscribers

### Option 3: Use Form Service
**Formspree** (https://formspree.io):
- Free: 50 submissions/month
- Dashboard to view all submissions
- No code needed

**Tally** (https://tally.so):
- Unlimited free forms
- Built-in database

## 📊 View Analytics

1. **Google Analytics**: analytics.google.com
   - See page views, user behavior
   - Most popular pages
   - Traffic sources

2. **Vercel Analytics**: vercel.com/dashboard
   - Real-time visitors
   - Performance metrics
   - Page speed

## 🔄 Making Regular Updates

### Weekly Tasks
- [ ] Check contact form submissions
- [ ] Respond to support requests
- [ ] Review newsletter subscribers
- [ ] Check analytics

### Monthly Tasks
- [ ] Add new blog post
- [ ] Update team photos/bios
- [ ] Review and update pricing
- [ ] Check broken links

### As Needed
- Update features
- Add testimonials
- Update FAQ
- Change contact information

## 🚀 Quick Deploy Process

1. Make changes to files
2. Commit to GitHub:
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```
3. Vercel auto-deploys (takes 2-3 minutes)
4. Check live site

## 💡 Tips

**Don't Know Coding?**
- Use Sanity CMS for blog posts
- Hire developer for structural changes
- Use Markdown for simple updates

**Want Full Control?**
- Learn basic React/TypeScript
- Use VS Code with Copilot
- Make small changes, test locally

**Need Help?**
- GitHub Copilot can guide you
- Next.js documentation
- Vercel support
