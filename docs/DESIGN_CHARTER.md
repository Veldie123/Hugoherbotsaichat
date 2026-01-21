# HugoHerbots.ai Design Charter

Dit document legt alle design beslissingen vast voor consistente UI in de hele applicatie.
Raadpleeg dit document bij het ontwerpen van nieuwe pagina's of componenten.

---

## 1. Kleurenpalet

### 1.1 Core Brand Kleuren

| Naam | Hex | Tailwind Class | Gebruik |
|------|-----|----------------|---------|
| **Mirage (Ink)** | `#1C2535` | `text-hh-ink`, `bg-hh-ink` | Primaire tekst, donkere achtergronden |
| **Indian Ink** | `#2B3748` | `bg-[#2B3748]` | Secundaire donkere tint |
| **Slate Gray (Primary)** | `#6B7A92` | `text-hh-primary`, `bg-hh-primary` | Accenten, iconen, secundaire tekst |
| **French Gray (Muted)** | `#B1B2B5` | `text-hh-muted`, `bg-hh-muted` | Placeholder tekst, disabled states |
| **Platinum (Border)** | `#E4E4E4` | `border-hh-border`, `bg-hh-border` | Borders, dividers, subtiele lijnen |
| **White** | `#FFFFFF` | `bg-white`, `bg-hh-bg` | Achtergronden, cards |

### 1.2 Semantische Kleuren

| Naam | Hex | Tailwind Class | Gebruik |
|------|-----|----------------|---------|
| **Success (Groen)** | `#00C389` | `text-hh-success`, `bg-hh-success` | Positieve KPIs, checkmarks, +% badges |
| **Warning (Oranje)** | `#FFB020` | `text-hh-warn`, `bg-amber-500` | Waarschuwingen, aandacht vereist |
| **Destructive (Rood)** | `#EF4444` | `text-destructive`, `bg-destructive` | Fouten, negatieve KPIs, verwijderen |
| **Info (Blauw)** | `#3B82F6` | `text-blue-500`, `bg-blue-500` | Informatief, links, neutrale data |

### 1.3 Admin View Specifiek

| Naam | Hex | Tailwind Class | Gebruik |
|------|-----|----------------|---------|
| **Purple Accent** | `#8B5CF6` | `text-purple-500`, `bg-purple-500` | Admin badges, toggles, actieve filters |
| **Purple Light** | `#A78BFA` | `bg-purple-400` | Hover states |
| **Purple Background** | `#F3E8FF` | `bg-purple-100` | Lichte achtergrond badges |

### 1.4 User View Specifiek

| Naam | Hex | Tailwind Class | Gebruik |
|------|-----|----------------|---------|
| **Steel Blue** | `#4F7396` | `bg-[#4F7396]` | User buttons, accenten |
| **Navy Dark** | `#1E2A3B` | `bg-[#1E2A3B]` | Donkere achtergronden user view |

---

## 2. Typografie

### 2.1 Font Families
- **Primary**: System font stack (`font-sans`)
- **Monospace**: Voor code/technische data (`font-mono`)

### 2.2 Text Sizes

| Element | Size | Tailwind | Line Height |
|---------|------|----------|-------------|
| Page Title (H1) | 24px | `text-[24px]` | 32px |
| Section Title (H2) | 18px | `text-[18px]` | 24px |
| Subsection (H3) | 16px | `text-[16px]` | 22px |
| Body Text | 14px | `text-[14px]` | 20px |
| Small Text | 13px | `text-[13px]` | 18px |
| Caption/Label | 12px | `text-[12px]` | 16px |
| Tiny | 10px | `text-[10px]` | 14px |

### 2.3 Font Weights
- **Bold**: `font-bold` (700) - Titels, belangrijke labels
- **Semibold**: `font-semibold` (600) - Subtitels, KPI waarden
- **Medium**: `font-medium` (500) - Buttons, actieve items
- **Regular**: `font-normal` (400) - Body tekst

---

## 3. UI Componenten

### 3.1 Buttons

#### Primary Button (Admin)
```html
<Button className="bg-purple-600 hover:bg-purple-700 text-white">
  Actie
</Button>
```

#### Primary Button (User)
```html
<Button className="bg-hh-ink hover:bg-hh-ink/90 text-white">
  Actie
</Button>
```

#### Secondary/Outline Button
```html
<Button variant="outline" className="border-hh-border text-hh-primary hover:bg-hh-muted/10">
  Secundair
</Button>
```

#### Destructive Button
```html
<Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
  Verwijderen
</Button>
```

