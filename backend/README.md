# Foodie Haven - Backend API

Complete REST API backend for the Foodie Haven restaurant food ordering platform.

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (locally installed or MongoDB Atlas cloud)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodie_haven
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Seed Database

Populate the database with initial data (admin user, demo customer, food items, coupons):

```bash
npm run seed
```

**Demo Credentials after seeding:**
- **Admin:** admin@foodiehaven.com / admin123
- **Customer:** demo@example.com / demo123

### Run Development Server

```bash
npm run dev
```

The API will run on `http://localhost:5000`

### Build for Production

```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user profile | Private |
| PUT | `/auth/profile` | Update user profile | Private |

**Example - Register:**
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-0123",
  "password": "password123"
}
```

**Example - Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Food Items Routes (`/api/food`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/food` | Get all food items (with filters) | Public |
| GET | `/food/:id` | Get single food item | Public |
| POST | `/food` | Create food item | Admin |
| PUT | `/food/:id` | Update food item | Admin |
| DELETE | `/food/:id` | Delete food item | Admin |
| PATCH | `/food/:id/availability` | Toggle availability | Admin |

**Query Parameters for GET /food:**
- `category` - Filter by category (e.g., Burgers, Pizza)
- `isVeg` - Filter by vegetarian (true/false)
- `available` - Show only available items (true)
- `search` - Search by name or description
- `sort` - Sort by: popular, rating, price-asc, price-desc

**Example:**
```
GET /api/food?category=Pizza&isVeg=true&sort=rating
```

---

### Orders Routes (`/api/orders`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/orders` | Create new order | Private |
| GET | `/orders/my-orders` | Get user's orders | Private |
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/:id` | Get single order | Private |
| PATCH | `/orders/:id/status` | Update order status | Admin |
| PATCH | `/orders/:id/cancel` | Cancel order | Private |

**Example - Create Order:**
```json
POST /api/orders
Headers: { "Authorization": "Bearer <token>" }
{
  "items": [...],
  "subtotal": 45.99,
  "deliveryFee": 3.99,
  "tax": 3.68,
  "discount": 5.00,
  "grandTotal": 48.66,
  "deliveryAddress": {
    "fullName": "John Doe",
    "phone": "+1 555-0123",
    "email": "john@example.com",
    "houseNumber": "123",
    "street": "Main St",
    "city": "Springfield",
    "state": "IL",
    "pincode": "62704"
  },
  "deliveryType": "standard",
  "paymentMethod": "cod"
}
```

---

### Coupons Routes (`/api/coupons`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/coupons` | Get all active coupons | Public |
| POST | `/coupons/verify` | Verify & apply coupon | Public |

**Example - Verify Coupon:**
```json
POST /api/coupons/verify
{
  "code": "WELCOME50",
  "orderAmount": 30
}
```

---

### Admin Stats Routes (`/api/stats`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Get admin dashboard stats | Admin |

Returns:
- Total revenue
- Total orders count
- Active orders count
- Today's orders
- Available dishes
- Total customers
- Recent orders

---

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon successful login/registration.

---

## 🗄️ Database Models

### User
- fullName, email, password (hashed), phone
- role: 'customer' | 'admin'
- savedAddresses[]

### FoodItem
- name, description, price, originalPrice
- category, image, isVeg
- rating, ratingCount, isAvailable
- isPopular, isChefSpecial
- prepTimeMinutes, calories
- ingredients[], customizations[], addOns[], reviews[]

### Order
- orderNumber (unique)
- userId (ref: User)
- items[], subtotal, deliveryFee, tax, discount, grandTotal
- status: 'Order Placed' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
- deliveryAddress, deliveryType, paymentMethod, paymentStatus
- statusTimestamps{}

### Coupon
- code (unique, uppercase)
- discountType: 'percentage' | 'fixed'
- discountValue, minOrderAmount, maxDiscount
- description, isActive

---

## 📝 Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
npm run seed     # Seed database with initial data
```

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control (Customer / Admin)
- CORS enabled for frontend
- MongoDB injection protection via Mongoose
- Input validation

---

## 🐛 Error Handling

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📞 Support

For issues or questions, contact the development team.
