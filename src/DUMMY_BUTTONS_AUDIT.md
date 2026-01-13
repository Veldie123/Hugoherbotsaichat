# Dummy Buttons Audit - Admin Views
**Datum:** 6 januari 2026  
**Doel:** Inventarisatie van alle buttons die nog niet geïmplementeerd zijn

---

## 🔴 ADMIN LAYOUT (Global)

### Topbar - Notifications Dropdown
- ❌ **"Alle notificaties"** button onderaan dropdown
  - **Locatie:** AdminLayout.tsx, lijn 442
  - **Moet naar:** Dedicated notifications page/modal met volledige notificatielijst
  - **Prioriteit:** MEDIUM

### Quick Actions
- ✅ "Nieuwe Video" → navigeert naar admin-videos
- ✅ "Live Sessie" → navigeert naar admin-live

---

## 🔴 ADMIN DASHBOARD

### Quick Actions Cards
- ❌ **"Video uploaden"** card
  - **Moet naar:** AdminVideoManagement upload modal
  - **Status:** Navigatie werkt, upload functionaliteit is dummy
  
- ❌ **"Plan live sessie"** card
  - **Moet naar:** AdminLiveSessions plan modal
  - **Status:** Navigatie werkt, plan functionaliteit is dummy

- ❌ **"View report"** button (bij Activity Chart)
  - **Moet naar:** AdminAnalytics met gefilterde view
  - **Prioriteit:** LOW

---

## 🔴 ADMIN VIDEO MANAGEMENT

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export video lijst naar CSV/Excel
  - **Prioriteit:** MEDIUM

### Video Cards - Dropdown Menu
- ❌ **"Preview"** action
  - **Moet naar:** Video preview modal/pagina
  - **Prioriteit:** HIGH
  
- ❌ **"Bewerk"** action
  - **Moet naar:** Edit video modal (pre-filled)
  - **Prioriteit:** HIGH
  
- ❌ **"Download"** action
  - **Moet doen:** Download video file
  - **Prioriteit:** LOW
  
- ❌ **"Verwijder"** action
  - **Moet doen:** Delete confirmation + API call
  - **Prioriteit:** HIGH

### Upload Modal
- ❌ **"Publiceren"** button
  - **Moet doen:** Save video metadata + upload file naar Supabase Storage
  - **Status:** Modal werkt, upload functionaliteit is dummy
  - **Prioriteit:** CRITICAL

---

## 🔴 ADMIN LIVE SESSIONS

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export sessies naar CSV
  - **Prioriteit:** LOW

### Session Cards/List - Dropdown Menu
- ❌ **"Bewerk"** action (in dropdown)
  - **Moet naar:** Edit dialog (werkt al gedeeltelijk)
  - **Status:** Dialog opent maar save functionaliteit is dummy
  - **Prioriteit:** HIGH
  
- ❌ **"Duplicate"** action
  - **Moet doen:** Dupliceer sessie met nieuwe datum
  - **Prioriteit:** MEDIUM
  
- ❌ **"Cancel"** action
  - **Moet doen:** Cancel sessie + notificeer deelnemers
  - **Prioriteit:** HIGH
  
- ❌ **"Verwijder"** action
  - **Moet doen:** Delete confirmation + API call
  - **Prioriteit:** HIGH

### Plan Session Modal
- ❌ **"Plan Sessie"** button
  - **Moet doen:** Create new session in database
  - **Status:** Modal werkt, save functionaliteit is dummy
  - **Prioriteit:** CRITICAL

### Edit Session Modal
- ❌ **"Sessie Opslaan"** button
  - **Moet doen:** Update session in database
  - **Status:** Modal werkt, update functionaliteit is dummy
  - **Prioriteit:** CRITICAL

---

## 🔴 ADMIN USER MANAGEMENT

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export user lijst naar CSV
  - **Prioriteit:** MEDIUM

### User Cards/Table - Dropdown Menu
- ❌ **"View Details"** action
  - **Moet naar:** User detail modal (werkt al)
  - **Status:** Modal opent maar acties in modal zijn dummy
  - **Prioriteit:** HIGH
  
- ❌ **"Send Message"** action
  - **Moet naar:** Message compose modal/email client
  - **Prioriteit:** MEDIUM
  
- ❌ **"Reset Password"** action
  - **Moet doen:** Send password reset email
  - **Prioriteit:** HIGH
  
- ❌ **"Suspend Account"** action
  - **Moet doen:** Suspend user account in database
  - **Prioriteit:** HIGH
  
- ❌ **"Delete Account"** action
  - **Moet doen:** Delete confirmation + remove user
  - **Prioriteit:** HIGH

### User Detail Modal
- ❌ **"Reset Password"** button
  - **Moet doen:** Send reset email
  - **Prioriteit:** HIGH
  
- ❌ **"Send Message"** button
  - **Moet naar:** Email compose
  - **Prioriteit:** MEDIUM
  
