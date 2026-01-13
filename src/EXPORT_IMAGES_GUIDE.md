# 📸 How to Export Images from Figma Make to Replit

## 🎯 Goal
Export all 16 unique images from Figma Make and place them in `/public/images/` for your Replit backend.

## 📋 Quick Summary
- **9 Hugo photos** → `/public/images/hugo/`
- **7 App screenshots** → `/public/images/screenshots/`

---

## 🔧 Method 1: Screenshot from Running Figma Make App (Easiest)

### Step 1: Open Figma Make
1. Open this project in Figma Make
2. Click "Preview" to run the app

### Step 2: Navigate & Screenshot

#### For Hugo Photos:
1. **Landing page** → Scroll to see Hugo hero portrait
2. **About page** → Screenshot all Hugo photos (portrait, walking, working)
3. **Login/Signup page** → Screenshot Hugo image on right side

**Screenshot tips:**
- Mac: `Cmd + Shift + 4` (drag to select area)
- Windows: `Win + Shift + S`
- Crop tightly around the image
- Save with correct filename (see mapping below)

#### For App Screenshots:
1. Navigate to **Dashboard** → Screenshot the full dashboard
2. Navigate to **Role-play** → Screenshot the session interface
3. Navigate to **Library** → Screenshot the scenario library
4. Navigate to **Team Sessions** → Screenshot the team view
5. Navigate to **Analytics** → Screenshot the analytics page
6. Navigate to **Video Library** → Screenshot the video interface
7. Navigate to **Live Coaching** → Screenshot the live session UI

---

## 🔧 Method 2: Chrome DevTools Network Tab (Best Quality)

### Step 1: Open DevTools
1. Run Figma Make preview
2. Press `F12` or right-click → "Inspect"
3. Go to **Network** tab
4. Filter: `png` or `jpg`

### Step 2: Reload & Capture
1. Reload the page (Cmd/Ctrl + R)
2. Images will appear in Network tab
3. Click on each image
4. Right-click → "Open in new tab"
5. Right-click image → "Save Image As..."
6. Save with correct filename

### Step 3: Navigate All Pages
Repeat for:
- Landing
- About
- Login
- Signup
- Dashboard
- Role-play
- Library
- Live Coaching
- etc.

---

## 🔧 Method 3: Browser Inspector (Direct Image URLs)

### Step 1: Inspect Image
1. Right-click on any image in the running app
2. Click "Inspect Element"
3. Find the `<img src="...">` tag
4. The `src` might be a blob URL or data URL

### Step 2: Extract
- If **blob URL**: Right-click → "Open in new tab" → Save
- If **data URL**: Copy the base64 data → Convert to image file online

---

## 📁 File Mapping & Naming

### Hugo Photos (9 files)

| Screenshot From | Filename | Size |
|---|---|---|
| Landing hero section | `hugo/hero-portrait.jpg` | 800x1000px |
| About page - main portrait | `hugo/portrait.jpg` | 600x800px |
| About page - walking shot | `hugo/walking.jpg` | 600x800px |
| About page - at desk | `hugo/working.jpg` | 800x600px |
| Landing testimonials section | `hugo/closeup.jpg` | 600x800px |
| Landing value prop section | `hugo/whiteboard.jpg` | 800x600px |
| Landing footer section | `hugo/black-bg.jpg` | 600x800px |
| Live Coaching page | `hugo/live-photo.jpg` | 1200x800px |
| Video Library page | `hugo/video-placeholder.jpg` | 1200x800px |

### App Screenshots (7 files)

| Screenshot From | Filename | Size |
|---|---|---|
| Dashboard page | `screenshots/dashboard.png` | 1200x800px |
| Role-play page | `screenshots/roleplay.png` | 1200x800px |
| Library page | `screenshots/library.png` | 1200x800px |
| Team Sessions page | `screenshots/team-sessions.png` | 1200x800px |
| Analytics page | `screenshots/analytics.png` | 1200x800px |
| Video Library page | `screenshots/video-library.png` | 1200x800px |
| Live Coaching page | `screenshots/live-training.png` | 1200x800px |

