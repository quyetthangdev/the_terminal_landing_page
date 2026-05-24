# The Terminal — Landing Page Design Spec

**Date:** 2026-05-24  
**Brand:** The Terminal — Cafe & European Kitchen  
**Stack:** Vite + React SPA, TailwindCSS v3, ShadcnUI, Three.js (@react-three/fiber + @react-three/drei)

---

## 1. Overview

A single-page landing site for The Terminal cafe. Users scroll through sections: Hero → About → Menu → Reservation → Gallery → Location → Footer. Navigation is sticky and links scroll to each section. The site is fully responsive (mobile-first).

---

## 2. Visual Identity

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `gold` | `#CFA93F` | Primary accent, CTAs, highlights, borders |
| `gold-dark` | `#7B3F00` | Deep accent, gradient stops |
| `dark` | `#1a1a1a` | Text, dark section backgrounds |
| `darker` | `#0d0d0d` | Hero canvas background, footer |
| `surface` | `#fdfaf5` | Warm off-white section backgrounds |
| `white` | `#ffffff` | Card backgrounds |

### Typography
- **Display/Headings:** Playfair Display (Google Fonts) — serif, letter-spacing wide
- **Body/UI:** Inter — sans-serif, clean

### Design Language
- Simple, elegant, clean — minimalist with gold accents
- Dark hero + alternating light/dark sections for rhythm
- Thin gold borders, uppercase letter-spacing labels
- Subtle hover states: gold border flash, opacity shift

---

## 3. Project Structure

```
the-terminal-landing/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Sticky, transparent→solid on scroll
│   │   │   └── Footer.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx     # Three.js canvas + overlay text
│   │   │   ├── AboutSection.tsx
│   │   │   ├── MenuSection.tsx
│   │   │   ├── ReservationSection.tsx
│   │   │   ├── GallerySection.tsx
│   │   │   └── LocationSection.tsx
│   │   ├── three/
│   │   │   └── TrainScene.tsx      # Three.js steam train scene
│   │   └── ui/                     # ShadcnUI components (Button, Input, etc.)
│   ├── data/
│   │   └── menu.ts                 # Menu items data (placeholder)
│   ├── hooks/
│   │   └── useScrollAnimation.ts   # Intersection Observer for fade-in
│   ├── lib/
│   │   └── utils.ts                # cn() helper (ShadcnUI standard)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Tailwind directives + Google Fonts import
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 4. Sections

### 4.1 Navbar
- Fixed top, full width
- Transparent with gold text on Hero → solid `#0d0d0d` background after scrolling 80px
- Logo: "THE TERMINAL" in Playfair Display, gold
- Links: GIỚI THIỆU · MENU · ĐẶT BÀN · LIÊN HỆ — scroll to section ID
- Mobile: hamburger menu (ShadcnUI Sheet component), slides in from right
- Transition: smooth CSS `transition` on background and shadow

### 4.2 Hero Section
- Full viewport height (`h-screen`), dark background `#0d0d0d`
- **Three.js Canvas** fills the entire section as absolute background layer:
  - Steam train model built from Three.js geometries (BoxGeometry, CylinderGeometry)
  - Train enters from right, moves left across screen, loops
  - Smoke: 3–5 particle spheres emitted from chimney, rise and fade out
  - Gold track line (`LineSegments`) spans the bottom
  - Floating gold particles (~200 points, `BufferGeometry`) drift slowly
  - Camera: orthographic or perspective fixed, no user interaction
- **Overlay content** (absolute center, z-index above canvas):
  - Circular badge with "EST. 2024" + thin gold border
  - "THE TERMINAL" — Playfair Display, 64px desktop / 36px mobile, white, letter-spacing 8px
  - "CAFE & EUROPEAN KITCHEN" — Inter, gold, letter-spacing 6px
  - Two CTAs: `[XEM MENU]` (gold filled) · `[ĐẶT BÀN]` (gold outline)
- Scroll indicator: thin animated line pulsing downward at bottom center

### 4.3 About Section
- Background: `#ffffff`
- Two-column layout desktop (image left, text right) → stacked mobile
- Image: Unsplash photo of cafe interior (warm, industrial tones) in a rounded box with gold border
- Text block:
  - Gold label: "CÂU CHUYỆN CỦA CHÚNG TÔI"
  - Gold decorative line (40px)
  - Heading: "Điểm dừng chân giữa lòng thành phố"
  - Body: 2 paragraphs about brand story (inspiration from steam trains, 2024 founding, European kitchen concept)
  - Subtle stats row: "Est. 2024 · 3 Tầng · 120 Chỗ ngồi · 50+ Món ăn"
