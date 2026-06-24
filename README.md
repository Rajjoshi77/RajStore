# RajStore - Premium E-Commerce Platform

A feature-rich, full-stack E-Commerce application built with the MERN stack, styling from TailwindCSS and React-Bootstrap, secure payments via Razorpay, custom email notifications, and an AI-powered shopping assistant.

---

## 🚀 Key Features

- **Authentication System**: Secure registration & login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Product Management**: View, filter, and search products dynamically.
- **Shopping Cart & Checkout**: Interactive shopping cart with route protection, restricting checkout to authenticated users.
- **Payment Gateway Integration**: Secure checkouts with **Razorpay** integration.
- **AI-Powered Chatbot Widget**: Integrated customer support chatbot with fallback to Hugging Face Inference API (`facebook/blenderbot-400M-distill`) for intelligent conversation.
- **Email Notifications**: Double integration of **SendGrid** and **Nodemailer** for order confirmations, newsletters, and contact form submissions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (v19) + Vite
- **Styling**: TailwindCSS (v4) & React-Bootstrap / Bootstrap (v5)
- **Routing**: React Router (v7)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Auth**: JSON Web Tokens (JWT) & bcryptjs
- **Integrations**: Razorpay, SendGrid Mail, Nodemailer, Hugging Face Inference API

---

## 📂 Project Structure

```
ecommerce/
├── backend/                  # Express server & API endpoints
│   ├── config/               # Database connections & setup
│   ├── controllers/          # Request handlers (auth, chat, orders, products)
│   ├── middleware/           # JWT Authentication middleware
│   ├── models/               # Mongoose schemas (User, Product, Order)
│   ├── routes/               # API routes definitions
│   └── seed/                 # Seed scripts for initial product data
└── frontend/
    └── ecommerce_frontend/   # React application built with Vite
        ├── public/           # Static assets & icons
        └── src/              # React code components & pages
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI or a running local MongoDB instance

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM=your_sender_email@domain.com
   CONTACT_TO=your_contact_recipient_email@domain.com
   HUGGING_FACE_API_KEY=your_huggingface_api_token
   ```
4. Seed the database with sample products (optional):
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/ecommerce_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 💬 Chatbot Integration

The built-in chatbot helper provides AI-powered shopping assistance.
- **Endpoint**: `POST /api/chat`
- **Body**: `{ "message": "hello" }`
- **Response**: `{ "replyText": "...", "products": [...] }`

To enable smart replies, define `HUGGING_FACE_API_KEY` in the backend environment. If not provided, it falls back to custom programmatic/rule-based responses.

---

## 📄 License

This project is licensed under the MIT License.
