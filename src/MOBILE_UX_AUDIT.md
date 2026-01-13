# Mobile UX/UI Audit - Admin View
**Datum**: 13 januari 2026  
**Platform**: HugoHerbots.ai Admin Interface  
**Focus**: Mobiele responsiveness en usability

---

## 🔴 CRITICAL ISSUES

### 1. **Tables op mobiel - Extreme horizontal scroll**
**Locatie**: AdminSessions, AdminUserManagement, AdminTechniqueManagement, AdminConfigReview, AdminVideoManagement

**Probleem**:
- Tables hebben 7-8 kolommen die NIET responsive zijn
- Op mobiel (375px) moet je extreem ver horizontaal scrollen
- Table headers en cells hebben geen min-width/max-width
- Geen mobile-first alternative view (stacked cards)

**Voorbeeld AdminSessions.tsx (regel 631-695)**:
```tsx
<table className="w-full">
  <thead className="bg-hh-ui-50 border-b border-hh-border">
    <tr>
      <th className="text-left px-4 py-3 text-[13px]...">Gebruiker</th>
      <th className="text-left px-4 py-3 text-[13px]...">Techniek</th>
      <th className="text-left px-4 py-3 text-[13px]...">Type</th>
      <th className="text-left px-4 py-3 text-[13px]...">Score</th>
      <th className="text-left px-4 py-3 text-[13px]...">Duur</th>
      <th className="text-left px-4 py-3 text-[13px]...">Datum</th>
      <th className="text-right px-4 py-3 text-[13px]...">Acties</th>
    </tr>
  </thead>
  <!-- 7 kolommen! -->
</table>
```

**Impact**: ⭐⭐⭐⭐⭐ ZEER HOOG  
**Gebruikers**: Admins die onderweg sessies reviewen

**Fix vereist**:
- [ ] Verberg kolommen op mobiel (hide lg:table-cell pattern)
- [ ] OF: Maak card-based mobile layout (preferred)
- [ ] Toon alleen essentiële info op mobiel (User, Score, Date, Actions)

---

### 2. **Filter Bar neemt teveel ruimte in op mobiel**
**Locatie**: Alle admin pagina's (Sessions, Users, Techniques, Videos, Config Review)

**Probleem**:
- Filter bar heeft 3-4 elementen naast elkaar op mobiel
- Search input + 2-3 selects = te krap op 375px width
- Geen vertical stacking op sm breakpoint

**Voorbeeld AdminSessions.tsx**:
```tsx
<Card className="p-4 rounded-[16px]...">
  <div className="flex flex-col sm:flex-row gap-3">
    <Input /> {/* Search */}
    <Select /> {/* Type filter */}
    <Select /> {/* Quality filter */}
    <Select /> {/* Sort by */}
  </div>
</Card>
```

**Probleem**: `sm:flex-row` betekent dat op sm (640px) alles al horizontaal wordt, maar dat is nog steeds te krap voor 4 elementen.

**Impact**: ⭐⭐⭐⭐ HOOG  

**Fix vereist**:
- [ ] Gebruik `md:flex-row` ipv `sm:flex-row` (blijf langer vertical)
- [ ] OF: Verberg minder belangrijke filters in een "More Filters" dropdown op mobiel
- [ ] Compact Select dropdowns (kortere labels op mobiel)

---

### 3. **Header actions buttons te klein / overlapping**
**Locatie**: AdminLayout topbar, alle admin pages header

**Probleem**:
- Multiple buttons in header met icons + text
- Op mobiel (< 640px) overlappen buttons of zijn te klein
- "Export CSV" wordt "Export" maar nog steeds te weinig ruimte

**Voorbeeld AdminUserManagement.tsx (regel 267-268)**:
```tsx
<Button className="gap-2">
  <Download className="w-4 h-4" />
  <span className="hidden lg:inline">Export CSV</span>
  <span className="lg:hidden">Export</span>
</Button>
```

**Impact**: ⭐⭐⭐ MEDIUM-HOOG  

**Fix vereist**:
- [ ] Gebruik icon-only buttons op mobiel (size="icon")
- [ ] Tooltip toevoegen voor context
- [ ] OF: Dropdown menu "Actions" met alle opties