- Fade-in animation on scroll (Intersection Observer)

### 4.4 Menu Section
- Background: `#fdfaf5` (warm off-white)
- Section heading: "THỰC ĐƠN" centered, Playfair Display
- Tab filter bar (ShadcnUI Tabs):
  - Categories: THỨC UỐNG · ĂN SÁNG · MÓN CHÍNH · TRÁNG MIỆNG
  - Active tab: gold background, dark text
  - Inactive: transparent, border
- Menu grid: 2 columns desktop / 1 column mobile
- Each menu card:
  - Unsplash food/drink photo (lazy-loaded, `loading="lazy"`)
  - Name, short description, price in VND
  - Hover: gold border, subtle shadow lift
- Placeholder data (8–10 items per category) — see Section 7

### 4.5 Reservation Section
- Background: `#1a1a1a` (dark, contrasts with adjacent light sections)
- Centered content, max-width 640px
- Heading: "ĐẶT BÀN TRƯỚC" — white, Playfair Display
- Subtext: gold, italic
- Form fields (ShadcnUI Input, Select, Textarea):
  - Họ & tên (text, required)
  - Số điện thoại (tel, required)
  - Ngày (date picker, required)
  - Giờ (select: 7:00–22:00 in 30-min slots, required)
  - Số người (select: 1–20, required)
  - Dịp đặc biệt (select: Sinh nhật / Kỷ niệm / Hội họp / Khác, optional)
  - Ghi chú thêm (textarea, optional)
- Submit button: full-width, gold background, "GỬI YÊU CẦU ĐẶT BÀN"
- On submit: show success toast (ShadcnUI Toast) — "Cảm ơn! Chúng tôi sẽ liên hệ trong 30 phút." No backend integration.
- Input focus: gold ring/border highlight
- Dark input backgrounds: `#262626`, border `#333`

### 4.6 Gallery Section
- Background: `#ffffff`
- Section heading: "KHÔNG GIAN" centered
- Masonry-style grid using CSS Grid:
  - Desktop: 3 columns, rows vary (large feature image + smaller ones)
  - Mobile: 2 columns
- 6–8 Unsplash images: cafe interior, coffee detail, food plating, industrial decor
- Hover: slight zoom (`scale-105`), overlay with gold tint
- Click: lightbox modal (custom or ShadcnUI Dialog) — fullscreen image, prev/next nav

### 4.7 Location Section
- Background: `#f5f2ec`
- Two-column layout: Google Maps iframe (left) + info block (right)
- Info block:
  - Heading: "TÌM CHÚNG TÔI"
  - Address: with MapPin icon (lucide-react)
  - Hours: Mon–Fri 7:00–22:00 / Sat–Sun 7:00–23:00 (Clock icon)
  - Phone: 0900 123 456 (Phone icon)
  - Email: hello@theterminal.vn (Mail icon)
- Google Maps: iframe embed, placeholder URL (owner to update with real coordinates)
- Mobile: stacked, map first

### 4.8 Footer
- Background: `#0d0d0d`
- 3-column grid: Logo/tagline · Nav links · Social
- Logo: "THE TERMINAL" gold
- Tagline: "CAFE & EUROPEAN KITCHEN" — muted
- Nav links: repeat main sections
- Social icons: Facebook, Instagram, TikTok (lucide-react or simple SVG)
- Bottom bar: "© 2024 The Terminal. All rights reserved." centered, muted

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Key changes |
|---|---|---|
| `sm` | 640px | Single column layouts, hamburger nav |
| `md` | 768px | Two-column About, Gallery 2-col |
| `lg` | 1024px | Full desktop layout |
| `xl` | 1280px | Max content width, wider spacing |

---

## 6. Three.js — Train Scene Detail

**File:** `src/components/three/TrainScene.tsx`  
**Library:** `@react-three/fiber`, `@react-three/drei`

### Scene composition
- **Camera:** Perspective, fixed position, no controls
- **Lighting:** AmbientLight (warm white, low intensity) + DirectionalLight from top-right (casts shadow on train body) + PointLight gold color near locomotive
- **Background:** Transparent (CSS handles bg color)