#### Icon Button
```html
<Button variant="ghost" size="icon" className="text-hh-muted hover:text-hh-ink">
  <Icon className="w-4 h-4" />
</Button>
```

### 3.2 Toggle Buttons (Filter Bar)

#### Active Toggle (Admin - Paars)
```html
<button className="p-2 rounded-lg bg-purple-600 text-white">
  <ListIcon className="w-4 h-4" />
</button>
```

#### Inactive Toggle
```html
<button className="p-2 rounded-lg border border-hh-border text-hh-muted hover:text-hh-ink hover:border-hh-primary">
  <GridIcon className="w-4 h-4" />
</button>
```

### 3.3 Badges

#### Success Badge (Groen)
```html
<span className="px-2 py-0.5 text-[12px] font-medium bg-hh-success/10 text-hh-success border border-hh-success/20 rounded-full">
  +24%
</span>
```

#### Warning Badge (Oranje)
```html
<span className="px-2 py-0.5 text-[12px] font-medium bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
  Aandacht
</span>
```

#### Error Badge (Rood)
```html
<span className="px-2 py-0.5 text-[12px] font-medium bg-red-50 text-red-600 border border-red-200 rounded-full">
  -12%
</span>
```

#### Info Badge (Blauw)
```html
<span className="px-2 py-0.5 text-[12px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
  Nieuw
</span>
```

#### Neutral Badge (Grijs)
```html
<span className="px-2 py-0.5 text-[12px] font-medium bg-hh-muted/10 text-hh-muted border border-hh-border rounded-full">
  43%
</span>
```

#### Admin Level Badge (Paars)
```html
<span className="px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full">
  Lvl 1
</span>
```

---

## 4. Cards & Containers

### 4.1 Base Card
```html
<div className="bg-white rounded-lg border border-hh-border shadow-sm p-4">
  <!-- Content -->
</div>
```

### 4.2 KPI Card
```html
<div className="bg-white rounded-xl border border-hh-border p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-[12px] text-hh-muted">Label</span>
    <span className="px-2 py-0.5 text-[12px] font-medium bg-hh-success/10 text-hh-success rounded-full">
      +24%
    </span>
  </div>
  <div className="text-[24px] font-bold text-hh-ink">1,234</div>
  <div className="text-[12px] text-hh-muted mt-1">vs vorige periode</div>
</div>
```

### 4.3 Stats Card met Icon
```html
<div className="bg-white rounded-xl border border-hh-border p-4">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
      <Icon className="w-5 h-5 text-purple-600" />
    </div>
    <div>
      <div className="text-[12px] text-hh-muted">Label</div>
      <div className="text-[18px] font-semibold text-hh-ink">Value</div>
    </div>
  </div>
</div>
```

---

## 5. Tabellen

### 5.1 Table Header
```html
<thead>
  <tr className="border-b border-hh-border bg-hh-ui-50">
    <th className="px-4 py-3 text-left text-[12px] font-medium text-hh-muted uppercase tracking-wide">
      Kolom
    </th>
  </tr>
</thead>
```

### 5.2 Table Row
```html
<tr className="border-b border-hh-border hover:bg-hh-ui-50 transition-colors">
  <td className="px-4 py-3 text-[14px] text-hh-ink">
    Content
  </td>
</tr>
```

### 5.3 Numerieke Data in Tabellen