---

### 4. **Touch targets te klein (<44px)**
**Locatie**: Dropdown menu triggers, sort icons, badge clicks

**Probleem**:
- MoreVertical icon buttons: `className="h-8 w-8 p-0"` = 32px (te klein!)
- Sort arrow icons in table headers zijn clickable maar geen padding
- Apple/Android richtlijnen: minimum 44x44px touch target

**Voorbeeld AdminSessions.tsx**:
```tsx
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <MoreVertical className="w-4 h-4" />
</Button>
```

**Impact**: ⭐⭐⭐⭐ HOOG (accessibility issue!)  

**Fix vereist**:
- [ ] Change `h-8 w-8` naar `h-11 w-11` (44px minimum)
- [ ] Of gebruik invisible padding area: `p-3` met smaller visual icon
- [ ] Test met real fingers, niet met mouse

---

## 🟠 HIGH PRIORITY ISSUES

### 5. **KPI Cards - Text sizes te klein op mobiel**
**Locatie**: Alle admin dashboard KPI tiles

**Probleem**:
- Label text: `text-[12px] sm:text-[13px]` - 12px is te klein op mobiel
- Number text: `text-[24px] sm:text-[28px]` - ok, maar kan groter

**Voorbeeld AdminUserManagement.tsx (regel 287, 290)**:
```tsx
<p className="text-[12px] sm:text-[13px]...">Totaal Gebruikers</p>
<p className="text-[24px] sm:text-[28px]...">42</p>
```

**Impact**: ⭐⭐⭐ MEDIUM  

**Fix**:
- [ ] Label minimum 13px op mobiel: `text-[13px] sm:text-[14px]`
- [ ] Numbers kunnen groter: `text-[28px] sm:text-[32px]`

---

### 6. **Grid spacing inconsistent**
**Locatie**: Dashboard KPI grids, Quick Actions

**Probleem**:
- KPI cards: `gap-3 sm:gap-4` - 12px gap is krap op 2-column grid
- Quick actions: `gap-3` - te weinig ruimte tussen buttons

**Voorbeeld AdminDashboard.tsx (regel 238)**:
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
```

**Impact**: ⭐⭐⭐ MEDIUM  

**Fix**:
- [ ] Gebruik `gap-4 sm:gap-6` voor meer breathing room
- [ ] Of single column op zeer kleine screens (< 360px)

---

### 7. **Search bar verdwijnt op mobiel**
**Locatie**: AdminLayout topbar (regel 371)

**Probleem**:
- Search heeft `hidden sm:block` - verdwijnt volledig op mobiel (<640px)
- Admins kunnen niet zoeken op hun telefoon!

```tsx
<div className="flex-1 max-w-md hidden sm:block">
  <div className="relative">
    <Search className="absolute left-3..." />
    <Input placeholder="Zoek sessies, gebruikers..." />
  </div>
</div>
```

**Impact**: ⭐⭐⭐⭐ HOOG (feature loss!)  

**Fix**:
- [ ] Toon search icon button op mobiel die sheet/modal opent
- [ ] OF: Maak search bar smaller maar altijd visible
- [ ] Search is critical functionality, mag niet verdwijnen

---

### 8. **User profile info verdwijnt op mobiel**
**Locatie**: AdminLayout topbar (regel 498-500)

**Probleem**:
- User naam en rol hebben `hidden sm:block`
- Op mobiel zie je alleen avatar, geen naam

```tsx
<div className="text-left hidden sm:block">
  <p className="text-[13px]...">Hugo Herbots</p>
  <p className="text-[11px]...">Super Admin</p>
