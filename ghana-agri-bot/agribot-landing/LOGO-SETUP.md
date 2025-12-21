# Adding the SEMMA-AI Logo

## Steps to Complete Logo Integration

1. **Save the logo image:**
   - Save the provided SEMMA-AI logo (robot with wheat icon on dark green background) as `semma-logo.png`
   - Place it in the `public/` directory: `agribot-landing/public/semma-logo.png`
   
2. **The following has already been updated:**
   - ✅ Navigation component now uses the logo image
   - ✅ Footer component now uses the logo image
   - ✅ App metadata configured to use the logo as favicon
   - ✅ OpenGraph image updated to use the logo
   - ✅ Created a fallback icon.tsx file

3. **Logo specifications:**
   - The logo should be square (recommended: 512x512px or larger)
   - PNG format with transparent background (or the dark green background from the original)
   - The logo will automatically be used as:
     * Navigation bar logo (40x40px)
     * Footer logo (32x32px)
     * Favicon/browser tab icon
     * App icon for mobile devices
     * Social media preview image

4. **After adding the logo:**
   - Restart the development server: `npm run dev`
   - Clear browser cache to see the new favicon
   - The logo will appear in the navigation, footer, and browser tab

## Logo Usage

The logo is now referenced in these files:
- `app/components/Navigation.tsx` - Top navigation bar
- `app/components/Footer.tsx` - Footer branding
- `app/layout.tsx` - App metadata and favicons
- `app/icon.tsx` - Fallback icon generator

## Current Status

⚠️ **Action Required:** The logo image file needs to be manually saved to `public/semma-logo.png`

Once the logo file is in place, all references will work automatically!
