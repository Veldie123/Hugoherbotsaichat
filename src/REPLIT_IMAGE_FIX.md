# 🖼️ Image Fix voor Replit Backend

## Probleem
Figma Make gebruikt `figma:asset` imports die alleen in Figma Make werken.
Voor Replit moet je deze vervangen door echte URLs of lokale files.

## ✅ Snelle Oplossing: Unsplash URLs

Vervang alle `figma:asset` imports door deze Unsplash URLs:

```tsx
// === Hugo Photos ===
const hugoPortrait = "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=800&fit=crop";
const hugoWalking = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop";
const hugoWorking = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop";
const hugoWriting = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop";
const hugoVideoPlaceholder = "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?w=1200&h=800&fit=crop";
const hugoWhiteboardPhoto = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop";
const hugoCloseupPhoto = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop";
const hugoBlackBg = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop";
const hugoHeroPortrait = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop";
const hugoLivePhoto = "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop";
const hugoImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop";

// === App Screenshots ===
const dashboardScreenshot = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop";
const roleplayScreenshot = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop";
const libraryScreenshot = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=800&fit=crop";
const teamSessionsScreenshot = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop";
const analyticsScreenshot = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop";
const videoCursusScreenshot = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop";
const liveTrainingPhoto = "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop";
```

## 📝 Hoe Te Gebruiken

### 1. Vervang in About.tsx
```tsx
// Verwijder deze imports:
import hugoPortrait from "figma:asset/9fadffbf5efd08d95548ac3acedf2a4c54db789e.png";
import hugoWalking from "figma:asset/3303da6db66b7132ebc5f2f6276712c9a0fd485e.png";
import hugoWorking from "figma:asset/ffe328d4703b02e265880fd122f17bde74ebfa9d.png";

// Vervang door:
const hugoPortrait = "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=800&fit=crop";
const hugoWalking = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop";
const hugoWorking = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop";
```

### 2. Vervang in Landing.tsx
```tsx
// Verwijder alle figma:asset imports
// Vervang door de Unsplash URLs hierboven

const dashboardScreenshot = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop";
const roleplayScreenshot = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop";
// etc...
```

### 3. Vervang in Login.tsx & Signup.tsx
```tsx
// Verwijder:
import hugoImage from "figma:asset/a5da4578176f94a983ebfbba539ea83f4e769336.png";

// Vervang door:
const hugoImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop";
```

### 4. Vervang in LiveCoaching.tsx
```tsx
// Verwijder:
import hugoLivePhoto from "figma:asset/9f21bc9eaae81b79a083fcd342b14f53acdad581.png";

// Vervang door:
const hugoLivePhoto = "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop";
```

### 5. Vervang in VideoLibrary.tsx
```tsx
// Verwijder:
import hugoVideoPlaceholder from "figma:asset/110ec621be27a3e45bb05b418b6d4504c1aa0208.png";

// Vervang door:
const hugoVideoPlaceholder = "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?w=1200&h=800&fit=crop";
```

### 6. Vervang in Pricing.tsx
```tsx
// Verwijder:
import roleplayScreenshot from "figma:asset/5e0311347e22c63626fd6f5cd1e39d5971c229ea.png";
import analyticsScreenshot from "figma:asset/7a290f0c53177769ed05ab1ba994d8689b9b2339.png";

// Vervang door:
const roleplayScreenshot = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop";
const analyticsScreenshot = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop";
```

### 7. Vervang in ProductShowcase.tsx
```tsx
// Verwijder:
import liveTrainingPhoto from "figma:asset/df8d0345ec97872464a36f2f13fb9ed0586c1cae.png";
import videoCursusScreenshot from "figma:asset/6a04748baf4dd37751e816f59305b1501c7ce511.png";
import roleplayScreenshot from "figma:asset/e06d60464ed4edd0aa80bbfba3e7f07dc13ba713.png";

// Vervang door:
const liveTrainingPhoto = "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop";
const videoCursusScreenshot = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop";
const roleplayScreenshot = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop";
```

## 🎨 Alternatief: Placeholder.com

Als je meer custom text wilt:

```tsx
const hugoPortrait = "https://placehold.co/600x800/0EA5E9/FFFFFF?text=Hugo+Herbots";
const dashboardScreenshot = "https://placehold.co/1200x800/F1F5F9/64748B?text=Dashboard";
```

## 📦 Beste Oplossing: Lokale Files

Voor productie:

1. **Maak `/public/images` directory**
2. **Download Hugo's foto's** (of gebruik stock photos)
3. **Vervang imports**:
```tsx
// In plaats van figma:asset of Unsplash
const hugoPortrait = "/images/hugo-portrait.jpg";
```

## 🔧 Find & Replace Cheatsheet

In VS Code / Replit, gebruik Find & Replace (Cmd+Shift+F):

**Find:** `import (\w+) from "figma:asset/[^"]+\.png";`  
**Replace:** `const $1 = "https://images.unsplash.com/photo-XXXXX";`

Dan handmatig de URLs invullen per variabele.

## ✅ Checklist

- [ ] About.tsx - 3 images
- [ ] Landing.tsx - 11 images  
- [ ] Login.tsx - 1 image
- [ ] Signup.tsx - 1 image
- [ ] Pricing.tsx - 2 images
- [ ] ProductShowcase.tsx - 3 images
- [ ] LiveCoaching.tsx - 1 image
- [ ] VideoLibrary.tsx - 1 image

**Total: 23 images** om te vervangen.

## 🚨 Let Op

- **Verwijder ook de `ImageWithFallback` imports** als je Unsplash URLs gebruikt (gebruik gewoon `<img>`).
- Voor **development** zijn Unsplash URLs perfect.
- Voor **productie** wil je lokale files of een CDN.