| Type | Kleur | Voorbeeld |
|------|-------|-----------|
| Positief | `text-hh-success` (#00C389) | +15%, 98/100 |
| Negatief | `text-red-500` (#EF4444) | -8%, 32/100 |
| Neutraal | `text-hh-ink` (#1C2535) | 50%, 67/100 |
| Waarschuwing | `text-amber-500` (#FFB020) | 45% (grens) |
| Info/Gemiddeld | `text-blue-500` (#3B82F6) | Gem: 72% |

---

## 6. Filter Bar / Search Bar

### 6.1 Container
```html
<div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-hh-border shadow-sm">
  <!-- Filters -->
</div>
```

### 6.2 Search Input
```html
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
  <input 
    type="text"
    placeholder="Zoek sessies, gebruikers, technieken..."
    className="w-full pl-10 pr-4 py-2 text-[14px] border border-hh-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
  />
</div>
```

### 6.3 Filter Dropdown
```html
<select className="px-4 py-2 text-[14px] border border-hh-border rounded-lg bg-white text-hh-ink focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
  <option>Alle Types</option>
  <option>Optie 1</option>
</select>
```

### 6.4 View Toggle (List/Grid)
```html
<div className="flex items-center gap-1 p-1 bg-hh-ui-50 rounded-lg">
  <button className="p-2 rounded-lg bg-purple-600 text-white">
    <List className="w-4 h-4" />
  </button>
  <button className="p-2 rounded-lg text-hh-muted hover:text-hh-ink">
    <Grid className="w-4 h-4" />
  </button>
</div>
```

---

## 7. Navigation

### 7.1 Sidebar Item (Active)
```html
<a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium">
  <Icon className="w-5 h-5" />
  <span>Menu Item</span>
</a>
```

### 7.2 Sidebar Item (Inactive)
```html
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-hh-muted hover:bg-hh-ui-50 hover:text-hh-ink transition-colors">
  <Icon className="w-5 h-5" />
  <span>Menu Item</span>
</a>
```

---

## 8. Spacing & Layout

### 8.1 Standaard Spacing
- **xs**: 4px (`gap-1`, `p-1`)
- **sm**: 8px (`gap-2`, `p-2`)
- **md**: 12px (`gap-3`, `p-3`)
- **lg**: 16px (`gap-4`, `p-4`)
- **xl**: 24px (`gap-6`, `p-6`)
- **2xl**: 32px (`gap-8`, `p-8`)

### 8.2 Border Radius
- **sm**: 4px (`rounded-sm`) - Kleine elementen
- **md**: 8px (`rounded-lg`) - Buttons, inputs
- **lg**: 12px (`rounded-xl`) - Cards
- **full**: 9999px (`rounded-full`) - Badges, avatars

### 8.3 Shadows
- **sm**: `shadow-sm` - Subtle elevation
- **md**: `shadow-md` - Cards, dropdowns
- **lg**: `shadow-lg` - Modals, popovers

---

## 9. States

### 9.1 Hover States
- Backgrounds: Voeg `/10` of `/20` opacity toe
- Text: Verschuif naar donkerder (bijv. `hh-muted` → `hh-ink`)
- Borders: Verschuif naar `hh-primary`

### 9.2 Focus States
```css
focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
```

### 9.3 Disabled States
```html
<button disabled className="opacity-50 cursor-not-allowed">
  Disabled
</button>
```

### 9.4 Loading States
```html
<button className="relative">
  <span className="opacity-0">Text</span>
  <div className="absolute inset-0 flex items-center justify-center">
    <Loader className="w-4 h-4 animate-spin" />
  </div>
</button>
```

---

## 10. Admin vs User View Samenvatting

| Element | Admin View | User View |
|---------|------------|-----------|
| Primary Accent | Purple (`#8B5CF6`) | Steel Blue (`#4F7396`) |
| Active Toggle BG | `bg-purple-600` | `bg-[#4F7396]` |
| Badge Accent | `bg-purple-100 text-purple-700` | `bg-blue-100 text-blue-700` |
| Link Color | `text-purple-600` | `text-hh-primary` |
| Success Color | `#00C389` (beide) | `#00C389` (beide) |
| Button Hover | `hover:bg-purple-700` | `hover:bg-hh-ink/90` |

---

## 11. Checklist voor Nieuwe Pagina's

- [ ] Gebruik `bg-white` of `bg-hh-ui-50` voor page background
- [ ] Wrap content in container met `max-w-7xl mx-auto px-4 py-6`
- [ ] Page title: `text-[24px] font-bold text-hh-ink`
- [ ] Subtitles: `text-[12px] text-hh-muted`
- [ ] Cards: `bg-white rounded-xl border border-hh-border p-4`
- [ ] Alle buttons volgen de hiërarchie (primary > secondary > ghost)
- [ ] Positieve getallen: `text-hh-success`
- [ ] Negatieve getallen: `text-red-500`
- [ ] Tabellen hebben hover states op rows
- [ ] Filter bar heeft consistente styling
- [ ] Focus states op alle interactieve elementen
- [ ] Responsive: Test op mobile (375px) en desktop (1440px)

---

## 12. Tailwind Custom Classes Referentie

```css
/* In src/index.css of tailwind config */
--hh-text: #1c2535;
--hh-ink: #1c2535;
--hh-primary: #6b7a92;
--hh-muted: #b1b2b5;
--hh-border: #e4e4e4;
--hh-bg: #fff;
--hh-success: #00c389;
--hh-warn: #ffb020;
--hh-ui-50: #f9fafb;
--hh-ui-100: #f3f4f6;
--hh-ui-200: #e5e7eb;
--destructive: #ef4444;
```

---

*Laatste update: Januari 2026*
*Versie: 1.0*