- ❌ **"Suspend Account"** button
  - **Moet doen:** Suspend user
  - **Prioriteit:** HIGH
  
- ❌ **"Delete Account"** button
  - **Moet doen:** Delete user (with confirmation)
  - **Prioriteit:** CRITICAL

---

## 🔴 ADMIN SESSION TRANSCRIPTS

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export transcripts naar CSV
  - **Prioriteit:** LOW

### Transcript Cards/Table - Dropdown Menu
- ❌ **"View Transcript"** action
  - **Moet naar:** Transcript modal (werkt al)
  - **Status:** Modal opent maar acties zijn dummy
  - **Prioriteit:** HIGH
  
- ❌ **"Download"** action
  - **Moet doen:** Download transcript als TXT/PDF
  - **Prioriteit:** MEDIUM
  
- ❌ **"Flag for Review"** action
  - **Moet doen:** Flag session in database
  - **Prioriteit:** MEDIUM
  
- ❌ **"Archive"** action
  - **Moet doen:** Archive session
  - **Prioriteit:** LOW

### Transcript Modal
- ❌ **"Download Transcript"** button
  - **Moet doen:** Download als file
  - **Prioriteit:** MEDIUM
  
- ❌ **"Share"** button
  - **Moet naar:** Share modal met link generatie
  - **Prioriteit:** LOW
  
- ❌ **"Flag Session"** button
  - **Moet doen:** Toggle flag status
  - **Prioriteit:** MEDIUM

---

## 🔴 ADMIN RESOURCE LIBRARY

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export resources lijst
  - **Prioriteit:** LOW

### Resource Cards - Dropdown Menu
- ❌ **"Preview"** action
  - **Moet naar:** Resource preview modal
  - **Prioriteit:** HIGH
  
- ❌ **"Edit"** action
  - **Moet naar:** Edit resource modal
  - **Prioriteit:** HIGH
  
- ❌ **"Download"** action
  - **Moet doen:** Download resource file
  - **Prioriteit:** MEDIUM
  
- ❌ **"Delete"** action
  - **Moet doen:** Delete confirmation + remove
  - **Prioriteit:** HIGH

### Create/Edit Resource Modal
- ❌ **"Resource toevoegen"** button
  - **Moet doen:** Create resource + upload file
  - **Prioriteit:** CRITICAL
  
- ❌ **"Opslaan"** button (edit)
  - **Moet doen:** Update resource
  - **Prioriteit:** CRITICAL

---

## 🔴 ADMIN HELP CENTER

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export articles lijst
  - **Prioriteit:** LOW

### Article Cards - Dropdown Menu
- ❌ **"Bewerken"** action
  - **Moet naar:** Edit dialog (werkt al gedeeltelijk)
  - **Status:** Dialog opent maar save is dummy
  - **Prioriteit:** HIGH
  
- ❌ **"Preview"** action
  - **Moet naar:** Article preview in user view
  - **Prioriteit:** MEDIUM
  
- ❌ **"Duplicate"** action
  - **Moet doen:** Duplicate article
  - **Prioriteit:** LOW
  
- ❌ **"Archive"** action
  - **Moet doen:** Archive article
  - **Prioriteit:** MEDIUM
  
- ❌ **"Verwijderen"** action
  - **Moet doen:** Delete confirmation + remove
  - **Prioriteit:** HIGH

### Create/Edit Article Modal
- ❌ **"Artikel aanmaken"** button
  - **Moet doen:** Create article in database
  - **Prioriteit:** CRITICAL
  
- ❌ **"Opslaan"** button (edit)
  - **Moet doen:** Update article
  - **Prioriteit:** CRITICAL

---

## 🔴 ADMIN UPLOAD MANAGEMENT

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export uploads lijst
  - **Prioriteit:** LOW
  
- ❌ **Bulk Actions** (indien geselecteerd)
  - **Moet doen:** Bulk approve/reject/delete
  - **Prioriteit:** MEDIUM

### Upload Cards - Dropdown Menu
- ❌ **"View Details"** action
  - **Moet naar:** Details modal (werkt al)
  - **Status:** Modal opent maar acties zijn dummy
  - **Prioriteit:** HIGH
  
- ❌ **"Approve"** action
  - **Moet doen:** Approve upload → move to published
  - **Prioriteit:** CRITICAL
  
- ❌ **"Reject"** action
  - **Moet doen:** Reject with reason modal
  - **Prioriteit:** HIGH
  
- ❌ **"Download"** action
  - **Moet doen:** Download original file
  - **Prioriteit:** MEDIUM

### Upload Details Modal
- ❌ **"Approve"** button
  - **Moet doen:** Approve upload
  - **Prioriteit:** CRITICAL
  
- ❌ **"Reject"** button
  - **Moet doen:** Reject with reason
  - **Prioriteit:** CRITICAL
  
