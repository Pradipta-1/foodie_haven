# 🚀 Hosting Foodie Haven on Render - Complete Deployment Guide

This guide will walk you through hosting **Foodie Haven** on [Render](https://render.com) step-by-step.

---

## 📋 Prerequisites

1. A **[GitHub](https://github.com)** account with this repository pushed to it.
2. A free **[Render](https://render.com)** account.
3. A free **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** account (for the live database).

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

Render is a compute platform and does not host stateful MongoDB for free. You can get a free 512MB cloud database in 2 minutes on MongoDB Atlas:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in / sign up.
2. Click **Create a Deployment** -> Choose **M0 Free Cluster**.
3. Under **Security Quickstart**:
   - **Database User**: Create a username (e.g. `foodieadmin`) and secure password. Note these down.
   - **IP Access List**: Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render servers can connect to your DB.
4. Click **Connect** -> Choose **Drivers** (Node.js).
5. Copy your connection string. It will look like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodie_haven?retryWrites=true&w=majority
   ```
   *(Remember to replace `<username>` and `<password>` with your actual DB user credentials).*

---

## 🛠️ Step 2: Deploy to Render

You can choose either **Option A (Render Blueprint - Easiest)** or **Option B (Manual Dashboard Setup)**.

---

### 🌟 Option A: Using Render Blueprint (Recommended)

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and configure both the **Backend Web Service** and **Frontend Static Site**.
5. Fill in the required environment variables:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string.
   - `CLIENT_URL`: You can set this after the frontend service URL is created (e.g. `https://foodie-haven-frontend.onrender.com`).
6. Click **Apply**.

---

### 🛠️ Option B: Manual Setup via Render Dashboard

#### Part 1: Deploy Backend (Web Service)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `foodie-haven-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Frankfurt / Singapore / Oregon)
   - **Branch**: `main` (or `master`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Add **Environment Variables** (under Advanced):
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodie_haven?retryWrites=true&w=majority`
   - `JWT_SECRET` = *(Generate any random 32+ character string)*
   - `CLIENT_URL` = `*` *(or your frontend URL once generated)*
5. Click **Create Web Service**.
6. Once deployed, note down your backend URL (e.g., `https://foodie-haven-backend.onrender.com`).

---

#### Part 2: Deploy Frontend (Static Site)
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `foodie-haven-frontend`
   - **Root Directory**: `.` (leave blank or `./`)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL` = `https://foodie-haven-backend.onrender.com/api` *(replace with your actual backend URL from Part 1)*
5. Under **Redirects/Rewrites**:
   - *(Note: The `public/_redirects` file is already included in the repo and handles this automatically!)*
   - (Optional manual rule): Source: `/*`, Destination: `/index.html`, Action: `Rewrite`.
6. Click **Create Static Site**.

---

## 🌾 Step 3: Seed Initial Data (Admin & Demo Foods)

Once your backend is connected to MongoDB Atlas, you can seed food items, categories, coupons, and demo accounts:

### Method 1: Using Render Backend Shell
1. Go to your backend web service in Render Dashboard.
2. Open the **Shell** tab on the left menu.
3. Run:
   ```bash
   npm run seed:prod
   ```
   *(or `npm run seed`)*

### Method 2: From Local Machine
You can also run the seed command locally pointing to your MongoDB Atlas cluster:
```bash
cd backend
MONGODB_URI="your_mongodb_atlas_uri" npm run seed
```

---

## 🔑 Default Login Credentials

- **Admin Account**:
  - Email: `admin@foodiehaven.com`
  - Password: `admin123`
- **Customer Account**:
  - Email: `demo@example.com`
  - Password: `demo123`

---

## 🔍 Verification & Health Check

- Backend Health Check: `https://<your-backend-url>.onrender.com/api/health`
- Frontend App: `https://<your-frontend-url>.onrender.com`
