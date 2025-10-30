# Modern Dark Mode UI Update

## Tổng Quan

Đã cập nhật toàn bộ giao diện ShutDB theo phong cách **Modern Dark Mode** giống Microsoft Outlook, VS Code, và Windows 11.

---

## 🎨 Màu Sắc (Color Scheme)

### Màu Nền (Background Colors)
- **Primary Background**: `#1e1e1e` - Màu nền chính (xám đen đậm)
- **Secondary Background**: `#252526` - Màu nền sidebar/panel (xám đen vừa)
- **Tertiary Background**: `#2d2d30` - Màu nền elevated/card
- **Hover State**: `#2a2d2e` - Màu khi hover

### Màu Chữ (Text Colors)
- **Primary Text**: `#ffffff` - Chữ chính màu trắng
- **Secondary Text**: `#cccccc` - Chữ phụ màu xám nhạt
- **Tertiary Text**: `#9d9d9d` - Chữ tertiary màu xám vừa
- **Disabled Text**: `#6e6e6e` - Chữ bị disable

### Màu Accent (Highlight Colors)
- **Primary Accent**: `#0078d4` - **Xanh dương** cho mục được chọn
- **Hover**: `#1a86d9` - Xanh dương sáng hơn khi hover
- **Star/Important**: `#fbbf24` - **Vàng** cho đánh dấu quan trọng
- **Alert/Error**: `#dc2626` - **Đỏ** cho cảnh báo

### Màu Trạng Thái (Status Colors)
- **Running**: `#10b981` - Xanh lá cho service đang chạy
- **Stopped**: `#ef4444` - Đỏ cho service dừng
- **Warning**: `#f59e0b` - Vàng cho cảnh báo

---

## 📝 Typography (Font/Chữ)

### Font Family
```css
font-family: 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif;
```

**Sans-serif modern**, giống trong ảnh:
- Segoe UI (Windows default)
- Roboto (Android/Material Design)
- System UI fallbacks

### Font Sizes
- **Extra Small**: 11px - Labels nhỏ
- **Small**: 12px - Secondary text
- **Base**: 14px - Default text
- **Large**: 16px - Headings
- **Extra Large**: 20px - Large headings

### Font Weights
- **Normal**: 400 - Chữ thường
- **Medium**: 500 - Nhấn nhẹ
- **Semibold**: 600 - Headings, labels
- **Bold**: 700 - Strong emphasis

---

## 🎯 Phong Cách Tổng Thể

### 1. **Minimalist & Modern**
- Không dùng border dày
- Phân tách vùng bằng màu sắc và subtle dividers
- Focus vào nội dung

### 2. **Subtle Separators**
```css
border-bottom: 1px solid rgba(255, 255, 255, 0.08);
```
- Đường phân cách mỏng, trong suốt
- Không làm rối mắt

### 3. **Hover Effects**
```css
.serviceRow:hover {
  background: #2a2d2e;
  border-left: 3px solid #0078d4;
}
```
- Highlight nhẹ khi hover
- Border accent màu xanh dương bên trái

### 4. **Selected Items**
- Background xanh đậm: `#094771`
- Rõ ràng nhưng không chói mắt

---

## 🪟 Window Controls (Fixed)

### Custom Title Bar
```tsx
<div className="title-bar">
  <div className="title-bar-drag-region"></div>
  <WindowControls />
</div>
```

### Functionality
- **Minimize Button**: Click để minimize window
- **Close Button**: Click để đóng app
- **Drag Region**: Kéo thả window

### Styling
- Height: 32px
- Background: `#252526` (dark gray)
- Border bottom: Subtle divider
- `-webkit-app-region: drag` - Cho phép kéo window

### Button States
```css
/* Normal state */
background: transparent;
color: #ffffff;

/* Hover */
background: rgba(255, 255, 255, 0.1);

/* Close button hover - Red */
background: #e81123;
```

---

## 📐 Visual Hierarchy

### 1. **Service Rows**
```
┌─────────────────────────────────────────┐
│ Service Name        [Status]  [Buttons] │
│ service.name • Auto                      │
└─────────────────────────────────────────┘
```

### 2. **Spacing System**
- **XS**: 4px
- **SM**: 8px
- **MD**: 12px
- **LG**: 16px
- **XL**: 24px
- **2XL**: 32px

### 3. **Border Radius**
- **Small**: 4px
- **Medium**: 6px
- **Large**: 8px
- Subtle, không quá tròn

---

## 🔧 Key Features

### ✅ Dark Mode Palette
- Xám đen làm chủ đạo
- Xanh dương cho accent
- Vàng/đỏ cho status

### ✅ Modern Typography
- Segoe UI / Roboto
- Sans-serif, clean
- Rõ ràng, dễ đọc

### ✅ Subtle Separators
- Không dùng border dày
- Dividers trong suốt
- Phân cách bằng màu sắc

### ✅ Window Controls
- Custom title bar
- Minimize/Close buttons working
- Draggable region

### ✅ Professional Look
- Giống Outlook/VS Code
- Minimalist design
- Content-focused
- High contrast for readability

---

## 🎨 Before & After

### Before
- Warm brown background (#302B2F)
- Heavy borders
- Less contrast

### After
- Modern dark gray (#1e1e1e)
- Subtle dividers
- High contrast
- Professional appearance
- Matches industry standards (Outlook, VS Code)

---

## 📦 Build Status

```
✓ TypeScript compilation successful
✓ Vite build completed
✓ CSS: 31.45 kB (gzipped: 6.27 kB)
✓ JS: 155.52 kB (gzipped: 49.84 kB)
```

---

## 🚀 Next Steps

App đã sẵn sàng với:
- ✅ Modern dark mode UI
- ✅ Working window controls
- ✅ Professional appearance
- ✅ High readability
- ✅ Industry-standard design

Run `wails dev` để test!
