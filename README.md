# QuickBite Delivered

Build a food delivery web app called QuickBite.

TECH SETUP:

- Enable Supabase for the database

- Enable email/password authentication

AUTHENTICATION:

- Signup page: full name, email, password. Validate that email is a real email format and password is at least 6 characters. Show clear error messages.

- Login page: email and password, with a link to signup

- Logout button in the navbar

- Restaurants, cart, addresses, checkout, and orders pages must require login. If a logged-out user visits them, redirect to login.

SEED DATA (hardcode this, no admin panel needed):

Create 6 restaurants, each with a name, cuisine type, rating, delivery time, and image. Each restaurant has 5 menu items with name, description, price in rupees, and image.

Restaurants: Spice Route (North Indian), Tokyo Bowl (Japanese), Napoli Pizza (Italian), Green Leaf (Healthy), Burger Barn (American), Chaat Corner (Street Food).

MAIN USER FLOW:

1. Home page shows a grid of restaurant cards

2. Clicking a restaurant opens its menu page

3. Each menu item has an "Add to Cart" button

4. Cart page: shows added items, lets the user increase/decrease quantity or remove an item, shows subtotal, delivery fee of 40 rupees, and total

5. Checkout page: user picks a saved delivery address, sees order summary, clicks "Place Order"

6. Order confirmation screen with an order ID

7. Orders page lists all that user's past orders with date, restaurant, items, and total

DELIVERY ADDRESSES - full CRUD, this is the core data entity:

- Addresses page listing the logged-in user's saved addresses

- Create: form with label (Home/Work/Other), full address, city, pincode, phone number

- Read: display all of the user's addresses as cards

- Update: edit any address in a form pre-filled with existing values

- Delete: delete button with a confirmation prompt

- Validate: no empty fields, pincode must be 6 digits, phone must be 10 digits

- Each user only sees their own addresses

DESIGN:

Clean and modern. White background, orange accent color (#FF6B35), rounded corners, generous spacing. Fully responsive on mobile. Show loading spinners while data loads and friendly error messages when something fails.

Keep the code simple and well organized with reusable components. Do not add any features beyond what I listed.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bite-feast-quick.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a471b8ba-ecde-48bd-be1e-edc0c597f47c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
