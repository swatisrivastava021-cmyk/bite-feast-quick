# 🍔 QuickBite — Food Delivery Web App

A food delivery web application where users can browse restaurants, explore menus, add items to a cart, manage their delivery addresses, and place orders.

**Live App:** https://bite-feast-quick.lovable.app

**Test Credentials**
```
Email:    reviewer@quickbite.com
Password: Test@1234
```

---

## Project Overview

QuickBite solves a simple problem: ordering food online should take a few taps, not a phone call.

The app gives a user one continuous journey — sign up, browse six local restaurants, open a menu, add food to a cart, save a delivery address, check out, and review past orders. Every screen after login is protected, and every user only ever sees their own addresses and their own order history.

This project was built as a college assignment demonstrating three mandatory capabilities: **user authentication**, **full CRUD operations**, and a **complete end-to-end business flow**.

---

## Features

### Authentication
- Sign up with full name, email and password
- Log in / log out
- Protected routes — logged-out visitors are redirected to the login page
- Session persists across page refreshes

### Delivery Addresses — full CRUD
Delivery addresses are the core data entity of this app.

| Operation | What the user can do |
|---|---|
| **Create** | Add a new address with label, full address, city, pincode and phone |
| **Read** | View all of their saved addresses as cards |
| **Update** | Edit any saved address in a pre-filled form |
| **Delete** | Remove an address, with a confirmation prompt |

Each user's addresses are scoped to their own account.

### Core Business Flow
```
Sign Up / Log In
      ↓
Browse Restaurants
      ↓
View Restaurant Menu
      ↓
Add Food to Cart
      ↓
Modify Cart (quantity / remove)
      ↓
Select or Create Delivery Address
      ↓
Checkout
      ↓
Order Confirmation
      ↓
View Previous Orders
```

### Other
- Six seeded restaurants with full menus
- Cart with quantity steppers, item removal, subtotal, delivery fee and total
- Order history per user
- Form validation (email format, minimum password length, 6-digit pincode, 10-digit phone, no empty fields)
- Loading states and error messages
- Responsive layout — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Design | Google Stitch |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Build Tool | Vite |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (email + password) |
| Build Platform | Lovable |
| Hosting | Lovable Cloud |
| Version Control | Git + GitHub |

### Why this stack

The interface was designed first in **Google Stitch**, which generates UI layouts from a written description. Stitch is a design tool only — it has no backend, no database and no authentication — so it could not deliver the assignment's functional requirements on its own.

The working application was therefore built on **Lovable**, which generates a full-stack React app and provisions a **Supabase** backend for authentication and data storage. This split kept the design phase fast and visual while ensuring the final app had real server-side auth and a real database rather than mock data.

---

## Data Model

**profiles** — one row per registered user
| Field | Type |
|---|---|
| id | uuid (references auth user) |
| full_name | text |
| email | text |

**addresses** — the CRUD entity
| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid (owner) |
| label | text (Home / Work / Other) |
| address_line | text |
| city | text |
| pincode | text |
| phone | text |

**orders** — one row per placed order
| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| restaurant_name | text |
| items | jsonb |
| total | numeric |
| address_id | uuid |
| created_at | timestamp |

Restaurant and menu data is seeded in the application rather than user-generated, since restaurant management is outside the scope of this assignment.

---

## Folder Structure

```
quickbite/
├── src/
│   ├── pages/              # One file per route
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Restaurants.tsx
│   │   ├── RestaurantMenu.tsx
│   │   ├── Cart.tsx
│   │   ├── Addresses.tsx
│   │   ├── Checkout.tsx
│   │   └── Orders.tsx
│   ├── components/         # Reusable UI pieces
│   │   ├── ui/             # Buttons, inputs, cards, dialogs
│   │   └── layout/         # Navbar, bottom navigation
│   ├── contexts/           # Shared state (auth, cart)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/
│   │   └── supabase/       # Database client and types
│   ├── data/               # Seeded restaurant and menu data
│   ├── lib/                # Helper functions
│   ├── App.tsx             # Route definitions
│   └── main.tsx            # Application entry point
├── supabase/
│   └── migrations/         # Database schema
├── public/                 # Static assets
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

The principle: **`pages/` holds routes, `components/` holds reusable pieces, `contexts/` holds shared state, and `integrations/` holds anything that talks to the backend.**

---

## Installation

**Requirements:** Node.js 18 or higher, npm

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd quickbite

# 2. Install dependencies
npm install

# 3. Add environment variables (see below)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a file named `.env` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

These are found in your Supabase project under **Settings → API**.

`.env` is listed in `.gitignore` and is never committed. Only the publishable (anon) key is used on the client — the service role key is never exposed to the frontend.

---

## Running Locally

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check code for lint errors |

---

## Deployment

The app is deployed on **Lovable Cloud** and is live at:

**https://bite-feast-quick.lovable.app**

Deployment is triggered from the Lovable editor using the **Publish** button. Because the project is synced with GitHub, the codebase can also be deployed to Vercel or Netlify by importing the repository, setting the two environment variables above, and using `npm run build` as the build command with `dist` as the output directory.

---

## Known Limitations

- Restaurant and menu data is seeded in code — there is no restaurant owner dashboard
- Payment is simulated; no real payment gateway is integrated
- Order status is static after placement (no live delivery tracking)
- The hosted version displays a Lovable badge, which is removed only on paid plans

---

## Future Improvements

- Razorpay or Stripe integration for real payments
- Live order tracking with status updates (Preparing → Out for delivery → Delivered)
- Restaurant search and cuisine filters
- Ratings and reviews on completed orders
- A restaurant owner dashboard for managing menus
- Reorder from order history in one tap
- Push notifications for order updates

---

## Author

Swati Srivastava

Built as a college assignment demonstrating authentication, CRUD operations, and a complete end-to-end business flow.
