# Foodie Haven - Modern Restaurant Food Ordering Platform

A premium, fully responsive, production-quality restaurant food ordering website built with **React**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 1. 🍽️ Interactive Home Page
- **Hero Banner:** Catchy hero headline, high-resolution food presentation, live quick stats.
- **Special Offers & Deals:** Clickable discount cards with BOGO & promo coupons.
- **Categories Showcase:** Direct navigation with category filtering.
- **Popular Dishes & Chef's Specials:** Highlighting customer favorites and signature items.
- **Customer Reviews:** Real testimonials with ratings.
- **Interactive Newsletter:** Instant coupon reward upon subscription.

### 2. 📋 Comprehensive Menu Browsing & Filtering
- **Live Search:** Instant search by dish name, description, and ingredients.
- **Categorization:** Burgers, Pizza, Pasta, Biryani, Starters, Main Course, Desserts, Beverages.
- **Dietary Filter:** Instant toggle for Vegetarian / Non-Vegetarian.
- **Availability Filter:** Option to view only in-stock items.
- **Sorting:** By Popularity, Highest Rated, Price (Low to High), and Price (High to Low).
- **Responsive Food Cards:** Quick Add button, live quantity increment/decrement, prep time, calories, ratings.

### 3. 🍔 Food Details & Customization Modal
- Full dish specifications with rich imagery, ingredients list, and customer reviews.
- **Interactive Customizations:** Patty choices, pizza sizes, cheese options, crust styles, add-ons.
- **Special Instructions Box:** Personal notes for the chef.
- **Dynamic Price Recalculation:** Updates live based on selected toppings and options.

### 4. 🛒 Dynamic Shopping Cart & Drawer
- **Slide-Over Cart Drawer:** Quick access from navbar with item count badge.
- **Dedicated Cart Page:** Full breakdown of items, unit prices, customizations.
- **Interactive Coupon System:** Includes test codes (`WELCOME50`, `SAVE15`, `FLAT5`, `FREESHIP`) with minimum order validation.
- **Automatic Calculations:** Subtotal, delivery fee logic (Free over $40), 8% estimated tax, and discount deduction.
- **Persistence:** LocalStorage integration preserves cart across browser refreshes.

### 5. 💳 Streamlined Checkout Flow
- **Customer Details:** Full name, phone, email.
- **Delivery Address:** House/flat, street, landmark, city, state, pincode, instructions.
- **Delivery Modes:** Standard Delivery, Express Delivery (15-25 mins), and In-Store Pickup.
- **Payment Methods:** Cash on Delivery (COD), UPI / QR Code, Credit/Debit Card, Net Banking.
- **Form Validation:** Comprehensive error highlighting and instant feedback.

### 6. 🎉 Order Confirmation & Visual Live Tracking
- **Confetti Celebration Animation** on order placement.
- **Detailed Invoice Breakdown:** Printable receipt layout.
- **Interactive Step-by-Step Order Tracker:**
  - 1. Order Placed
  - 2. Confirmed
  - 3. Preparing
  - 4. Out for Delivery
  - 5. Delivered

### 7. 📦 User Orders Dashboard
- Filter by All, Active/In-Progress, Delivered, and Cancelled.
- **Reorder Feature:** Adds all items from previous order to cart with a single click.
- **Cancel Order:** Safe cancellation flow for orders still in preparation.

### 8. 👤 User Profile Management
- View and edit personal information (name, email, phone).
- Order statistics (Total orders, Delivered count, Total spend).

### 9. 👑 Admin Dashboard (`/admin`)
- **Business Overview:** Total Revenue, Total Orders, Today's Orders, Available Dishes, and category distribution charts.
- **Order Management:** Change order statuses in real-time (`Order Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered` ➔ `Cancelled`).
- **Menu Catalog CRUD:** Add new food items with custom images & ingredients, edit prices/descriptions, delete items, toggle stock availability.
- **Customer Directory:** Track customer purchase history and total expenditure.

---

## 🔑 Demo Credentials

### Customer Account
- **Email:** `demo@example.com` (or create any account on Register page)
- **Password:** `demo123`

### Administrator Account
- **Email:** `admin@foodiehaven.com`
- **Password:** `admin123`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run

```bash
# 1. Navigate to project directory
cd food-ordering-website

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 🛠️ Built With
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **React Router v7**
- **Canvas Confetti**
- **LocalStorage State Persistence**