</div>
```

**Impact**: ⭐⭐ LOW (acceptable, avatar is genoeg)  

**Fix**: OPTIONEEL - kan blijven zoals het is

---

## 🟡 MEDIUM PRIORITY ISSUES

### 9. **Dialog/Sheet overflow op kleine screens**
**Locatie**: TechniqueDetailsDialog, TranscriptDialog, Config Review Details

**Probleem**:
- Dialogs hebben `max-w-2xl` of `max-w-4xl` maar geen mobile-specific max height
- Content kan viewport height overschrijden zonder scroll
- Geen sticky footer voor action buttons

**Impact**: ⭐⭐⭐ MEDIUM  

**Fix**:
- [ ] Add `max-h-[90vh] overflow-y-auto` to dialog content
- [ ] Sticky footer: separate scrollable content from actions
- [ ] Test op iPhone SE (smallest modern screen: 375x667)

---

### 10. **Badge text te klein**
**Locatie**: Alle status badges, phase badges, type badges

**Probleem**:
- Badges gebruiken `text-[10px]` of `text-[11px]`
- Op mobiel met high DPI screens is dit te klein om comfortabel te lezen

**Voorbeeld**:
```tsx
<Badge className="text-[10px] sm:text-[11px]...">
  +12%
</Badge>
```

**Impact**: ⭐⭐ LOW-MEDIUM  

**Fix**:
- [ ] Minimum `text-[11px]` altijd, of `text-[12px]` op mobiel
- [ ] Test met real device, niet met browser zoom

---

### 11. **Icon sizes inconsistent**
**Locatie**: Buttons, cards, badges

**Probleem**:
- Icons variëren tussen `w-3 h-3`, `w-4 h-4`, `w-5 h-5`
- Geen consistent pattern voor mobiel vs desktop

**Impact**: ⭐⭐ LOW  

**Fix**:
- [ ] Standaardiseer: `w-4 h-4 sm:w-5 sm:h-5` voor card icons
- [ ] `w-4 h-4` voor button icons (consistent)

---

### 12. **Empty states niet optimized voor mobiel**
**Locatie**: Empty table states, no search results

**Probleem**:
- Empty state text kan te lang zijn en wrap awkwardly
- Icon sizes niet responsive

**Impact**: ⭐⭐ LOW  

**Fix**:
- [ ] Shorter copy op mobiel
- [ ] Smaller icons: `w-12 h-12 sm:w-16 sm:h-16`

---

## 🟢 LOW PRIORITY / NICE TO HAVE

### 13. **Mobile menu (Sheet) kan beter**
**Locatie**: AdminLayout mobile menu

**Verbeteringen**:
- [ ] Voeg favorieten/recent items toe bovenaan
- [ ] Groepeer items visueel met dividers/labels
- [ ] Toon unread counts (notifications badge)

**Impact**: ⭐ VERY LOW  

---

### 14. **Swipe gestures ontbreken**
**Locatie**: Tables, lists, cards

**Verbeteringen**:
- [ ] Swipe left op table row om actions te tonen
- [ ] Pull to refresh op lists
- [ ] Swipe between tabs op multi-tab views

**Impact**: ⭐ VERY LOW (future enhancement)  

---

### 15. **Landscape orientation niet optimized**
**Locatie**: Alle pagina's

**Verbeteringen**:
- [ ] Gebruik landscape real estate beter (wider sidebars)
- [ ] Show more table columns in landscape
- [ ] Different grid layouts for landscape

**Impact**: ⭐ VERY LOW  

---

## 📊 PRIORITY MATRIX

| Issue | Impact | Effort | Priority | Fix By |
|-------|--------|--------|----------|--------|
| #1 Tables horizontal scroll | ⭐⭐⭐⭐⭐ | HIGH | **P0** | Sprint 1 |
| #2 Filter bar ruimte | ⭐⭐⭐⭐ | MEDIUM | **P0** | Sprint 1 |
| #4 Touch targets <44px | ⭐⭐⭐⭐ | LOW | **P0** | Sprint 1 |
| #7 Search verdwijnt | ⭐⭐⭐⭐ | MEDIUM | **P1** | Sprint 1 |
| #3 Header buttons | ⭐⭐⭐ | MEDIUM | **P1** | Sprint 2 |
| #5 Text sizes | ⭐⭐⭐ | LOW | **P1** | Sprint 2 |
| #6 Grid spacing | ⭐⭐⭐ | LOW | **P2** | Sprint 2 |
| #9 Dialog overflow | ⭐⭐⭐ | MEDIUM | **P2** | Sprint 2 |
| #10 Badge text | ⭐⭐ | LOW | **P3** | Backlog |
| #11 Icon sizes | ⭐⭐ | LOW | **P3** | Backlog |
| #12 Empty states | ⭐⭐ | LOW | **P3** | Backlog |

---

## 🎯 RECOMMENDED FIXES - Sprint 1

### Fix #1: Mobile-First Table Pattern
**Implementatie**: Card-based layout voor mobiel

```tsx
{/* Desktop: Table view */}
<div className="hidden lg:block">
  <table className="w-full">
    {/* All columns */}
  </table>
