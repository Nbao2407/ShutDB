# Fluent Design System - Service Database Dashboard

## Tổng quan

Hệ thống thiết kế Fluent Design đầy đủ lấy cảm hứng từ Microsoft Fluent Design và FluentTerminal, áp dụng cho Service Database Dashboard.

---

## 1. Color Palette

### Dark Theme (Primary)

#### Background & Surfaces
- **Primary Background**: `rgba(32, 32, 32, 0.75)` - Acrylic material chính
- **Secondary Background**: `rgba(42, 42, 42, 0.85)` - Cards và containers
- **Tertiary Background**: `rgba(52, 52, 52, 0.7)` - Elevated elements
- **Header Background**: `rgba(28, 28, 28, 0.9)` - Title bar và tab bar

#### Text Colors
- **Primary Text**: `#ffffff` - Headings và labels quan trọng
- **Secondary Text**: `#cccccc` - Body text
- **Tertiary Text**: `#999999` - Captions và disabled text
- **Disabled Text**: `#656565` - Completely disabled elements

#### Accent Colors
- **Primary Accent**: `#0078d4` (Windows 11 Blue)
- **Accent Hover**: `#1082da`
- **Accent Pressed**: `#005a9e`
- **Alternative Accent**: `#8b5cf6` (Purple, customizable)

#### Status Colors
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)

### Light Theme
- **Primary Background**: `rgba(243, 243, 243, 0.75)`
- **Primary Text**: `#000000`
- **Border**: `rgba(0, 0, 0, 0.08)`

---

## 2. Typography System

### Font Families
```css
--fluent-font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
--fluent-font-mono: 'Cascadia Code', 'Cascadia Mono', 'Consolas', monospace;
```

### Font Sizes
- **Extra Small**: 11px (Tooltips, captions)
- **Small**: 12px (Tabs, badges)
- **Base**: 14px (Body text)
- **Large**: 16px (Subheadings)
- **Extra Large**: 20px (Headings)
- **2XL**: 24px (Page titles)

### Font Weights
- **Normal**: 400
- **Medium**: 500 (Buttons, tabs)
- **Semibold**: 600 (Headings)
- **Bold**: 700 (Emphasis)

---

## 3. Fluent Design Principles Implemented

### A. Acrylic Material
**Mô tả**: Background mờ trong suốt với blur effect

**Implementation**:
```css
background: rgba(32, 32, 32, 0.75);
backdrop-filter: blur(40px) saturate(180%);
-webkit-backdrop-filter: blur(40px) saturate(180%);
```

**Blur Levels**:
- Subtle: 20px (Cards)
- Background: 40px (Main surfaces)
- Strong: 60px (Modals, overlays)

**Ứng dụng**:
- Title bar
- Tab bar
- Service group cards
- Context menus

### B. Reveal Highlight
**Mô tả**: Hiệu ứng ánh sáng subtle khi hover theo con trỏ chuột

**Implementation**:
```css
.fluent-reveal::before {
  background: radial-gradient(
    circle 200px at var(--mouse-x) var(--mouse-y),
    rgba(255, 255, 255, 0.25) 0%,
    transparent 100%
  );
}
```

**Ứng dụng**:
- Tabs
- Service rows
- Buttons
- Interactive cards

### C. Depth & Layering
**Shadow System**:
- **Flyout**: `0 8px 32px rgba(0, 0, 0, 0.56)` - Menus, dropdowns
- **Popup**: `0 4px 24px rgba(0, 0, 0, 0.48)` - Tooltips, elevated cards
- **Card**: `0 2px 16px rgba(0, 0, 0, 0.32)` - Standard cards
- **Subtle**: `0 1px 4px rgba(0, 0, 0, 0.24)` - Slight elevation

**Z-index Hierarchy**:
```
Base: 0
Elevated: 1
Dropdown: 1000
Sticky: 1100
Overlay: 1300
Modal: 1400
Toast: 1500
Tooltip: 1600
```

### D. Motion & Animation
**Timing Functions**:
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` - Most transitions
- **Decelerate**: `cubic-bezier(0, 0, 0.2, 1)` - Entering animations
- **Accelerate**: `cubic-bezier(0.4, 0, 1, 1)` - Exiting animations

**Duration**:
- **Fast**: 150ms (Hover states)
- **Normal**: 250ms (Standard transitions)
- **Slow**: 350ms (Complex animations)

**Key Animations**:
```css
/* Fade In */
@keyframes fluent-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale In */
@keyframes fluent-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Spin (Loading) */
@keyframes fluent-spin {
  to { transform: rotate(360deg); }
}
```

---

## 4. Component Library

### A. Fluent Title Bar
**Đặc điểm**:
- Height: 32px
- Acrylic background với blur
- Drag region cho window controls
- Windows 11 style minimize/maximize/close buttons

**Features**:
- App icon và title
- Window control buttons với hover effects
- Close button có màu đỏ (#e81123) khi hover

### B. Fluent Tab Bar
**Đặc điểm**:
- Height: 40px
- Tab width: 160px - 240px
- Active tab có accent underline
- Reveal highlight on hover

**Features**:
- Tab icons
- Close button (hiện khi hover)
- New tab button
- Overflow scroll support

### C. Fluent Button
**Variants**:
1. **Default**: Transparent background, border
2. **Accent**: Blue background, no border
3. **Ghost**: No background, no border

**States**:
- Default
- Hover (elevated background)
- Active (scale 0.98)
- Disabled (opacity 0.4)

### D. Fluent Card
**Đặc điểm**:
- Acrylic background
- Subtle border
- Shadow elevation
- Hover lift effect

### E. Fluent Input
**Features**:
- Accent border on focus
- Outline glow effect
- Placeholder styling

### F. Fluent Scrollbar
**Design**:
- Width: 12px
- Transparent track
- Semi-transparent thumb
- Rounded thumb với padding
- Hover brightening effect

---

## 5. Layout Structure

### Main App Layout
```
┌─────────────────────────────────────┐
│     Title Bar (32px)                │ ← Acrylic header
├─────────────────────────────────────┤
│     Tab Bar (40px)                  │ ← Tabs với reveal
├─────────────────────────────────────┤
│                                     │
│     Content Area                    │ ← Scrollable
│     (Flexible height)               │
│                                     │
└─────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1400px

