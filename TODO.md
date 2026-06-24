# TODO - Auth + Protected Purchase

- [x] Backend: add User model (name, email, hashed password)

- [x] Backend: add auth controller (register/login) with bcrypt + JWT

- [x] Backend: add auth middleware to verify JWT

- [x] Backend: add auth routes (/api/auth/register, /api/auth/login)

- [x] Backend: add protected order/checkout route (/api/orders/checkout)

- [x] Backend: mount auth/order routes in server.js

- [x] Backend: install dependencies (bcrypt, jsonwebtoken)

- [x] Frontend: add auth service helpers (register/login, token storage)

- [x] Frontend: add Login.jsx and Register.jsx pages

- [x] Frontend: add route protection for /cart (redirect to /login)

- [x] Frontend: update Navbar_1.jsx to show Login/Register or Logout based on auth state

- [x] Frontend: update Cart.jsx to add “Checkout/Buy” button calling protected endpoint

- [x] Frontend: run/build sanity checks

- [ ] Manual verification steps
  - [ ] Products page works without login
  - [ ] Cart/Checkout redirects to login without token
  - [ ] Register/login works and allows checkout