</div>

{/* Mobile: Card view */}
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <p className="font-medium">{item.user}</p>
            <p className="text-sm text-muted">{item.technique}</p>
          </div>
        </div>
        <DropdownMenu>...</DropdownMenu>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>{item.score}%</span>
        <span>{item.date}</span>
      </div>
    </Card>
  ))}
</div>
```

### Fix #2: Responsive Filter Bar
```tsx
<Card className="p-4">
  <div className="flex flex-col md:flex-row gap-3">
    {/* Search - always full width on mobile */}
    <div className="w-full md:flex-1">
      <Input placeholder="Zoek..." />
    </div>
    
    {/* Filters - stack on mobile, row on md+ */}
    <div className="flex gap-2">
      <Select className="flex-1 md:w-[180px]">...</Select>
      <Select className="flex-1 md:w-[180px]">...</Select>
    </div>
    
    {/* More filters in dropdown on mobile */}
    <DropdownMenu className="md:hidden">
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon">
          <SlidersHorizontal />
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  </div>
</Card>
```

### Fix #4: Touch Target Sizes
```tsx
{/* BEFORE */}
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <MoreVertical className="w-4 h-4" />
</Button>

{/* AFTER */}
<Button variant="ghost" size="icon" className="h-11 w-11">
  <MoreVertical className="w-4 h-4" />
</Button>
```

### Fix #7: Mobile Search
```tsx
{/* Desktop: Inline search */}
<div className="hidden sm:flex flex-1 max-w-md">
  <Input placeholder="Zoek..." />
</div>

{/* Mobile: Search button that opens sheet */}
<Button 
  variant="ghost" 
  size="icon" 
  className="sm:hidden"
  onClick={() => setSearchSheetOpen(true)}
>
  <Search className="w-5 h-5" />
</Button>

<Sheet open={searchSheetOpen} onOpenChange={setSearchSheetOpen}>
  <SheetContent side="top" className="h-auto">
    <Input placeholder="Zoek sessies, gebruikers..." autoFocus />
  </SheetContent>
</Sheet>
```

---

## 📱 TEST DEVICES

Testen op deze devices/resolutions:
- [ ] iPhone SE (375x667) - smallest modern screen
- [ ] iPhone 12/13/14 (390x844) - most common
- [ ] iPhone 14 Pro Max (430x932) - largest iPhone
- [ ] Samsung Galaxy S21 (360x800) - Android baseline
- [ ] iPad Mini (768x1024) - tablet breakpoint
- [ ] Chrome DevTools responsive mode (all breakpoints)

---

## 🔧 BREAKPOINT STRATEGY

Current Tailwind breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

**Recommended usage admin view**:
- Mobile-first: `< 768px` (sm and below)
- Tablet: `768px - 1024px` (md)
- Desktop: `1024px+` (lg and above)

**Pattern**: 
- Stack on mobile/tablet: `flex-col md:flex-row`
- Hide on mobile: `hidden lg:block`
- Responsive text: `text-[13px] md:text-[14px] lg:text-[16px]`

---

## ✅ ACCEPTANCE CRITERIA

Een admin pagina is "mobile ready" als:
- [ ] Alle content leesbaar zonder horizontale scroll (max 390px width)
- [ ] Touch targets minimum 44x44px
- [ ] Text minimum 13px font size
- [ ] Filters/actions toegankelijk (niet verborgen)
- [ ] Tables/lists tonen alle essentiële info
- [ ] Dialogs/modals passen in viewport met scroll
- [ ] Spacing consistent en niet te krap (min 12px gaps)
- [ ] Buttons hebben duidelijke labels of tooltips
- [ ] Tested op real device (iPhone + Android)

---

**Einde rapport**