---

## 6. Interaction Patterns

### Hover States
- **Buttons**: Background lightens, subtle elevation
- **Tabs**: Background tint, reveal highlight
- **Cards**: Border brightens, shadow increases, lift up
- **Rows**: Slide right, accent border, reveal effect

### Focus States
- **Outline**: 2px solid accent color
- **Offset**: 2px
- **Glow**: Box-shadow với accent color

### Loading States
- **Spinner**: Rotating border với accent top
- **Duration**: 800ms linear infinite
- **Size**: 20px standard

---

## 7. Accessibility Features

### WCAG Compliance
- **Contrast Ratio**: Minimum 4.5:1 cho text
- **Focus Indicators**: Visible outlines
- **Keyboard Navigation**: Tab order logical
- **Screen Reader**: Proper ARIA labels

### Keyboard Shortcuts
- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Escape**: Close modals/menus
- **Arrow Keys**: Navigate tabs/lists

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
```

---

## 8. Technical Considerations

### Performance
- **Backdrop-filter**: GPU-accelerated, kiểm tra browser support
- **Animations**: Sử dụng `transform` và `opacity` (hardware-accelerated)
- **Blur Radius**: Limit ở 40-60px để tránh performance issues

### Browser Compatibility
- **Modern browsers**: Chrome 76+, Edge 79+, Safari 9+
- **Fallback**: Solid backgrounds khi không support backdrop-filter
- **Prefix**: `-webkit-backdrop-filter` cho Safari

### Customization Options
Tất cả variables có thể customize:
```css
:root {
  --acrylic-opacity: 0.75;
  --blur-background: 40px;
  --fluent-accent: #0078d4;
  /* ... */
}
```

**Theme Switching**:
```html
<body data-theme="light">  <!-- hoặc "dark", "high-contrast" -->
```

---

## 9. File Structure

```
frontend/
├── src/
│   ├── styles/
│   │   ├── fluent-variables.css     ← CSS variables
│   │   └── fluent-components.css    ← Component styles
│   ├── components/
│   │   ├── FluentTitleBar.tsx       ← Title bar component
│   │   ├── FluentTitleBar.module.css
│   │   ├── FluentTabBar.tsx         ← Tab bar component
│   │   └── FluentTabBar.module.css
│   └── App.tsx                      ← Main app với Fluent layout
```

---

## 10. Usage Examples

### Basic Button
```tsx
<button className="fluent-button">
  Click Me
</button>

<button className="fluent-button fluent-button-accent">
  Primary Action
</button>
```

### Card with Reveal
```tsx
<div className="fluent-card fluent-reveal">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

### Tab Bar
```tsx
<FluentTabBar
  tabs={[
    { id: '1', title: 'Services', icon: '🛠️' },
    { id: '2', title: 'Databases', icon: '🗄️' }
  ]}
  activeTabId="1"
  onTabChange={(id) => console.log(id)}
/>
```

---

## 11. Design Decisions

### Tại sao chọn Fluent Design?
1. **Modern & Professional**: Phù hợp với Windows environment
2. **Familiar UX**: Users quen thuộc với Windows UI patterns
3. **Depth & Materiality**: Acrylic tạo cảm giác premium
4. **Performance**: Hardware-accelerated effects
5. **Accessibility**: Built-in focus states và ARIA support

### Tại sao Acrylic Material?
- **Visual Depth**: Tạo hierarchy rõ ràng
- **Context Awareness**: Cho phép nhìn xuyên qua layers
- **Modern Aesthetic**: Trendy và sophisticated
- **Windows Integration**: Match với OS design language

### Tại sao Reveal Highlight?
- **Discoverability**: Giúp users tìm interactive elements
- **Engagement**: Tạo cảm giác responsive và alive
- **Subtle Feedback**: Không overwhelming
- **Premium Feel**: Adds polish và attention to detail

---

## 12. Future Enhancements

- [ ] Theme customizer UI
- [ ] More accent color options
- [ ] Command palette (Ctrl+Shift+P)
- [ ] Context menu implementation
- [ ] Fluent icons integration
- [ ] Dark/Light theme toggle
- [ ] Animation preferences panel
- [ ] Custom blur intensity slider

---

## Kết luận

Hệ thống Fluent Design này cung cấp:
✅ **Comprehensive design system** với variables và components
✅ **Acrylic material effects** với backdrop-filter
✅ **Reveal highlight** trên interactive elements
✅ **Tab system** inspired by FluentTerminal
✅ **Windows 11 window controls**
✅ **Full accessibility support**
✅ **Performance optimized**
✅ **Customizable themes**

Tất cả components tuân theo Fluent Design principles và tích hợp seamlessly với existing Service Dashboard.