- ❌ **"Download Original"** button
  - **Moet doen:** Download file
  - **Prioriteit:** MEDIUM
  
- ❌ **"Verwijder"** button
  - **Moet doen:** Delete upload
  - **Prioriteit:** HIGH

---

## 🔴 ADMIN ORGANIZATION MANAGEMENT

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export organizations lijst
  - **Prioriteit:** LOW
  
- ❌ **"Add Organization"** button
  - **Moet naar:** Create organization modal
  - **Prioriteit:** HIGH

### Organization Cards - Dropdown Menu
- ❌ **"View Details"** action
  - **Moet naar:** Details modal (werkt al)
  - **Status:** Modal opent maar acties zijn dummy
  - **Prioriteit:** HIGH
  
- ❌ **"Edit"** action
  - **Moet naar:** Edit organization modal
  - **Prioriteit:** HIGH
  
- ❌ **"Suspend"** action
  - **Moet doen:** Suspend organization
  - **Prioriteit:** HIGH
  
- ❌ **"Delete"** action
  - **Moet doen:** Delete with confirmation
  - **Prioriteit:** CRITICAL

### Organization Details Modal
- ❌ **"Send Message"** button
  - **Moet naar:** Email compose to all org users
  - **Prioriteit:** MEDIUM
  
- ❌ **"Bewerk"** button
  - **Moet naar:** Edit modal
  - **Prioriteit:** HIGH

---

## 🔴 ADMIN ANALYTICS

### Topbar Actions
- ❌ **Export Report** button
  - **Moet doen:** Export analytics data naar PDF/Excel
  - **Prioriteit:** MEDIUM

### Chart Interactions
- ❌ **Drill-down** functionaliteit
  - **Moet naar:** Detailed view van geselecteerde metric
  - **Prioriteit:** LOW

---

## 🔴 ADMIN CONTENT LIBRARY

### Topbar Actions
- ❌ **Export button**
  - **Moet doen:** Export content lijst
  - **Prioriteit:** LOW
  
- ❌ **"Upload Content"** button
  - **Moet naar:** Upload modal
  - **Prioriteit:** HIGH

### Content Cards - Dropdown Menu
- ❌ **"Edit"** action
  - **Moet naar:** Edit modal
  - **Prioriteit:** HIGH
  
- ❌ **"Preview"** action
  - **Moet naar:** Content preview
  - **Prioriteit:** MEDIUM
  
- ❌ **"Delete"** action
  - **Moet doen:** Delete confirmation
  - **Prioriteit:** HIGH

---

## 📊 PRIORITEITEN SAMENVATTING

### 🔥 CRITICAL (Backend integratie vereist)
1. **Video Upload** - Publiceren button + file upload
2. **Live Session** - Plan + Bewerk buttons
3. **User Management** - Delete Account functionaliteit
4. **Resource Library** - Create/Edit resources
5. **Help Center** - Create/Edit articles
6. **Upload Management** - Approve/Reject functionaliteit
7. **Organization Management** - Delete org

### ⚠️ HIGH (Belangrijke functionaliteit)
1. **Video Management** - Preview, Edit, Delete
2. **User Management** - Suspend, Reset Password, View Details acties
3. **Session Transcripts** - View, Flag, Archive
4. **Notifications** - "Alle notificaties" pagina
5. **Organization Management** - Add, Edit, Suspend, View Details

### 📌 MEDIUM (Nice to have)
1. **Export functionaliteit** - Overal waar export buttons zijn
2. **Send Message** - Messaging functionaliteit
3. **Download** - Download transcripts, files
4. **Duplicate** - Sessies, articles dupliceren

### ⚪ LOW (Future enhancements)
1. **Advanced Analytics** - Drill-down, custom reports
2. **Share** - Share links generatie
3. **Archive** - Archive functionaliteit waar nog niet geïmplementeerd

---

## 🎯 AANBEVOLEN IMPLEMENTATIE VOLGORDE

### **Sprint 1: Core CRUD Operations**
1. Video Upload (create)
2. Live Sessions (create, update)
3. User Details acties (suspend, delete)
4. Video management (edit, delete)

### **Sprint 2: Content Management**
1. Resources (create, edit, delete)
2. Help Center (create, edit, delete)
3. Upload Management (approve, reject)

### **Sprint 3: Organization & Bulk Actions**
1. Organization management (CRUD)
2. Bulk actions (waar relevant)
3. Export functionaliteit (CSV/Excel)

### **Sprint 4: Communications & Nice-to-haves**
1. Notifications page
2. Messaging systeem
3. Download functionaliteit
4. Preview/Share features

---

## 📝 NOTITIES

- Alle modals bestaan al en openen correct
- Forms zijn functioneel maar submit handlers loggen alleen naar console
- Database schema lijkt ready voor meeste operaties
- Supabase Storage integration nodig voor file uploads
- Email service nodig voor password resets en messaging

