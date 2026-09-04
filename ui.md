# 🎨 Stack Plus Studio — UI Design System

> **Single Source of Truth untuk seluruh UI/UX Stack Plus Studio.**

Semua UI wajib mengikuti dokumen ini agar seluruh product memiliki visual language yang konsisten.

---

## 1. 🎯 Visual Identity

Stack Plus harus terasa:

* Modern
* Professional
* Technology-driven
* Minimal
* Clean
* Premium
* Friendly
* Confident

Gunakan kombinasi:

```text
Minimalism
+ Glassmorphism
+ Modern SaaS UI
+ Clean Typography
+ Strong Blue Accent
+ Soft Neutral Background
+ Rounded Components
```

Hindari:

* UI terlalu ramai
* Terlalu banyak warna/gradient
* Terlalu banyak shadow/border
* Terlalu playful atau terlalu corporate
* Excessive glassmorphism
* Excessive animation

Prioritas:

```text
Usability
> Readability
> Hierarchy
> Consistency
> Aesthetic
```

---

## 2. 🎨 Color

### Primary

```text
Primary Blue: #0053FF
Navy:         #00232C
Background:   #FBFBF3
White:        #FFFFFF
```

Primary Blue digunakan untuk:

* Primary button
* Active navigation
* Link
* Accent
* CTA
* Selected/focus state
* Highlight

### Semantic

```text
Success: #16A34A
Warning: #F59E0B
Error:   #DC2626
Info:    #2563EB
```

Jangan menggunakan warna secara random atau hanya sebagai dekorasi.

---

## 3. 🖋️ Typography

Gunakan:

```text
Font: Inter
```

Hierarchy:

```text
Display: 64px / 700
H1:      48px / 700
H2:      40px / 700
H3:      28px / 700
H4:      22px / 650
Body:    16px / 400
Small:   14px / 400
Caption: 12px / 500
```

Mobile heading harus disesuaikan agar tetap nyaman dibaca.

Gunakan Primary Blue secara selektif pada bagian heading yang ingin ditonjolkan.

Jangan menggunakan font decorative sebagai typography utama.

---

## 4. 📐 Spacing & Layout

Gunakan spacing berbasis 4:

```text
4  8  12  16  20  24  32
40 48 56 64 80 96 120px
```

### Container

```text
Max width: 1280px
Desktop padding: 24px
Tablet padding: 32px
Mobile padding: 20px
```

### Section

```text
Desktop: 96px
Tablet:  72px
Mobile:  56px
```

Gunakan whitespace yang cukup dan jangan membuat layout terlalu padat.

---

## 5. 🧊 Glassmorphism

Glassmorphism adalah karakter utama Stack Plus, tetapi harus **subtle dan professional**.

Standard glass:

```css
background: rgba(255,255,255,0.60);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.55);
```

Strong glass:

```css
background: rgba(255,255,255,0.72);
backdrop-filter: blur(24px);
border: 1px solid rgba(255,255,255,0.65);
```

Gunakan glass terutama pada:

* Navbar
* Card
* Floating UI
* Modal
* CTA
* Highlight

Jangan membuat semua elemen transparan.

Hindari:

```text
Heavy blur
Extreme transparency
Rainbow gradient
Excessive glow
```

---

## 6. 🔲 Radius

Gunakan radius yang konsisten:

```text
Small:     10px
Medium:    14px
Card:      20px
Large:     24px
Hero:      28px
Pill:      9999px
```

Aturan utama:

```text
Button → 9999px
Card   → 20px
Modal  → 24px
Input  → 12–14px
```

Jangan menggunakan radius 9999px untuk semua component.

---

## 7. 🌫️ Shadow

Gunakan soft shadow:

```css
Small:
0 4px 12px rgba(0,35,44,0.05);

Medium:
0 10px 30px rgba(0,35,44,0.08);

Large:
0 20px 50px rgba(0,35,44,0.10);
```

Shadow harus terasa soft, airy, dan premium.

---

## 8. 🔘 Button

Jenis utama:

```text
Primary
Secondary
Dark
Ghost
```

### Primary

```text
Background: #0053FF
Text:       #FFFFFF
Radius:     9999px
Height:     44–48px
Padding:    20–24px
```

### Dark

```text
Background: #101010
Text:       #FFFFFF
Radius:     9999px
```

### Ghost

```text
Background: transparent
Text:       #0053FF
```

Button interaction:

```text
Duration: 200ms
Hover: translateY(-1px)
Focus: Primary Blue ring
```

Gunakan icon dengan jarak sekitar `8px`.

---

## 9. 🧩 Icon

Gunakan icon yang:

* Minimal
* Outline
* Geometric
* Consistent

Recommended:

```text
Lucide Icons
```

Hindari:

* Random icon styles
* 3D icons
* Emoji sebagai UI icon utama

---

## 10. 📝 Form

Input:

```text
Height: 48–52px
Radius: 12–14px
Padding: 16px
Border: 1px
```

Label:

```text
14px
Weight: 600
```

