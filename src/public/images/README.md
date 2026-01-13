# 🖼️ Images Directory - Export Guide

## 📁 Directory Structuur

Deze directory bevat alle images die nodig zijn voor HugoHerbots.ai.

```
/public/images/
├── hugo/                    # Hugo persona photos
│   ├── portrait.jpg         # hugoPortrait - Professional headshot
│   ├── walking.jpg          # hugoWalking - Walking/action shot
│   ├── working.jpg          # hugoWorking/hugoWriting - At desk
│   ├── closeup.jpg          # hugoCloseupPhoto - Close-up portrait
│   ├── whiteboard.jpg       # hugoWhiteboardPhoto - Teaching at whiteboard
│   ├── black-bg.jpg         # hugoBlackBg - Portrait on black background
│   ├── hero-portrait.jpg    # hugoHeroPortrait - Large hero section portrait
│   ├── live-photo.jpg       # hugoLivePhoto - Live coaching session
│   └── video-placeholder.jpg # hugoVideoPlaceholder - Video thumbnail
│
├── screenshots/             # App screenshots
│   ├── dashboard.png        # dashboardScreenshot - Dashboard UI
│   ├── roleplay.png         # roleplayScreenshot - Role-play session
│   ├── library.png          # libraryScreenshot - Scenario library
│   ├── team-sessions.png    # teamSessionsScreenshot - Team overview
│   ├── analytics.png        # analyticsScreenshot - Analytics dashboard
│   ├── video-library.png    # videoCursusScreenshot - Video library
│   └── live-training.png    # liveTrainingPhoto - Live coaching UI
│
└── mockups/                 # UI mockups
    ├── video-call.png       # 25VideoCall mockup
    └── rectangle.png        # Generic placeholder
```

## 🎯 Image Requirements

### Hugo Photos (Person)
- **Aspect Ratio:** Portrait (3:4) - 600x800px minimum
- **Style:** Professional, warm, approachable
- **Age:** 60-70 years old
- **Vibe:** Experienced sales trainer, authoritative but friendly

