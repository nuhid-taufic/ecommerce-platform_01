# Full-Stack E-commerce Platform

A professional e-commerce platform featuring a modern storefront, a powerful admin dashboard, and a robust backend.

## Project Structure

- **`storefront/`**: The main user-facing application built with Next.js and Tailwind CSS.
- **`admin-dashboard/`**: The management interface for staff, built with React and Vite.
- **`enterprise-backend/`**: The Node.js/Express API that powers both the storefront and the admin panel.

## Features

- **Storefront**: Product browsing, AI-powered search, cart management, secure checkout, and user profiles.
- **Admin Dashboard**: Real-time analytics, inventory management, order tracking, and customer support tools.
- **Backend**: Scalable API with JWT authentication, Stripe/SSLCommerz payment integration, and automated inventory controls.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB (Running locally or via Atlas)

### Installation

1. Clone the repository.
2. Install dependencies for each component:
   ```bash
   cd enterprise-backend && npm install
   cd ../storefront && npm install
   cd ../admin-dashboard && npm install
   ```

### Running the Project

1. **Backend**:
   ```bash
   cd enterprise-backend && npm run dev
   ```
2. **Storefront**:
   ```bash
   cd storefront && npm run dev
   ```
3. **Admin Dashboard**:
   ```bash
   cd admin-dashboard && npm run dev
   ```

## Environment Variables

Ensure you create `.env` files in each subdirectory based on the provided configuration templates.

## License

This project is licensed under the MIT License.