Jarak label → input:

```text
8px
```

Focus menggunakan Primary Blue.

---

## 11. 🧱 Component System

Gunakan hierarchy:

```text
Primitive
 ↓
Component
 ↓
Section
 ↓
Page
```

### Primitive

```text
Button
Input
Label
Badge
Icon
Avatar
Divider
Typography
```

### Core

```text
Navbar
Card
GlassCard
Modal
Dropdown
Toast
Tabs
Accordion
Form
Footer
```

### Section

```text
Hero
Services
Portfolio
Testimonials
About
Pricing
FAQ
CTA
Contact
Footer
```

Jangan membuat component baru jika component existing dapat digunakan kembali.

---

## 12. 🖥️ Page Layout

Struktur umum:

```text
Navbar
 ↓
Hero / Page Intro
 ↓
Content Sections
 ↓
Card / Grid
 ↓
CTA
 ↓
Footer
```

Hero umumnya:

```text
Label
+
Heading
+
Description
+
CTA
+
Visual
```

Setiap halaman harus memiliki hierarchy yang jelas dan **satu CTA utama**.

---

## 13. 📱 Responsive

Gunakan mobile-first.

```text
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

Grid:

```text
Desktop → 3 columns
Tablet  → 2 columns
Mobile  → 1 column
```

Navigation desktop berubah menjadi mobile navigation.

Jika terdapat konflik:

```text
Mobile Usability > Desktop Decoration
```

Tidak boleh ada horizontal overflow.

---

## 14. 🎞️ Animation

Animation harus:

* Fast
* Subtle
* Professional
* Purposeful

Default:

```text
200ms
```

Contoh:

```text
Card  → translateY(-4px)
Image → scale(1.03)
Button → translateY(-1px)
Modal → opacity + scale
```

Hindari:

* Infinite floating berlebihan
* Spinning UI
* Excessive bouncing
* Large parallax
* Dramatic animation

---

## 15. ♿ Accessibility

Pastikan:

* Contrast cukup
* Keyboard navigation bekerja
* Focus state terlihat
* Form memiliki label
* Image memiliki alt text
* Icon-only button memiliki accessible label
* Warna bukan satu-satunya indikator status
* Touch target minimal `44px × 44px`

---

## 16. 🌙 Dark Mode

Dark mode diperbolehkan untuk product interface.

```text
Background: #071F26
Secondary:  #0B2A33
Glass:      rgba(255,255,255,0.06)
Border:     rgba(255,255,255,0.10)
Primary:    #0053FF
Heading:    #FFFFFF
Body:       #D5E0E3
Secondary:  #91A5AA
```

Tetap pertahankan identitas Stack Plus.

---

## 17. 🎨 Design Tokens

Gunakan token terpusat:

```css
:root {
  --sp-primary: #0053FF;
  --sp-primary-hover: #0047D9;

  --sp-navy: #00232C;
  --sp-background: #FBFBF3;
  --sp-surface: #FFFFFF;

  --sp-radius-sm: 10px;
  --sp-radius-md: 14px;
  --sp-radius-lg: 20px;
  --sp-radius-xl: 24px;
  --sp-radius-2xl: 28px;
  --sp-radius-full: 9999px;
}
```

Gunakan token dan component existing daripada membuat style baru.

---

## 18. 🤖 AI UI Rules

Jika menggunakan AI untuk membuat UI:

1. Baca `ui.md` terlebih dahulu.
2. Gunakan design system yang sudah tersedia.
3. Jangan membuat visual language baru.
4. Jangan membuat warna baru.
5. Jangan membuat font baru.
6. Jangan membuat radius system baru.
7. Jangan membuat button/card/navbar style baru tanpa kebutuhan.
8. Reuse existing component dan token.
9. Prioritaskan usability, accessibility, consistency, dan performance.

Core visual:

```text
#0053FF
+
#00232C
+
#FBFBF3
+
Inter
+
Glassmorphism
+
Rounded Components
+
Soft Shadows
+
Generous Whitespace
+
Minimal Motion
```

---

## 19. 🚫 Anti-Pattern

Jangan membuat UI dengan:

```text
Random Gradient
Random Fonts
Excessive Shadow
Excessive Glass
Excessive Radius
Excessive Animation
Random Colors
Inconsistent Components
```

Stack Plus harus tetap:

```text
Blue
+
Navy
+
Warm White
+
Glass
+
Rounded
+
Minimal
+
Professional
```

---

## 20. 🏆 Golden Rule

Jika tidak yakin bagaimana membuat sebuah component:

```text
JANGAN MEMBUAT STYLE BARU.
```

Cari component/pattern yang paling mirip dan gunakan:

```text
Existing Token
+
Existing Component
+
Existing Pattern
```

`ui.md` adalah **Single Source of Truth** untuk UI Stack Plus. Jika terdapat perbedaan dengan implementation lain, gunakan `ui.md` sebagai referensi utama.

> **Build once. Design consistently. Reuse everywhere.**

```text
One Company.
One Design Language.
One UI System.
```
