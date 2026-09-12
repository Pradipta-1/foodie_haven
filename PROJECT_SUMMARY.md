# 🍔 Foodie Haven - Complete Full-Stack Restaurant Food Ordering Platform

## 📦 Project Structure

```
food-ordering-website/
├── frontend/                    # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages
│   │   ├── context/            # State management (Auth, Cart, Orders, Toast)
│   │   ├── types/              # TypeScript type definitions
│   │   ├── data/               # Mock data
│   │   └── lib/                # Utility functions
│   └── package.json
│
└── backend/                     # Node.js + Express + MongoDB + TypeScript
    ├── src/
    │   ├── models/             # Mongoose schemas (User, FoodItem, Order, Coupon)
    │   ├── controllers/        # Request handlers
    │   ├── routes/             # API routes
    │   ├── middleware/         # Auth & error handling
    │   ├── config/             # Database connection
    │   ├── seed.ts             # Database seeding script
    │   └── index.ts            # Express server
    └── package.json
```

---

## 🎨 FRONTEND - React TypeScript Application

### ✅ Completed Features:

1. **Home Page** (`/`)
   - Hero banner with call-to-action
   - Special offers & deals carousel
   - Category showcase
   - Popular dishes section
   - Customer testimonials
   - Newsletter subscription

2. **Menu Page** (`/menu`)
   - Live search functionality
   - Category filters (8 categories)
   - Dietary filters (Veg/Non-Veg)
   - Sorting (Price, Rating, Popularity)
   - Availability filter
   - Responsive food cards with quick-add

3. **Food Details** (`/food/:id`)
   - Full dish specifications
   - Customization options (sizes, add-ons, toppings)
   - Special instructions box
   - Real-time price calculation
   - Customer reviews

4. **Shopping Cart** (`/cart`)
   - Slide-over drawer
   - Dedicated cart page
   - Quantity management
   - Coupon system (WELCOME50, SAVE15, FLAT5, FREESHIP)
   - Price breakdown (subtotal, delivery, tax, discount)
   - localStorage persistence

5. **Checkout** (`/checkout`)
   - Customer information form
   - Delivery address input
   - Delivery options (Standard, Express, Pickup)
   - Payment methods (COD, UPI, Card, Net Banking)
   - Form validation

6. **Order Confirmation** (`/order-confirmation/:id`)
   - Confetti celebration animation
   - Order summary with invoice
   - Live order tracking stepper
   - Printable receipt

7. **Orders Dashboard** (`/orders`)
   - Order history with filters
   - Order status tracking
   - Reorder functionality
   - Cancel order option

8. **User Profile** (`/profile`)
   - Profile information management
   - Order statistics
   - Saved addresses

9. **Admin Dashboard** (`/admin`)
   - Business analytics & KPIs
   - Order management with status updates
   - Menu catalog CRUD operations
   - Stock availability toggle
   - Customer directory

10. **Authentication** (`/login`, `/register`)
    - User registration
    - Login with JWT tokens
    - Protected routes
    - Role-based access (Customer/Admin)

### 🎨 Design Features:
- Fully responsive (mobile, tablet, desktop)
- Warm food-themed color palette
- Smooth animations & micro-interactions
- Modern card designs with shadows
- Loading states & skeleton loaders
- Toast notifications
- Empty states with illustrations

### 🔧 Tech Stack:
- React 18
- TypeScript
- Tailwind CSS
- React Router v6
- Context API (state management)
- Lucide Icons
- Canvas Confetti
- localStorage persistence

---

## 🚀 BACKEND - Node.js REST API

### ✅ API Endpoints:

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user (returns JWT)
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

#### Food Items (`/api/food`)
- `GET /food` - Get all food items (with filters & search)
- `GET /food/:id` - Get single food item
- `POST /food` - Create food item (Admin)
- `PUT /food/:id` - Update food item (Admin)
- `DELETE /food/:id` - Delete food item (Admin)
- `PATCH /food/:id/availability` - Toggle availability (Admin)

#### Orders (`/api/orders`)
- `POST /orders` - Create new order
- `GET /orders/my-orders` - Get user's orders
- `GET /orders` - Get all orders (Admin)
- `GET /orders/:id` - Get single order
- `PATCH /orders/:id/status` - Update order status (Admin)
- `PATCH /orders/:id/cancel` - Cancel order

#### Coupons (`/api/coupons`)
- `GET /coupons` - Get all active coupons
- `POST /coupons/verify` - Verify & apply coupon

#### Admin Stats (`/api/stats`)
- `GET /stats` - Get dashboard analytics (Admin)

### 🗄️ Database Models:
- **User** - fullName, email, password (hashed), phone, role
- **FoodItem** - name, description, price, category, image, rating, ingredients
- **Order** - orderNumber, userId, items, totals, status, delivery info
- **Coupon** - code, discountType, discountValue, minOrderAmount

### 🔒 Security:
- Password hashing (bcryptjs)
- JWT authentication
- Role-based access control
- CORS enabled
- MongoDB injection protection

### 🔧 Tech Stack:
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing

---

## 🚀 Getting Started

### Frontend:
```bash
cd food-ordering-website
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend:
```bash
cd backend
npm install

# Setup .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodie_haven
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

# Seed database
npm run seed

# Start server
npm run dev
# Runs on http://localhost:5000
```

---

## 🔑 Demo Credentials

**Admin Account:**
- Email: `admin@foodiehaven.com`
- Password: `admin123`

**Customer Account:**
- Email: `demo@example.com`
- Password: `demo123`

**Test Coupons:**
- `WELCOME50` - 50% off (max $10, min order $20)
- `SAVE15` - 15% off (min order $30)
- `FLAT5` - $5 off (min order $25)
- `FREESHIP` - Free delivery (min order $35)

---

## ✨ Key Features Summary

✅ Complete user authentication & authorization
✅ Browse 30+ food items across 8 categories
✅ Advanced filtering & search
✅ Customizable food items with add-ons
✅ Real-time cart management with coupons
✅ Multi-step checkout with form validation
✅ Order tracking with live status updates
✅ User profile & order history
✅ Full admin dashboard for management
✅ Responsive design for all devices
✅ Production-ready with build optimization

---

## 📝 Notes

- Frontend can work standalone with localStorage (no backend required for demo)
- Backend provides full REST API for production use
- MongoDB required for backend (local or Atlas cloud)
- All passwords are securely hashed
- JWT tokens expire in 30 days
- Images use Unsplash CDN URLs

---

## 🎉 Project Complete!

This is a **production-quality**, **full-stack restaurant ordering platform** with modern architecture, clean code, and beautiful UI/UX.
