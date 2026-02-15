# Data Flow Diagram (DFD) Document
## Zelan Bakery & Cake - Web Application

**Version:** 1.0
**Date:** February 11, 2026
**Application:** Zelan Bakery & Cake Website
**Tech Stack:** React 18 + Vite + Axios
**Backend API:** https://zelanbe-production.up.railway.app

---

## Table of Contents

1. [External Entities](#1-external-entities)
2. [Data Stores](#2-data-stores)
3. [Context Diagram (Level 0)](#3-context-diagram-level-0)
4. [Level 1 DFD](#4-level-1-dfd)
5. [Level 2 DFD - Process Decomposition](#5-level-2-dfd---process-decomposition)
6. [Data Dictionary](#6-data-dictionary)
7. [API Endpoint Mapping](#7-api-endpoint-mapping)

---

## 1. External Entities

| ID   | Entity          | Description                                                    |
|------|-----------------|----------------------------------------------------------------|
| E1   | Customer        | Public user who browses the menu, views item details, and contacts the bakery |
| E2   | Admin           | Authenticated user who manages menu items, categories, FAQs, and other admin users |
| E3   | Backend Server  | REST API server hosted on Railway (zelanbe-production.up.railway.app) |

---

## 2. Data Stores

| ID   | Data Store         | Description                                          |
|------|--------------------|------------------------------------------------------|
| DS1  | Menu Items DB      | Stores menu items with images, prices, voice files   |
| DS2  | Categories DB      | Stores menu categories                               |
| DS3  | FAQs DB            | Stores frequently asked questions and answers         |
| DS4  | Gallery DB         | Stores gallery images                                |
| DS5  | Specials DB        | Stores promotional/special items                     |
| DS6  | Admin Users DB     | Stores admin user credentials and profiles           |
| DS7  | File Storage       | Stores uploaded images and voice (MP3) files         |
| DS8  | LocalStorage       | Browser localStorage for auth token, user session    |

---

## 3. Context Diagram (Level 0)

```mermaid
graph TB
    E1([fa:fa-user Customer])
    E2([fa:fa-user-shield Admin])
    E3[(fa:fa-server Backend Server<br/>Railway API + Database)]

    E1 -->|"Browse Menu, View Details,<br/>Listen Voice, View Gallery,<br/>View FAQ"| P0
    P0 -->|"Menu Items, Categories,<br/>FAQs, Gallery, Specials,<br/>Voice Files"| E1

    E2 -->|"Login, Manage Menu,<br/>Manage Categories, Manage FAQ,<br/>Register Admin, Change Password"| P0
    P0 -->|"Stats, CRUD Confirmations,<br/>Auth Tokens, Success/Error Msgs"| E2

    P0 -->|"API Requests<br/>(REST + JWT)"| E3
    E3 -->|"API Responses<br/>(JSON + Files)"| P0

    P0{{"P0<br/>Zelan Bakery & Cake<br/>Web Application"}}

    style P0 fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e293b
    style E1 fill:#dbeafe,stroke:#2563eb,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

---

## 4. Level 1 DFD

```mermaid
graph TB
    E1([fa:fa-user Customer])
    E2([fa:fa-user-shield Admin])
    E3[(fa:fa-server Backend Server)]
    DS8[(DS8: LocalStorage)]

    E1 -->|"Page Request"| P1
    P1 -->|"Data Request"| P2
    P2 -->|"GET /categories<br/>GET /menu<br/>GET /faqs<br/>GET /specials"| E3
    E3 -->|"Categories, Menu Items,<br/>FAQs, Specials"| P2
    P2 -->|"All Public Data"| P1
    P1 -->|"Rendered Homepage"| E1

    E1 -->|"Click Menu Item (ID)"| P4
    P4 -->|"GET /menu/:id"| E3
    E3 -->|"Item Detail + Images<br/>+ Voice File"| P4
    P4 -->|"Detail Page + Carousel<br/>+ Voice Playback"| E1

    E2 -->|"Login Credentials"| P3
    P3 -->|"POST /auth/login"| E3
    E3 -->|"Token + User Data"| P3
    P3 -->|"authToken, isAuthenticated"| DS8
    DS8 -->|"Token Validation"| P3
    P3 -->|"Access Granted / Denied"| E2

    DS8 -->|"Bearer Token"| P5
    E2 -->|"CRUD Operations"| P5
    P5 -->|"API Requests<br/>(with Auth Header)"| E3
    E3 -->|"CRUD Results + Stats"| P5
    P5 -->|"Updated Data + Confirmations"| E2

    P1{{"P1<br/>Browse Public<br/>Content"}}
    P2{{"P2<br/>Fetch Public<br/>Data"}}
    P3{{"P3<br/>Authenticate<br/>Admin"}}
    P4{{"P4<br/>View Menu<br/>Detail"}}
    P5{{"P5<br/>Manage Content<br/>(Admin)"}}

    style P1 fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e293b
    style P2 fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e293b
    style P3 fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e293b
    style P4 fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e293b
    style P5 fill:#ffffff,stroke:#2563eb,stroke-width:2px,color:#1e293b
    style E1 fill:#dbeafe,stroke:#2563eb,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
    style DS8 fill:#fef9c3,stroke:#ca8a04,color:#1e293b
```

### Level 1 Process Descriptions

| Process | Name                  | Description                                                                              |
|---------|-----------------------|------------------------------------------------------------------------------------------|
| P1      | Browse Public Content | Customer browses homepage: menu with category filtering, gallery, FAQ, specials, maps     |
| P2      | Fetch Public Data     | Retrieves all public data from backend API on page load (categories, menu, FAQs, gallery) |
| P3      | Authenticate Admin    | Handles admin login, token storage in localStorage, session validation, logout            |
| P4      | View Menu Detail      | Displays full menu item detail with image carousel, voice playback, and related items     |
| P5      | Manage Content (Admin)| Admin CRUD operations for menu items, categories, FAQs, and admin users                  |

---

## 5. Level 2 DFD - Process Decomposition

### 5.1 P1 - Browse Public Content

```mermaid
graph TB
    E1([fa:fa-user Customer])
    E3[(Backend Server)]

    E1 -->|"Page Load"| P1_1
    P1_1 -->|"Request All Data"| P1_2

    P1_2 -->|"GET /categories"| E3
    P1_2 -->|"GET /menu"| E3
    P1_2 -->|"GET /faqs"| E3
    P1_2 -->|"GET /specials"| E3

    E3 -->|"Categories[]"| P1_2
    E3 -->|"MenuItems[]"| P1_2
    E3 -->|"FAQs[]"| P1_2
    E3 -->|"Specials[]"| P1_2

    P1_2 -->|"All Loaded Data"| P1_1
    P1_1 -->|"Rendered Sections"| E1

    E1 -->|"Category Selection /<br/>Favorit Toggle"| P1_3
    P1_3 -->|"Filtered Items"| P1_4
    P1_4 -->|"Paginated Items<br/>(6 per page)"| P1_1

    E1 -->|"Expand/Collapse"| P1_5
    P1_5 -->|"FAQ Toggle State"| P1_1

    E1 -->|"Gallery Navigation"| P1_6
    P1_6 -->|"Gallery Page<br/>(9 per page)"| P1_1

    P1_1{{"P1.1<br/>Render Homepage<br/>Sections"}}
    P1_2{{"P1.2<br/>Load & Cache<br/>Data"}}
    P1_3{{"P1.3<br/>Filter Menu by<br/>Category/Featured"}}
    P1_4{{"P1.4<br/>Paginate<br/>Results"}}
    P1_5{{"P1.5<br/>Toggle FAQ<br/>Accordion"}}
    P1_6{{"P1.6<br/>Paginate<br/>Gallery"}}

    style P1_1 fill:#ffffff,stroke:#7c3aed,stroke-width:2px,color:#1e293b
    style P1_2 fill:#ffffff,stroke:#7c3aed,stroke-width:2px,color:#1e293b
    style P1_3 fill:#ffffff,stroke:#7c3aed,stroke-width:2px,color:#1e293b
    style P1_4 fill:#ffffff,stroke:#7c3aed,stroke-width:2px,color:#1e293b
    style P1_5 fill:#ffffff,stroke:#7c3aed,stroke-width:2px,color:#1e293b
    style P1_6 fill:#ffffff,stroke:#7c3aed,stroke-width:2px,color:#1e293b
    style E1 fill:#dbeafe,stroke:#2563eb,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

### 5.2 P3 - Authenticate Admin

```mermaid
graph TB
    E2([fa:fa-user-shield Admin])
    E3[(Backend Server)]
    DS8[(DS8: LocalStorage)]

    subgraph Login Flow
        E2 -->|"Username + Password"| P3_1
        P3_1 -->|"POST /auth/login<br/>{username, password}"| E3
        E3 -->|"{token, user}"| P3_1
        P3_1 -->|"token + user data"| P3_2
        P3_2 -->|"authToken = token<br/>isAuthenticated = true<br/>user = JSON"| DS8
    end

    subgraph Route Protection
        DS8 -->|"Read authToken<br/>+ isAuthenticated"| P3_3
        P3_3 -->|"Allow → Render Admin<br/>Deny → Redirect /login"| E2
    end

    subgraph Logout Flow
        E2 -->|"Click Logout"| P3_4
        P3_4 -->|"POST /auth/logout"| E3
        P3_4 -->|"Remove authToken<br/>Remove isAuthenticated"| DS8
        P3_4 -->|"Redirect to /login"| E2
    end

    P3_1{{"P3.1<br/>Submit<br/>Login Form"}}
    P3_2{{"P3.2<br/>Store<br/>Auth State"}}
    P3_3{{"P3.3<br/>Validate<br/>Protected Route"}}
    P3_4{{"P3.4<br/>Logout"}}

    style P3_1 fill:#ffffff,stroke:#dc2626,stroke-width:2px,color:#1e293b
    style P3_2 fill:#ffffff,stroke:#dc2626,stroke-width:2px,color:#1e293b
    style P3_3 fill:#ffffff,stroke:#dc2626,stroke-width:2px,color:#1e293b
    style P3_4 fill:#ffffff,stroke:#dc2626,stroke-width:2px,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
    style DS8 fill:#fef9c3,stroke:#ca8a04,color:#1e293b
```

### 5.3 P4 - View Menu Detail

```mermaid
graph TB
    E1([fa:fa-user Customer])
    E3[(Backend Server)]

    E1 -->|"Click Menu Item (ID)"| P4_1
    P4_1 -->|"GET /menu/:id"| E3
    E3 -->|"Item + Images[]<br/>+ Voice File URL"| P4_1

    P4_1 --> P4_2
    P4_1 --> P4_3
    P4_1 --> P4_4

    P4_2 -->|"Image Carousel<br/>+ Fullscreen Modal"| E1
    P4_3 -->|"Auto-play Voice<br/>(MP3 or TTS Fallback)"| E1
    P4_4 -->|"GET /menu?category_id=X"| E3
    E3 -->|"Related Items[]"| P4_4
    P4_4 -->|"Up to 3 Related Items"| E1

    P4_1{{"P4.1<br/>Fetch Item<br/>Detail"}}
    P4_2{{"P4.2<br/>Display Image<br/>Carousel"}}
    P4_3{{"P4.3<br/>Play Voice<br/>Description"}}
    P4_4{{"P4.4<br/>Load Related<br/>Items"}}

    style P4_1 fill:#ffffff,stroke:#0284c7,stroke-width:2px,color:#1e293b
    style P4_2 fill:#ffffff,stroke:#0284c7,stroke-width:2px,color:#1e293b
    style P4_3 fill:#ffffff,stroke:#0284c7,stroke-width:2px,color:#1e293b
    style P4_4 fill:#ffffff,stroke:#0284c7,stroke-width:2px,color:#1e293b
    style E1 fill:#dbeafe,stroke:#2563eb,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

### 5.4 P5a - Menu Item Management

```mermaid
graph TB
    E2([fa:fa-user-shield Admin])
    E3[(Backend Server)]

    E2 -->|"View Menu Items"| P5a_1
    P5a_1 -->|"GET /menu"| E3
    E3 -->|"MenuItem[]"| P5a_1
    P5a_1 -->|"Filtered & Searchable Table"| E2

    E2 -->|"Create Item Form<br/>(multipart/form-data)"| P5a_2
    P5a_2 -->|"POST /menu"| E3
    E3 -->|"New Item ID"| P5a_2
    P5a_2 -->|"Upload Images Loop"| P5a_3

    P5a_3 -->|"POST /menu/:id/images<br/>(up to 4 images)"| E3
    E3 -->|"Updated Item"| P5a_3

    E2 -->|"Edit Item Form<br/>(multipart/form-data)"| P5a_4
    P5a_4 -->|"PUT /menu/:id"| E3
    E3 -->|"Updated Item"| P5a_4

    E2 -->|"Delete Item"| P5a_5
    P5a_5 -->|"DELETE /menu/:id"| E3
    E3 -->|"Success/Error"| P5a_5

    E2 -->|"Upload MP3"| P5a_6
    P5a_6 -->|"POST /menu/:id/voice"| E3
    E3 -->|"Updated Item"| P5a_6

    P5a_1{{"P5a.1<br/>List + Search<br/>+ Filter"}}
    P5a_2{{"P5a.2<br/>Create<br/>Menu Item"}}
    P5a_3{{"P5a.3<br/>Upload<br/>Images"}}
    P5a_4{{"P5a.4<br/>Update<br/>Menu Item"}}
    P5a_5{{"P5a.5<br/>Delete<br/>Menu Item"}}
    P5a_6{{"P5a.6<br/>Upload<br/>Voice File"}}

    style P5a_1 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#1e293b
    style P5a_2 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#1e293b
    style P5a_3 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#1e293b
    style P5a_4 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#1e293b
    style P5a_5 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#1e293b
    style P5a_6 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

### 5.5 P5b - Category Management

```mermaid
graph TB
    E2([fa:fa-user-shield Admin])
    E3[(Backend Server)]

    E2 -->|"View Categories"| P5b_1
    P5b_1 -->|"GET /categories"| E3
    E3 -->|"Category[]"| P5b_1
    P5b_1 -->|"Category List"| E2

    E2 -->|"Add Category Name"| P5b_2
    P5b_2 -->|"POST /categories<br/>{name}"| E3
    E3 -->|"New Category"| P5b_2

    E2 -->|"Delete Category"| P5b_3
    P5b_3 -->|"DELETE /categories/:id"| E3
    E3 -->|"Success/Error"| P5b_3

    P5b_1{{"P5b.1<br/>List<br/>Categories"}}
    P5b_2{{"P5b.2<br/>Create<br/>Category"}}
    P5b_3{{"P5b.3<br/>Delete<br/>Category"}}

    style P5b_1 fill:#ffffff,stroke:#ca8a04,stroke-width:2px,color:#1e293b
    style P5b_2 fill:#ffffff,stroke:#ca8a04,stroke-width:2px,color:#1e293b
    style P5b_3 fill:#ffffff,stroke:#ca8a04,stroke-width:2px,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

### 5.6 P5c - FAQ Management

```mermaid
graph TB
    E2([fa:fa-user-shield Admin])
    E3[(Backend Server)]

    E2 -->|"View FAQs"| P5c_1
    P5c_1 -->|"GET /faqs"| E3
    E3 -->|"FAQ[]"| P5c_1
    P5c_1 -->|"FAQ Accordion List"| E2

    E2 -->|"Add FAQ"| P5c_2
    P5c_2 -->|"POST /faqs<br/>{question, answer}"| E3
    E3 -->|"New FAQ"| P5c_2

    E2 -->|"Edit FAQ"| P5c_3
    P5c_3 -->|"PUT /faqs/:id<br/>{question, answer}"| E3
    E3 -->|"Updated FAQ"| P5c_3

    E2 -->|"Delete FAQ"| P5c_4
    P5c_4 -->|"DELETE /faqs/:id"| E3
    E3 -->|"Success/Error"| P5c_4

    P5c_1{{"P5c.1<br/>List FAQs"}}
    P5c_2{{"P5c.2<br/>Create FAQ"}}
    P5c_3{{"P5c.3<br/>Update FAQ"}}
    P5c_4{{"P5c.4<br/>Delete FAQ"}}

    style P5c_1 fill:#ffffff,stroke:#db2777,stroke-width:2px,color:#1e293b
    style P5c_2 fill:#ffffff,stroke:#db2777,stroke-width:2px,color:#1e293b
    style P5c_3 fill:#ffffff,stroke:#db2777,stroke-width:2px,color:#1e293b
    style P5c_4 fill:#ffffff,stroke:#db2777,stroke-width:2px,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

### 5.7 P5d - Admin User Management

```mermaid
graph TB
    E2([fa:fa-user-shield Admin])
    E3[(Backend Server)]

    E2 -->|"Register Form<br/>{username, password, name}"| P5d_1
    P5d_1 -->|"POST /auth/register"| E3
    E3 -->|"New Admin User"| P5d_1
    P5d_1 -->|"Success Confirmation"| E2

    E2 -->|"Change Password Form<br/>{currentPassword, newPassword}"| P5d_2
    P5d_2 -->|"PUT /auth/change-password"| E3
    E3 -->|"Success/Error"| P5d_2
    P5d_2 -->|"Password Updated<br/>Confirmation"| E2

    P5d_1{{"P5d.1<br/>Register<br/>New Admin"}}
    P5d_2{{"P5d.2<br/>Change<br/>Password"}}

    style P5d_1 fill:#ffffff,stroke:#0891b2,stroke-width:2px,color:#1e293b
    style P5d_2 fill:#ffffff,stroke:#0891b2,stroke-width:2px,color:#1e293b
    style E2 fill:#fee2e2,stroke:#dc2626,color:#1e293b
    style E3 fill:#dcfce7,stroke:#16a34a,color:#1e293b
```

---

## 6. Data Dictionary

### 6.1 Menu Item

| Field             | Type          | Description                              |
|-------------------|---------------|------------------------------------------|
| id                | Integer       | Unique identifier                        |
| name              | String        | Item name                                |
| description       | String        | Item description                         |
| price             | Number        | Price in IDR                             |
| price_display     | String        | Formatted price (e.g., "55K")            |
| category_id       | Integer       | Foreign key to Category                  |
| category_name     | String        | Category name (populated by backend)     |
| image_url         | String/null   | Legacy single image URL                  |
| images            | Array         | Up to 4 images [{id, image_url, is_main}]|
| voice_file        | String/null   | Path to MP3 voice file                   |
| voice_description | String/null   | Text for TTS fallback                    |
| tag               | String/null   | Label (e.g., "Best Seller")              |
| is_featured       | Boolean       | Whether item is featured                 |
| unit              | String/null   | Unit of measurement (e.g., "pcs")        |

### 6.2 Category

| Field | Type    | Description        |
|-------|---------|--------------------|
| id    | Integer | Unique identifier  |
| name  | String  | Category name      |

### 6.3 FAQ

| Field    | Type    | Description        |
|----------|---------|--------------------|
| id       | Integer | Unique identifier  |
| question | String  | FAQ question       |
| answer   | String  | FAQ answer         |

### 6.4 Dashboard Statistics

| Field           | Type    | Description                      |
|-----------------|---------|----------------------------------|
| totalItems      | Integer | Total menu items count           |
| totalCategories | Integer | Total categories count           |
| featuredItems   | Integer | Featured menu items count        |
| voiceEnabled    | Integer | Items with voice (MP3 or text)   |

### 6.5 Auth Token (localStorage)

| Key              | Type   | Description                     |
|------------------|--------|---------------------------------|
| authToken        | String | JWT Bearer token                |
| isAuthenticated  | String | "true" or "false"               |
| user             | String | JSON stringified user object    |

---

## 7. API Endpoint Mapping

### Authentication

| Method | Endpoint              | Data Flow Direction | Data                                     |
|--------|-----------------------|---------------------|------------------------------------------|
| POST   | /auth/login           | E2 → E3 → DS6      | {username, password} → {token, user}     |
| POST   | /auth/logout          | E2 → E3             | Token invalidation                       |
| POST   | /auth/register        | E2 → E3 → DS6      | {username, password, name} → {user}      |
| PUT    | /auth/change-password | E2 → E3 → DS6      | {currentPassword, newPassword}           |

### Categories

| Method | Endpoint          | Data Flow Direction | Data                    |
|--------|-------------------|---------------------|-------------------------|
| GET    | /categories       | E3 → DS2 → App     | Category[]              |
| POST   | /categories       | E2 → E3 → DS2      | {name} → Category       |
| DELETE | /categories/:id   | E2 → E3 → DS2      | Deletion confirmation   |

### Menu Items

| Method | Endpoint                       | Data Flow Direction    | Data                          |
|--------|--------------------------------|------------------------|-------------------------------|
| GET    | /menu                          | E3 → DS1 → App        | MenuItem[]                    |
| GET    | /menu/by-category              | E3 → DS1 → App        | {category: MenuItem[]}        |
| GET    | /menu/:id                      | E3 → DS1 → App        | MenuItem (with images)        |
| POST   | /menu                          | E2 → E3 → DS1, DS7    | FormData → MenuItem           |
| PUT    | /menu/:id                      | E2 → E3 → DS1, DS7    | FormData → MenuItem           |
| DELETE | /menu/:id                      | E2 → E3 → DS1, DS7    | Deletion confirmation         |
| POST   | /menu/:id/voice                | E2 → E3 → DS7         | MP3 File → Updated MenuItem   |
| POST   | /menu/:id/images               | E2 → E3 → DS7         | Image File → Updated MenuItem |
| DELETE | /menu/:id/images/:imgId        | E2 → E3 → DS7         | Deletion confirmation         |
| PATCH  | /menu/:id/images/:imgId/main   | E2 → E3 → DS1         | Set main image flag           |

### FAQs

| Method | Endpoint    | Data Flow Direction | Data                  |
|--------|-------------|---------------------|-----------------------|
| GET    | /faqs       | E3 → DS3 → App     | FAQ[]                 |
| POST   | /faqs       | E2 → E3 → DS3      | {question, answer}    |
| PUT    | /faqs/:id   | E2 → E3 → DS3      | {question, answer}    |
| DELETE | /faqs/:id   | E2 → E3 → DS3      | Deletion confirmation |

### Specials

| Method | Endpoint      | Data Flow Direction | Data                  |
|--------|---------------|---------------------|-----------------------|
| GET    | /specials     | E3 → DS5 → App     | Special[]             |
| POST   | /specials     | E2 → E3 → DS5      | Special data          |
| PUT    | /specials/:id | E2 → E3 → DS5      | Special data          |
| DELETE | /specials/:id | E2 → E3 → DS5      | Deletion confirmation |

### Gallery

| Method | Endpoint      | Data Flow Direction | Data                  |
|--------|---------------|---------------------|-----------------------|
| GET    | /gallery      | E3 → DS4 → App     | GalleryItem[]         |
| POST   | /gallery      | E2 → E3 → DS4, DS7 | FormData              |
| PUT    | /gallery/:id  | E2 → E3 → DS4, DS7 | FormData              |
| DELETE | /gallery/:id  | E2 → E3 → DS4, DS7 | Deletion confirmation |

### Statistics

| Method | Endpoint | Data Flow Direction | Data             |
|--------|----------|---------------------|------------------|
| GET    | /stats   | E3 → DS1, DS2 → App| DashboardStats   |

---

## 8. Summary of All Data Flows

### Customer (Public) Flows

| #  | Flow                         | Source | Process               | Destination |
|----|------------------------------|--------|-----------------------|-------------|
| 1  | Browse Homepage              | E1     | P1 → P2 → E3         | E1          |
| 2  | Filter Menu by Category      | E1     | P1.3 (client-side)    | E1          |
| 3  | Filter Menu by Featured      | E1     | P1.3 (client-side)    | E1          |
| 4  | Paginate Menu Items          | E1     | P1.4 (client-side)    | E1          |
| 5  | View Menu Item Detail        | E1     | P4.1 → E3            | E1          |
| 6  | Browse Image Carousel        | E1     | P4.2 (client-side)    | E1          |
| 7  | Play Voice Description       | E1     | P4.3 → E3 (MP3/TTS)  | E1          |
| 8  | View Related Items           | E1     | P4.4 → E3            | E1          |
| 9  | Expand/Collapse FAQ          | E1     | P1.5 (client-side)    | E1          |
| 10 | Browse Gallery               | E1     | P1.6 (client-side)    | E1          |
| 11 | View Fullscreen Gallery Image| E1     | P1.6 (client-side)    | E1          |

### Admin Flows

| #  | Flow                        | Source | Process               | Destination |
|----|-----------------------------|--------|-----------------------|-------------|
| 12 | Login                       | E2     | P3.1 → E3 → P3.2     | DS8         |
| 13 | Route Protection Check      | DS8    | P3.3                  | E2          |
| 14 | Logout                      | E2     | P3.4 → E3            | DS8         |
| 15 | View Dashboard Stats        | E2     | P5 → E3              | E2          |
| 16 | List Menu Items             | E2     | P5a.1 → E3           | E2          |
| 17 | Search/Filter Menu Items    | E2     | P5a.1 (client-side)   | E2          |
| 18 | Create Menu Item            | E2     | P5a.2 → E3 → DS1     | E2          |
| 19 | Upload Item Images          | E2     | P5a.3 → E3 → DS7     | E2          |
| 20 | Update Menu Item            | E2     | P5a.4 → E3 → DS1     | E2          |
| 21 | Delete Menu Item            | E2     | P5a.5 → E3 → DS1     | E2          |
| 22 | Upload Voice File           | E2     | P5a.6 → E3 → DS7     | E2          |
| 23 | List Categories             | E2     | P5b.1 → E3 → DS2     | E2          |
| 24 | Create Category             | E2     | P5b.2 → E3 → DS2     | E2          |
| 25 | Delete Category             | E2     | P5b.3 → E3 → DS2     | E2          |
| 26 | List FAQs                   | E2     | P5c.1 → E3 → DS3     | E2          |
| 27 | Create FAQ                  | E2     | P5c.2 → E3 → DS3     | E2          |
| 28 | Update FAQ                  | E2     | P5c.3 → E3 → DS3     | E2          |
| 29 | Delete FAQ                  | E2     | P5c.4 → E3 → DS3     | E2          |
| 30 | Register New Admin          | E2     | P5d.1 → E3 → DS6     | E2          |
| 31 | Change Password             | E2     | P5d.2 → E3 → DS6     | E2          |

---

*Document generated for Zelan Bakery & Cake web application.*
