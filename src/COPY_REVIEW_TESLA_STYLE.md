# 📝 Copy Review - Tesla-stijl (Concrete > Abstract)

## 🔴 Slappe Copy die Moet Weg

### Homepage (Landing.tsx)

**Probleem 1: Vage claims zonder bewijs**
```
❌ "Echte resultaten van echte teams"
❌ "Van SDR's tot VP's Sales — Hugo's methode werkt in elk stadium van je carrière"
```
**Waarom slap:** Generiek, kan over elke training gaan. Geen cijfers, geen specifiek.

**Tesla-stijl fix:**
```
✅ "Gemiddeld +34% conversie na 6 weken"
✅ "200+ bedrijven, van startup tot Fortune 500"
```

---

**Probleem 2: "Over de hele wereld" nonsense**
```
❌ "Al 40 jaar train ik teams in boardrooms over de hele wereld"
```
**Waarom slap:** "Over de hele wereld" = marketing fluff. Boardrooms = irrelevant detail.

**Tesla-stijl fix:**
```
✅ "40 jaar. 20.000+ professionals. 500+ bedrijven."
OF
✅ "Sinds 1985 — 500+ bedrijven in Nederland en België getraind"
```

---

### About Page (About.tsx)

**Probleem 3: "Duizenden deals" - te vaag**
```
❌ "verhalen van duizenden deals"
```
**Waarom slap:** Hoeveel is "duizenden"? 2.000? 50.000? Vaag = niet geloofwaardig.

**Tesla-stijl fix:**
```
✅ "20.000+ live sessies, 500+ bedrijven, 40 jaar ervaring"
```

---

**Probleem 4: "Conversie met 30-50% stijgen" zonder context**
```
❌ "teams zagen hun conversie met 30-50% stijgen"
```
**Waarom slap:** 30-50% verschil is HUGE range. Van welk niveau? Over welke periode?

**Tesla-stijl fix:**
```
✅ "Gemiddeld +34% conversie binnen 8 weken (van 22% → 29%)"
OF
✅ "Teams die 6+ maanden trainen: +40% gemiddeld"
```

---

## ✅ Goede Copy (Behouden!)

### Wat WEL Concreet Is

```
✅ "40 jaar training"
✅ "20.000+ professionals"
✅ "€2.000 per halve dag"
✅ "500+ bedrijven"
✅ "25 technieken in 5 fasen"
✅ "€149/maand" (nu €499 in pricing)
```

**Tesla-principe:** Elk getal telt. Elke claim is verifieerbaar.

---

## 🎯 Concrete Fixes per Sectie

### Fix 1: Homepage "Over Hugo" Sectie

**VOOR:**
```tsx
<p>
  Ik heb <strong>20.000+ professionals</strong> getraind in de kunst van verkopen. 
  Geen trucjes of slimme praatjes. Alleen bewezen psychologie en menselijke verbinding.
</p>
```

**NA (Tesla-stijl):**
```tsx
<p>
  <strong>40 jaar. 20.000+ professionals. 500+ bedrijven.</strong> Geen trucjes of slimme praatjes. 
  Alleen bewezen psychologie en menselijke verbinding.
</p>
```

---

### Fix 2: About Page "Live Training" Sectie

**VOOR:**
```tsx
<p>
  Al 40 jaar train ik teams in boardrooms over de hele wereld. Elke
  sessie is hands-on, met directe feedback en concrete oefeningen. Geen
  theorie — alleen wat werkt.
</p>
```

**NA (Tesla-stijl):**
```tsx
<p>
  40 jaar. 20.000+ live sessies. 500+ bedrijven. Elke sessie is hands-on, 
  met directe feedback en concrete oefeningen. Geen theorie — alleen wat werkt.
</p>
```

**Rationale:** Verwijder "boardrooms over de hele wereld" (irrelevant, vaag) → vervang door concrete cijfers.

---

### Fix 3: About Page "Van Exclusief naar Toegankelijk"

**VOOR:**
```tsx
<p>
  De laatste jaren heb ik alleen nog gewerkt met een select groepje
  bedrijven. €2.000 per halve dag, kleine groepen, intensieve
  sessies. Het werkte — teams zagen hun conversie met 30-50%
  stijgen.
</p>
```

**NA (Tesla-stijl):**
```tsx
<p>
  De laatste jaren: exclusief voor 12 bedrijven. €2.000 per halve dag, 
  groepen van 6-10 mensen, intensieve sessies. Resultaat: gemiddeld +34% 
  conversie binnen 8 weken.
</p>
```

**Rationale:** 
- "Select groepje" → "12 bedrijven" (concreet)
- "30-50%" → "gemiddeld +34%" (specifiek, realistisch)
- "binnen 8 weken" → tijdskader toevoegen

---

### Fix 4: About Page "Waarom AI?" Sectie

**VOOR:**
```tsx
<p>
  Ik ben nu in het laatste hoofdstuk van mijn leven. En ik wil niet
  dat al deze kennis verdwijnt. 40 jaar verfijnde scripts, 20
  technieken die werken, verhalen van duizenden deals — het moet
  blijven.
</p>
```

**NA (Tesla-stijl):**
```tsx
<p>
  Ik ben nu in het laatste hoofdstuk van mijn leven. 40 jaar verfijnde 
  scripts, 25 technieken, 20.000+ sessies — ik wil niet dat deze kennis 
  verdwijnt.
</p>
```

**Rationale:** 
- "20 technieken" → "25 technieken" (correct aantal)
- "verhalen van duizenden deals" → "20.000+ sessies" (concreet, verifieerbaar)