### Screenshots (UI)
- **Aspect Ratio:** Desktop (16:10) - 1200x800px minimum
- **Format:** PNG with transparency where needed
- **Content:** Modern SaaS dashboard UI with Ocean Blue (#0EA5E9) accents

## 📸 Hoe Te Exporteren Uit Figma Make

### Optie 1: Screenshot vanuit Figma Make Preview
1. Open de Figma Make app
2. Navigate naar Landing page (bevat de meeste images)
3. Open Chrome DevTools (F12)
4. Network tab → filter op "png" of "jpg"
5. Reload de pagina
6. Klik met rechts op de image → "Open in new tab"
7. Save image met de juiste naam uit de mapping hieronder

### Optie 2: Screenshot vanuit Figma Design
1. Open het originele Figma design bestand
2. Selecteer de Hugo foto frames
3. Export → PNG → 2x scale
4. Download en rename volgens mapping

### Optie 3: Screenshot van de Running App
1. Run de Figma Make app
2. Gebruik een screenshot tool (Cmd+Shift+4 op Mac)
3. Capture de images die zichtbaar zijn
4. Crop en save met juiste naam

## 🔧 Image Mapping

### Components → File Mapping

| Component File | Variable Name | Output File | Description |
|---|---|---|---|
| **About.tsx** |
| | `hugoPortrait` | `hugo/portrait.jpg` | Main portrait photo |
| | `hugoWalking` | `hugo/walking.jpg` | Walking/action shot |
| | `hugoWorking` | `hugo/working.jpg` | At desk/working |
| **Landing.tsx** |
| | `hugoHeroPortrait` | `hugo/hero-portrait.jpg` | Hero section large portrait |
| | `hugoBlackBg` | `hugo/black-bg.jpg` | Black background portrait |
| | `hugoCloseupPhoto` | `hugo/closeup.jpg` | Close-up headshot |
| | `hugoWhiteboardPhoto` | `hugo/whiteboard.jpg` | Teaching at whiteboard |
| | `hugoWriting` | `hugo/working.jpg` | Same as working |
| | `hugoVideoPlaceholder` | `hugo/video-placeholder.jpg` | Video thumbnail |
| | `dashboardScreenshot` | `screenshots/dashboard.png` | Dashboard UI |
| | `roleplayScreenshot` | `screenshots/roleplay.png` | Role-play UI |
| | `libraryScreenshot` | `screenshots/library.png` | Library UI |
| | `teamSessionsScreenshot` | `screenshots/team-sessions.png` | Team UI |
| **Login.tsx & Signup.tsx** |
| | `hugoImage` | `hugo/portrait.jpg` | Same as main portrait |
| **LiveCoaching.tsx** |
| | `hugoLivePhoto` | `hugo/live-photo.jpg` | Live coaching session |
| **VideoLibrary.tsx** |
| | `hugoVideoPlaceholder` | `hugo/video-placeholder.jpg` | Same as Landing |
| **Pricing.tsx** |
| | `roleplayScreenshot` | `screenshots/roleplay.png` | Same as Landing |
| | `analyticsScreenshot` | `screenshots/analytics.png` | Analytics dashboard |
| **ProductShowcase.tsx** |
| | `liveTrainingPhoto` | `screenshots/live-training.png` | Live training UI |
| | `videoCursusScreenshot` | `screenshots/video-library.png` | Video library UI |
| | `roleplayScreenshot` | `screenshots/roleplay.png` | Same as Landing |

## 🔄 Import Updates Needed

### OLD (Figma Make):
```tsx
import hugoPortrait from "figma:asset/9fadffbf5efd08d95548ac3acedf2a4c54db789e.png";
```

### NEW (Replit):
```tsx
const hugoPortrait = "/images/hugo/portrait.jpg";
// OR
import hugoPortrait from "/public/images/hugo/portrait.jpg";
```

## ⚡ Quick Replace Script

Gebruik deze find & replace patterns in elk component:

```tsx
// About.tsx
import hugoPortrait from "figma:asset/..." → const hugoPortrait = "/images/hugo/portrait.jpg";
import hugoWalking from "figma:asset/..." → const hugoWalking = "/images/hugo/walking.jpg";
import hugoWorking from "figma:asset/..." → const hugoWorking = "/images/hugo/working.jpg";

// Landing.tsx
import dashboardScreenshot from "figma:asset/..." → const dashboardScreenshot = "/images/screenshots/dashboard.png";
import roleplayScreenshot from "figma:asset/..." → const roleplayScreenshot = "/images/screenshots/roleplay.png";
// etc...
```

## 🎨 Geen Toegang Tot Originele Images?

Gebruik **Unsplash stock photos** als tijdelijke oplossing:

1. Zoek "professional business man 60" voor Hugo photos
2. Zoek "saas dashboard ui" voor screenshots
3. Download in de juiste aspect ratio's
4. Place in deze directory met de correcte namen

**Recommended Unsplash searches:**
- Hugo Portrait: `professional businessman presentation`
- Hugo Whiteboard: `business trainer whiteboard`
- Dashboard: `analytics dashboard screen`
- Role-play: `video call meeting screen`

## ✅ Checklist

- [ ] 9 Hugo persona photos in `/hugo/`
- [ ] 7 App screenshots in `/screenshots/`
- [ ] Update all 8 component files with new import paths
- [ ] Test all pages render correctly
- [ ] Optimize images (compress, WebP format)

## 🚨 Image Optimization

Voor production, compress alle images:

```bash
# Install sharp
npm install sharp

# Compress script
npx sharp -i images/hugo/*.jpg -o images/hugo/compressed/ -f webp -q 80
```

## 📞 Need Help?

Als je de originele Figma images niet kunt vinden, gebruik de Unsplash URLs uit `/REPLIT_IMAGE_FIX.md` als fallback.
