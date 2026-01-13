# 📸 Screenshot Guide - Marketing Pages

## 🎯 Pages om te Screenshotten

1. **Landing** (`/`) - Homepage
2. **Over Hugo** (`/about`) - About page
3. **Pricing** (`/pricing`) - Pricing page
4. **Login** (`/login`) - Login page
5. **Start gratis met Hugo** (`/signup`) - Signup page

---

## 🔧 Method 1: Browser Full Page Screenshot (Best for Long Pages)

### Chrome/Edge:
1. Open de pagina in Chrome/Edge
2. Press `F12` (open DevTools)
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
4. Type: "Capture full size screenshot"
5. Press Enter
6. Screenshot wordt automatisch gedownload!

### Firefox:
1. Open de pagina
2. Press `Ctrl+Shift+S` (Screenshot mode)
3. Click "Save full page"
4. Screenshot wordt opgeslagen

---

## 🔧 Method 2: Chrome Extension (GoFullPage)

1. Install "GoFullPage" extension
2. Navigate to each page
3. Click extension icon
4. Full page screenshot wordt gemaakt
5. Download als PNG

---

## 🔧 Method 3: Manual Scrolling Screenshots

### Mac:
1. Press `Cmd+Shift+4`
2. Press `Spacebar` (camera icon appears)
3. Click window to capture
4. OR drag to select specific area

### Windows:
1. Press `Win+Shift+S`
2. Select area or window
3. Paste in Paint/editor
4. Save as PNG

---

## 📁 Waar Opslaan?

Sla de screenshots op in `/public/images/screenshots/` met deze namen:

```
/public/images/screenshots/
├── landing-full.png        (Homepage - volledig)
├── about-full.png          (Over Hugo - volledig)
├── pricing-full.png        (Pricing - volledig)
├── login-full.png          (Login - volledig)
└── signup-full.png         (Signup - volledig)
```

---

## 🎨 Screenshot Settings

### Resolutie:
- **Width:** 1440px (desktop standard)
- **Quality:** High (PNG for UI, JPG 90% for photos)

### Browser Zoom:
- Set browser zoom to **100%**
- Check responsive design is **desktop view**
- Clear browser cache for latest version

### What to Capture:
✅ Full page (header to footer)
✅ All sections visible
✅ Real content (not lorem ipsum)
✅ Clean UI (close any dev tools before screenshotting)

❌ Don't include browser chrome (address bar, bookmarks)
❌ Don't include DevTools panel
❌ Don't include personal bookmarks/extensions

---

## 🚀 Quick Capture Checklist

### 1. Landing Page (`/`)
- [ ] Navigate to `/` or click "Home"
- [ ] Scroll to top
- [ ] Full page screenshot
- [ ] Save as `landing-full.png`

**Key sections to verify are visible:**
- Hero with Hugo video
- "Zo werkt het" section
- Value propositions (ProductShowcase)
- Social proof testimonials
- Pricing teaser
- FAQ section
- Footer CTA

### 2. Over Hugo (`/about`)
- [ ] Navigate to `/about`
- [ ] Scroll to top
- [ ] Full page screenshot
- [ ] Save as `about-full.png`

**Key sections:**
- Hero with Hugo story
- Stats (40 jaar, 20.000+, €2.000)
- Philosophy section
- Methodology (4 fasen, 20 technieken)
- Recognition & impact
- CTA section

### 3. Pricing (`/pricing`)
- [ ] Navigate to `/pricing`
- [ ] Scroll to top
- [ ] Full page screenshot
- [ ] Save as `pricing-full.png`

**Key sections:**
- Pricing toggle (monthly/yearly)
- 3 tiers (Starter, Pro, Team)
- Feature comparison table
- Trust badges
- FAQ section
- CTA card

### 4. Login (`/login`)
- [ ] Navigate to `/login`
- [ ] Full page screenshot
- [ ] Save as `login-full.png`

**Key sections:**
- Split layout (form left, brand right)
- Login form fields
- Social login buttons
- "Nog geen account?" link
- Brand side (logo, stats, testimonial)

### 5. Signup (`/signup`)
- [ ] Navigate to `/signup`
- [ ] Full page screenshot
- [ ] Save as `signup-full.png`

**Key sections:**
- Split layout (brand left, form right)
- Signup form fields
- Social signup buttons
- Trust badges (14 dagen gratis, etc.)
- "Al een account?" link

---

## 🖼️ Screenshot Specs per Page

| Page | File | Approx. Height | Key Colors |
|---|---|---|---|
| Landing | `landing-full.png` | ~8000px | Ocean Blue (#0EA5E9) |
| About | `about-full.png` | ~6000px | Deep Blue (#0F172A) |
| Pricing | `pricing-full.png` | ~5000px | Ocean Blue accents |
| Login | `login-full.png` | ~900px | Split layout |
| Signup | `signup-full.png` | ~1000px | Split layout |

---

## 🎯 Alternative: Use Figma Make Preview Mode

1. Open Figma Make
2. Click "Preview" (full screen)
3. Navigate to each page
4. Use browser screenshot method
5. No dev UI visible = cleaner screenshots

---

## ⚡ Automated Screenshot Script (Advanced)

If you have Node.js + Puppeteer installed:

```javascript
// screenshot-pages.js
const puppeteer = require('puppeteer');

const pages = [
  { url: 'http://localhost:3000/', name: 'landing-full.png' },
  { url: 'http://localhost:3000/about', name: 'about-full.png' },
  { url: 'http://localhost:3000/pricing', name: 'pricing-full.png' },
  { url: 'http://localhost:3000/login', name: 'login-full.png' },
  { url: 'http://localhost:3000/signup', name: 'signup-full.png' },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle2' });
    await page.screenshot({ 
      path: `public/images/screenshots/${p.name}`,
      fullPage: true 
    });
    console.log(`✅ Saved ${p.name}`);
  }

  await browser.close();
})();
```

Run with:
```bash
npm install puppeteer
node screenshot-pages.js
```

---

## 🖼️ Additional Screenshots Needed (from running app)

Voor complete image set, screenshot ook de **app pages** (authenticated):

```
/public/images/screenshots/
├── dashboard.png           (Dashboard page)
├── roleplay.png           (Role-play session)
├── library.png            (Scenario library)
├── team-sessions.png      (Team overview)
├── analytics.png          (Analytics page)
├── video-library.png      (Video library)
└── live-training.png      (Live coaching)
```

**How:**
1. Login to the app
2. Navigate to each page
3. Take full page screenshot
4. Save with correct name

---

## ✅ Final Checklist

- [ ] Landing page screenshot (`landing-full.png`)
- [ ] About page screenshot (`about-full.png`)
- [ ] Pricing page screenshot (`pricing-full.png`)
- [ ] Login page screenshot (`login-full.png`)
- [ ] Signup page screenshot (`signup-full.png`)
- [ ] All files saved in `/public/images/screenshots/`
- [ ] File sizes reasonable (< 2MB each)
- [ ] Resolution is 1440px width
- [ ] All content visible (no cut-off sections)

---

## 📞 Tips

- **Clear browser cache** before screenshotting (Cmd+Shift+R)
- **Disable browser extensions** temporarily for clean UI
- **Use Incognito/Private mode** for cleanest screenshots
- **Wait for all images to load** before capturing
- **Check mobile responsive** separately if needed

---

## 🚀 After Screenshots

Once you have all 5 marketing page screenshots, you can:

1. Use them in **ProductShowcase** component
2. Create a **portfolio/case study** page
3. Share on **social media** for marketing
4. Add to **Replit README** as preview
5. Use in **investor pitch deck**

Good luck! 📸
