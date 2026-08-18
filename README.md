# ToKo Store — Premium Fashion & Clothing E-Commerce

A modern, full-stack clothing and luxury fashion e-commerce application built with **NestJS** on the backend and **React + Vite + TailwindCSS** on the frontend.

---

## 🌟 Tech Stack

### Backend (NestJS)
- **Framework:** [NestJS](https://nestjs.com/) (v11) with TypeScript
- **Database:** MongoDB via [Mongoose](https://mongoosejs.com/) (v9)
- **Cache & Queues:** Redis / Upstash with [BullMQ](https://bullmq.io/)
- **Media Storage:** [Cloudinary](https://cloudinary.com/) (with local filesystem fallback)
- **Security & Auth:** Passport JWT, AES-256 token encryption, Bcrypt, Throttler rate-limiting
- **Payments:** Stripe integration
- **Mailing:** Nodemailer with Google SMTP

### Frontend
- **Framework:** React 19 with [Vite](https://vitejs.dev/)
- **Styling:** TailwindCSS with bespoke glassmorphic luxury design system
- **Routing & State:** React Router v7, React Context API, React Hook Form + Yup
- **Icons & Animation:** Lucide Icons, Framer Motion
- **Internationalization:** i18next (English & Arabic support)
- **Charts & Metrics:** Recharts

---

## 🚀 Key Features

- 👗 **Fashion Product Catalog:** Multi-image gallery, categories, brands, variants, SKU tracking, and real-time inventory management.
- 🛒 **Smart Shopping Bag:** Atomic upsert cart system, automatic subtotal/tax calculations, and coupon redemption with percentage/fixed limits.
- ⭐ **Reviews & Rating System:** Customer feedback and live star rating aggregation per product.
- 💖 **Wishlist:** One-click wishlist toggling synced to user accounts.
- 🔐 **Authentication & Security:** JWT Access & Refresh token rotation, Google OAuth, and encrypted sessions.
- 👑 **Comprehensive Admin Dashboard:**
  - Live revenue, order status, and inventory insights
  - Real-time cart and wishlist analytics
  - Media Studio powered by Cloudinary
  - Admin creation and role management
  - Coupon management (percentage, fixed amount, max discount caps)
- 💳 **Checkout & Payments:** Stripe payment intent processing with order status lifecycle tracking.

---

## 📂 Project Structure

```text
ToKo Store/
├── src/                          # NestJS Backend Source
│   ├── common/                   # Shared modules (Security, Upload, Redis, Guards, Filters)
│   ├── config/                   # Configuration loaders
│   ├── model/                    # Mongoose Schemas & Models
│   ├── modules/                  # Feature Modules
│   │   ├── authentication/       # Register, Login, Refresh, OAuth
│   │   ├── user/                 # Profile & Admin user management
│   │   ├── product/              # Product CRUD & inventory
│   │   ├── category/             # Category management
│   │   ├── brand/                # Brand management
│   │   ├── cart/                 # Cart service & atomic calculations
│   │   ├── coupon/               # Coupon validation & management
│   │   ├── order/                # Orders & checkout processing
│   │   ├── payment/              # Stripe integration
│   │   ├── review/               # Ratings & customer reviews
│   │   ├── wishlist/             # Wishlist management
│   │   ├── dashboard/            # Analytics & management metrics
│   │   └── notification/         # Alerts & email notifications
│   ├── app.module.ts             # Root application module
│   └── main.ts                   # Application bootstrap & global pipes
├── frontend/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/           # UI components, Admin views & Navbar
│   │   ├── context/              # Auth, Cart, Wishlist, Theme contexts
│   │   ├── pages/                # Shop, ProductDetail, Cart, Checkout, Admin, Auth
│   │   └── lib/                  # Axios instance & utility helpers
│   ├── public/                   # Static assets & fashion favicon
│   └── index.html
├── scripts/                      # Utility scripts (Admin seeding)
├── uploads/                      # Local media fallback directory
└── package.json                  # Backend dependencies & scripts
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js:** v18+ or v20+
- **MongoDB:** Local instance running on port 27017 or a MongoDB Atlas URI
- **Redis:** Local Redis or Upstash instance

---

### 2. Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create or edit `.env.development`:
   ```env
   PORT=3000
   APPLICATION_NAME="ToKo_Store"
   DB_URI="mongodb://localhost:27017/ToKo_Store"
   REDIS_URI="redis://localhost:6379"

   # Encryption & Secrets
   SALT_ROUND=12
   ENC_IV_LENGTH=16
   ENC_KEY="your_64_character_hex_encryption_key"
   User_TOKEN_SECRET_KEY="your_jwt_user_secret"
   User_REFRESH_TOKEN_SECRET_KEY="your_jwt_refresh_secret"

   # Media (Cloudinary)
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

3. **Seed Initial Admin (Optional):**
   ```bash
   npm run seed:admin
   ```

4. **Start Backend Dev Server:**
   ```bash
   npm run start:dev
   ```
   *The NestJS server will start on [http://localhost:3000](http://localhost:3000).*

---

### 3. Frontend Setup

1. **Navigate to frontend directory & install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Dev Server:**
   ```bash
   npm run dev
   ```
   *The Vite dev server will start on [http://localhost:5173](http://localhost:5173).*

---

## 📜 Available Scripts

### Backend (`/`)
- `npm run start:dev` — Starts NestJS in development watch mode
- `npm run build` — Compiles the TypeScript application to `/dist`
- `npm run start:prod` — Runs the compiled production build
- `npm run seed:admin` — Creates an administrative user via CLI
- `npm run test` — Runs Jest unit tests

### Frontend (`/frontend`)
- `npm run dev` — Starts Vite local development server
- `npm run build` — Builds production bundle to `/frontend/dist`
- `npm run preview` — Previews production build locally

---

## 📄 License
This project is proprietary and maintained for the ToKo Store application.
