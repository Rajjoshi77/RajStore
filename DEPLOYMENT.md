# RajStore — Full Production Deployment Guide

This guide outlines the production deployment strategy, environment configurations, and build workflows for both the React frontend and Express backend.

---

## ⚠️ Security First (Git & Environments)

Before pushing any code to production or staging environments:
- **Never commit production environment files** (`.env`, `.env.production`). Ensure they are listed in your `.gitignore` files.
- All secrets, API keys, and database connection strings must be configured directly in your hosting provider's dashboard (e.g., Render, Vercel, Railway) as **Environment Variables**.

---

## 🌐 Production Architecture

For optimal performance and scalability, it is recommended to deploy the frontend and backend as two separate services:
1. **Backend Service**: Deployed on a platform like **Render**, **Railway**, or **Heroku**.
2. **Frontend Service**: Deployed on a static site host like **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 1. Backend Deployment

### Recommended Platform: [Render](https://render.com) or [Railway](https://railway.app)

#### Steps:
1. Create a new **Web Service** on Render/Railway and connect it to your GitHub repository.
2. Set the **Root Directory** to `backend`.
3. Configure the following build settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add the following **Environment Variables** in the provider's dashboard (do not upload your `.env` file):

| Variable Name | Description / Recommended Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (or leave default assigned by provider) |
| `MONGO_URI` | Production MongoDB connection string (Atlas) |
| `RAZORPAY_KEY_ID` | Live/Test Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Live/Test Razorpay API secret key |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | Admin sender email address |
| `SMTP_PASS` | Admin sender email app password |
| `SENDGRID_API_KEY` | Production SendGrid API Key |
| `SENDGRID_FROM` | Verified SendGrid sender email address |
| `CONTACT_TO` | Target email address to receive contact form submissions |
| `HUGGING_FACE_API_KEY` | Hugging Face Access Token for chatbot |

---

## 2. Frontend Deployment

### Recommended Platform: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

#### Steps:
1. Create a new project on Vercel/Netlify and connect it to your GitHub repository.
2. Set the **Root Directory** to `frontend/ecommerce_frontend`.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Update the backend API URL in your code for production. Make sure the Axios instance (`services/api.js` and `services/chatApi.js`) dynamically uses the production URL:
   - Example `api.js` URL configuration:
     ```javascript
     const API = axios.create({
       baseURL: import.meta.env.PROD 
         ? "https://your-backend-service-url.onrender.com/api" 
         : "http://localhost:5000/api"
     });
     ```
5. Set up **Environment Variables** (if any, such as specific frontend public keys).
6. **SPA Routing Configuration**:
   Since this is a Single Page Application (SPA) using React Router, direct visits to subpages (like `/cart` or `/login`) will return a 404 error on page refresh unless configured correctly:
   - **For Vercel**: Create a `vercel.json` file inside `frontend/ecommerce_frontend/` with:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/" }
       ]
     }
     ```
   - **For Netlify**: Create a `_redirects` file inside `frontend/ecommerce_frontend/public/` containing:
     ```
     /*    /index.html   200
     ```

---

## 3. Database Production Readiness

1. **MongoDB Atlas IP Access List**:
   In MongoDB Atlas, navigate to **Network Access** and add `0.0.0.0/0` (allow access from anywhere) or whitelist the specific outbound IPs of your backend hosting server so it can establish database connections securely.
2. **CORS Policy Setup**:
   Ensure `cors` configuration in your `backend/server.js` includes the deployed URL of your frontend to prevent Cross-Origin Resource Sharing blocks:
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? 'https://your-frontend-site.vercel.app' 
       : 'http://localhost:5173',
     credentials: true
   }));
   ```