### Train model (procedural geometry)
- **Locomotive body:** BoxGeometry, dark gray metallic material (`MeshStandardMaterial`, color `#2a2a2a`, metalness 0.8, roughness 0.3)
- **Chimney:** CylinderGeometry on top-front of body
- **Wheels:** CylinderGeometry rotated 90°, gold material (`#CFA93F`, metalness 0.9)
- **Cab window:** BoxGeometry cutout / small plane with emissive warm orange
- **Animation:** Train translates from `x = +8` to `x = -8` over ~12 seconds, then resets. Wheels rotate proportionally.

### Smoke system
- 5 `SphereGeometry` particles emitted from chimney top
- Each sphere: starts small at chimney exit, grows, drifts slightly left and up, fades opacity 1→0
- Uses `useFrame` loop to update positions and opacity per frame
- Soft white material (`#cccccc`, transparent, opacity animated)

### Track
- `LineSegments` spanning full scene width at y = -1.2
- Gold color `#CFA93F`, slight emissive glow

### Gold particles
- `BufferGeometry` with ~300 random points within scene bounds
- `PointsMaterial`, color `#CFA93F`, size 0.02, transparent
- Drift slowly upward, reset when they reach top — continuous ambient shimmer

---

## 7. Menu Placeholder Data

### Thức uống (Drinks)
| Name | Description | Price |
|---|---|---|
| Terminal Espresso | Espresso đặc biệt, crema vàng kim | 45.000đ |
| Signature Latte | Sữa tươi nguyên kem, vanilla, caramel | 65.000đ |
| Cold Brew Tonic | Cold brew ngâm 24h, tonic, nước hoa hồng | 70.000đ |
| Matcha Zen | Matcha Nhật Bản, oat milk, foam latte | 75.000đ |
| Terminal Black | Phin truyền thống, đá viên | 35.000đ |
| Cacao Belge | Cacao Bỉ nguyên chất, sữa nóng | 65.000đ |

### Ăn sáng (Breakfast)
| Name | Description | Price |
|---|---|---|
| Eggs Benedict | Trứng chần, bacon, hollandaise sauce, bánh mì Anh | 95.000đ |
| Croque Monsieur | Bánh mì nướng, jambon, phô mai Gruyère | 85.000đ |
| Avocado Toast | Bánh mì sourdough, bơ nghiền, trứng luộc, hạt | 75.000đ |
| French Toast | Bánh brioche ngâm trứng, maple syrup, berries | 80.000đ |

### Món chính (Mains)
| Name | Description | Price |
|---|---|---|
| Pasta Carbonara | Pasta tươi, guanciale, pecorino, lòng đỏ trứng | 145.000đ |
| Beef Bourguignon | Thịt bò hầm rượu vang đỏ, khoai tây, cà rốt | 185.000đ |
| Salmon à la Plancha | Cá hồi áp chảo, risotto nấm, sốt chanh bơ | 195.000đ |
| Croque Madame | Bánh mì nướng, jambon, trứng ốp la, bechamel | 95.000đ |

### Tráng miệng (Desserts)
| Name | Description | Price |
|---|---|---|
| Crème Brûlée | Kem trứng vanilla, lớp caramel giòn | 65.000đ |
| Tiramisu | Mascarpone, espresso, lady fingers | 75.000đ |
| Tarte Tatin | Bánh táo lật ngược, kem tươi | 70.000đ |
| Profiteroles | Bánh su kem, sốt socola | 60.000đ |

---

## 8. Dependencies

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "three": "^0.165",
    "@react-three/fiber": "^8",
    "@react-three/drei": "^9",
    "lucide-react": "^0.400",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

ShadcnUI components used: Button, Input, Select, Textarea, Tabs, Dialog, Sheet, Toast, Separator.

---

## 9. Animations & Interactions

| Element | Animation |
|---|---|
| Navbar | background transition on scroll (CSS transition) |
| All sections | fade-in + slide-up on scroll (Intersection Observer) |
| Menu cards | hover: border-gold, shadow lift (CSS transition) |
| Gallery images | hover: scale-105, gold overlay (CSS transition) |
| CTA buttons | hover: brightness-110, scale-102 |
| Train | continuous left-to-right loop (Three.js useFrame) |
| Smoke particles | rise + fade loop (Three.js useFrame) |
| Gold particles | drift upward, reset loop (Three.js useFrame) |

---

## 10. Out of Scope

- Backend / API for reservation form
- User authentication
- CMS for menu management
- Online payment
- Multi-language support
- SEO / SSR (Vite SPA, no SSR)