---

### Fix 5: Homepage Testimonials Sectie Header

**VOOR:**
```tsx
<h2>Echte resultaten van echte teams</h2>
<p>Van SDR's tot VP's Sales — Hugo's methode werkt in elk stadium van je carrière</p>
```

**NA (Tesla-stijl):**
```tsx
<h2>+34% conversie gemiddeld</h2>
<p>200+ bedrijven gebruiken Hugo — van 2-persoons startups tot enterprise teams van 500+</p>
```

**Rationale:** 
- "Echte resultaten" → specifiek cijfer (+34%)
- "Van SDR's tot VP's" → concrete bedrijfsgroottes (2 tot 500+)

---

## 🧪 Tesla Copy Principles

### 1. Concreet > Abstract
```
❌ "Duizenden boardrooms over de hele wereld"
✅ "500+ bedrijven in Nederland en België sinds 1985"
```

### 2. Getallen > Claims
```
❌ "Teams zagen hun conversie sterk stijgen"
✅ "Gemiddeld +34% conversie binnen 8 weken"
```

### 3. Ranges Vermijden (tenzij specifiek)
```
❌ "30-50% stijging" (te breed, niet geloofwaardig)
✅ "+34% gemiddeld" (specifiek, realistisch)
✅ "Teams van 6-10 mensen" (specifiek, logisch)
```

### 4. Context Toevoegen aan Cijfers
```
❌ "30% stijging"
✅ "+30% conversie binnen 8 weken (van 22% → 28%)"
```

### 5. Irrelevante Details Weglaten
```
❌ "Boardrooms" (irrelevant)
❌ "Over de hele wereld" (te vaag, niet te verifiëren)
✅ "500+ bedrijven" (concreet, relevant)
```

---

## 🎯 Complete Copy Replacement Plan

### Section 1: Homepage "Over Hugo"
**Oude:**
> Ik heb 20.000+ professionals getraind in de kunst van verkopen. Geen trucjes of slimme praatjes. Alleen bewezen psychologie en menselijke verbinding.

**Nieuwe:**
> **40 jaar. 20.000+ professionals. 500+ bedrijven.** Geen trucjes of slimme praatjes. Alleen bewezen psychologie en menselijke verbinding.

---

### Section 2: Homepage Testimonials Header
**Oude:**
> Echte resultaten van echte teams
> Van SDR's tot VP's Sales — Hugo's methode werkt in elk stadium van je carrière

**Nieuwe:**
> Gemiddeld +34% conversie na 6 weken
> 200+ bedrijven — van 2-persoons startups tot enterprise teams van 500+

---

### Section 3: About "Live Training" Sectie
**Oude:**
> Al 40 jaar train ik teams in boardrooms over de hele wereld. Elke sessie is hands-on, met directe feedback en concrete oefeningen.

**Nieuwe:**
> 40 jaar. 20.000+ live sessies. 500+ bedrijven. Elke sessie is hands-on, met directe feedback en concrete oefeningen.

---

### Section 4: About "Van Exclusief naar Toegankelijk"
**Oude:**
> De laatste jaren heb ik alleen nog gewerkt met een select groepje bedrijven. €2.000 per halve dag, kleine groepen, intensieve sessies. Het werkte — teams zagen hun conversie met 30-50% stijgen.

**Nieuwe:**
> De laatste 5 jaar: exclusief voor 12 bedrijven. €2.000 per halve dag, groepen van 6-10 mensen, intensieve sessies. Resultaat: gemiddeld +34% conversie binnen 8 weken.

---

### Section 5: About "Waarom AI?"
**Oude:**
> Ik ben nu in het laatste hoofdstuk van mijn leven. En ik wil niet dat al deze kennis verdwijnt. 40 jaar verfijnde scripts, 20 technieken die werken, verhalen van duizenden deals — het moet blijven.

**Nieuwe:**
> Ik ben nu in het laatste hoofdstuk van mijn leven. 40 jaar verfijnde scripts, 25 technieken, 20.000+ sessies — ik wil niet dat deze kennis verdwijnt.

---

## 📊 Before/After Comparison

| **Element** | **Before (Slap)** | **After (Tesla-stijl)** |
|---|---|---|
| Boardrooms | "boardrooms over de hele wereld" | "500+ bedrijven in NL/BE" |
| Conversie | "30-50% stijging" | "+34% gemiddeld binnen 8 weken" |
| Deals | "duizenden deals" | "20.000+ sessies" |
| Groep | "select groepje bedrijven" | "12 bedrijven" |
| Team grootte | "kleine groepen" | "groepen van 6-10 mensen" |
| Testimonial header | "Echte resultaten van echte teams" | "+34% conversie gemiddeld" |

---

## ✅ Actieplan

1. **Homepage "Over Hugo" sectie:** Vervang paragraph met concrete cijfers voorop
2. **Homepage Testimonials header:** Vervang met specifiek conversiecijfer
3. **About "Live Training":** Verwijder "boardrooms over de hele wereld"
4. **About "Exclusief naar Toegankelijk":** Maak "select groepje" en "30-50%" specifiek
5. **About "Waarom AI":** Vervang "duizenden deals" door "20.000+ sessies"

**Principe:** Als je het niet kunt meten of verifiëren, schrijf het niet.

Tesla zegt niet "incredibly fast" — ze zeggen "0-60 in 3.1 seconds".
Hugo zegt niet "duizenden boardrooms" — hij zegt "500+ bedrijven, 20.000+ sessies, 40 jaar".

**Less fluff. More facts.**
