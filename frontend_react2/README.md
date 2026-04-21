# FixMyBits - Elegant Frontend

A beautiful, modern React frontend for the FixMyBits bug bounty platform. Built with elegant design principles, smooth animations, and a refined color palette.

## ✨ Features

- **Elegant Design System**: Beautiful color palette with soft gradients (Deep Indigo, Lavender, Rose Gold)
- **Premium Typography**: Cormorant Garamond (display) + DM Sans (body)
- **Smooth Animations**: Powered by Framer Motion for delightful micro-interactions
- **Glass Morphism**: Modern glassmorphic UI elements with backdrop blur
- **Fully Responsive**: Mobile-first design that looks stunning on all devices
- **Role-Based Dashboards**: Customized views for Startups, Testers, and Admins

## 🎨 Design Highlights

- Soft gradient backgrounds with floating animation
- Elegant card components with hover effects
- Beautiful form inputs with focus states
- Responsive navigation with mobile menu
- Glassmorphic overlays and backdrops
- Smooth page transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Django backend running on `http://localhost:8000`

### Installation

```bash
# Navigate to the frontend directory
cd frontend_react2

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
frontend_react2/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Navigation component
│   │   │   └── Navbar.css
│   │   └── ui/
│   │       ├── Button.jsx          # Reusable button component
│   │       ├── Input.jsx           # Form input components
│   │       ├── Card.jsx            # Card container components
│   │       └── *.css
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/
│   │   ├── Login.jsx               # Login page
│   │   ├── Register.jsx            # Registration page
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── Projects.jsx            # Projects page
│   │   ├── Reports.jsx             # Reports page
│   │   ├── Auth.css                # Auth pages styles
│   │   └── Dashboard.css
│   ├── services/
│   │   └── api.js                  # API integration layer
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles & design system
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Design System

### Color Palette

- **Primary**: Deep Indigo (#4F46E5)
- **Secondary**: Vibrant Pink (#EC4899)
- **Accent**: Amber Gold (#F59E0B)
- **Success**: Emerald (#10B981)
- **Background**: Soft White (#FAFAFA)

### Typography

- **Display Font**: Cormorant Garamond (Elegant serif for headings)
- **Body Font**: DM Sans (Clean sans-serif for content)

### Gradients

- Elegant: Indigo → Pink → Amber
- Primary: Purple → Deep Purple
- Secondary: Pink → Red
- Ocean: Aqua → Rose
- Sunset: Pink → Yellow

## 🔌 API Integration

The frontend connects to the Django backend at `http://localhost:8000/api` with the following endpoints:

- **Auth**: `/auth/login/`, `/auth/register/`, `/auth/me/`
- **Projects**: `/startup/projects/`, `/tester/projects/`, `/admin/projects/`
- **Reports**: `/tester/reports/`, `/startup/reports/`, `/admin/reports/`

JWT tokens are automatically managed with refresh token rotation.

## 👤 User Roles

### Startup
- Create and manage security projects
- View bug reports from testers
- Mark reports as fixed

### Security Tester
- Browse open projects
- Apply to projects
- Submit bug reports with screenshots

### Admin
- Approve/reject projects
- Review bug reports
- Manage users and applications

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🎭 Components Library

### UI Components

- **Button**: Multiple variants (primary, secondary, outline, ghost, success, danger)
- **Input**: Text, email, password, textarea, select with icons
- **Card**: Default, elevated, glass, gradient variants
- **Navbar**: Responsive with mobile menu

### Layout Components

- **Navbar**: Sticky navigation with user info and logout
- **Dashboard**: Role-based dashboard layouts
- **Auth Pages**: Beautiful login/register pages with animated backgrounds

## 🔐 Authentication Flow

1. User registers/logs in via elegant auth pages
2. JWT tokens stored in localStorage
3. Automatic token refresh on 401 responses
4. Protected routes redirect to login if unauthenticated
5. Role-based dashboard views

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is part of the FixMyBits platform.

## 🎯 Next Steps

- Expand Projects page with full CRUD operations
- Add Reports management interface
- Implement real-time notifications
- Add file upload preview
- Enhance admin panel
- Add dark mode toggle

---

**Built with ❤️ using React, Vite, Framer Motion, and elegant design principles**