---

## ✅ After Exporting: Update Imports

### 1. Create Image Constants File (Optional)
Create `/utils/images.ts`:

```tsx
// Hugo Photos
export const hugoPortrait = "/images/hugo/portrait.jpg";
export const hugoWalking = "/images/hugo/walking.jpg";
export const hugoWorking = "/images/hugo/working.jpg";
export const hugoCloseup = "/images/hugo/closeup.jpg";
export const hugoWhiteboard = "/images/hugo/whiteboard.jpg";
export const hugoBlackBg = "/images/hugo/black-bg.jpg";
export const hugoHeroPortrait = "/images/hugo/hero-portrait.jpg";
export const hugoLivePhoto = "/images/hugo/live-photo.jpg";
export const hugoVideoPlaceholder = "/images/hugo/video-placeholder.jpg";

// Screenshots
export const dashboardScreenshot = "/images/screenshots/dashboard.png";
export const roleplayScreenshot = "/images/screenshots/roleplay.png";
export const libraryScreenshot = "/images/screenshots/library.png";
export const teamSessionsScreenshot = "/images/screenshots/team-sessions.png";
export const analyticsScreenshot = "/images/screenshots/analytics.png";
export const videoCursusScreenshot = "/images/screenshots/video-library.png";
export const liveTrainingPhoto = "/images/screenshots/live-training.png";
```

### 2. Update Component Imports

**Before (Figma Make):**
```tsx
import hugoPortrait from "figma:asset/9fadffbf5efd08d95548ac3acedf2a4c54db789e.png";
```

**After (Replit):**
```tsx
import { hugoPortrait } from "../../utils/images";
// OR
const hugoPortrait = "/images/hugo/portrait.jpg";
```

### 3. Update Each Component

Files to update:
- `/components/HH/About.tsx` (3 images)
- `/components/HH/Landing.tsx` (11 images)
- `/components/HH/Login.tsx` (1 image)
- `/components/HH/Signup.tsx` (1 image)
- `/components/HH/Pricing.tsx` (2 images)
- `/components/HH/ProductShowcase.tsx` (3 images)
- `/components/HH/LiveCoaching.tsx` (1 image)
- `/components/HH/VideoLibrary.tsx` (1 image)

---

## 🎨 Alternative: Use Unsplash Stock Photos

If you can't export from Figma Make, use stock photos:

### Hugo Photos
1. Search Unsplash: `professional businessman 60 years presentation`
2. Download high-res images
3. Rename to match the filenames above
4. Place in `/public/images/hugo/`

### App Screenshots
1. Search Unsplash: `saas dashboard ui`, `analytics screen`, `video conference ui`
2. OR use placeholder.com: `https://placehold.co/1200x800/F1F5F9/64748B?text=Dashboard`
3. Download and place in `/public/images/screenshots/`

---

## 🚨 Important Notes

1. **Don't commit large images to Git** - Add to `.gitignore` or use a CDN
2. **Optimize images** before deployment:
   ```bash
   # Compress JPGs to ~80% quality
   # Convert to WebP for better performance
   ```
3. **Aspect ratios matter** - Keep the sizes consistent with the mapping
4. **Test locally first** - Make sure all images load before deploying to Replit

---

## 📞 Can't Export Images?

**Fallback option:** Use the Unsplash URLs from `/REPLIT_IMAGE_FIX.md`

These will work immediately without downloading any files:

```tsx
const hugoPortrait = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800";
```

Ideal for **development** - switch to local files for **production**.

---

## ✅ Final Checklist

- [ ] Create `/public/images/hugo/` directory
- [ ] Create `/public/images/screenshots/` directory  
- [ ] Export 9 Hugo photos
- [ ] Export 7 app screenshots
- [ ] Rename all files correctly
- [ ] Create `/utils/images.ts` constants file
- [ ] Update all 8 component files
- [ ] Test all pages load correctly
- [ ] Optimize images for web
- [ ] Deploy to Replit

Good luck! 🚀
