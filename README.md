# Cosmetic Brand MERN Website - Complete Project

A production-ready, full-stack e-commerce website for a cosmetic brand built with MERN (MongoDB, Express, React, Node.js).

## 📋 Project Overview

This project demonstrates a complete MERN stack implementation with:

- **Modern Frontend**: React 18 with React Router for navigation
- **Robust Backend**: Express.js with middleware, error handling, and security
- **Database**: MongoDB Atlas for data persistence
- **Authentication**: JWT-based user authentication and authorization
- **Payment Processing**: Razorpay integration for secure payments
- **Responsive Design**: Mobile-first, fully responsive UI
- **Production Ready**: Security, performance optimization, and error handling

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm 9+
- MongoDB Atlas account (free tier available)
- Razorpay account (sandbox for testing)
- Git for version control

### **Installation**

**1. Clone Repository**
```bash
git clone your-repository-url
cd alankaar-project
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Update with your credentials
npm run dev          # Development server on port 5000
```

**3. Frontend Setup (new terminal)**
```bash
cd frontend
npm install
npm run dev          # Development server on port 5173
```

**4. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## 🗂️ Project Structure

```
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── app.js            # Express app configuration
│   │   ├── server.js         # Server entry point
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── utils/            # Helper functions
│   │   └── seed/             # Database seeding
│   ├── .env                  # Environment variables (not in repo)
│   ├── .env.example          # Template for env variables
│   ├── .env.production       # Production env template
│   └── package.json          # Dependencies
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Root component with routing
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── context/         # React Context (Auth, Cart)
│   │   ├── styles/          # Global styles
│   │   └── utils/           # Helper functions
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   ├── .env.example         # Template for env variables
│   ├── .env.production      # Production env template
│   └── package.json         # Dependencies
│
├── DEPLOYMENT.md            # Deployment guide (Step 10)
└── README.md               # This file
```

---

## 📚 Features Implemented

### **User Management**
✅ User Registration with validation  
✅ User Login with JWT authentication  
✅ Protected routes and API endpoints  
✅ User session persistence with localStorage  

### **Products**
✅ Product listing with filtering  
✅ Product details page  
✅ Product categories  
✅ Search functionality  

### **Shopping**
✅ Add/remove items from cart  
✅ Cart persistence with localStorage  
✅ Quantity updates  
✅ Real-time price calculations  

### **Orders**
✅ Checkout process  
✅ Order creation with items and shipping  
✅ Order history view  
✅ Order details page  

### **Payments**
✅ Razorpay integration (sandbox mode)  
✅ Payment verification  
✅ Order status updates after payment  
✅ Payment error handling  

### **Security & Performance**
✅ CORS configuration  
✅ Rate limiting on auth endpoints  
✅ Helmet security headers  
✅ Input validation and sanitization  
✅ Error handling and logging  
✅ Password hashing with bcrypt  
✅ JWT token-based authentication  

---

## 🔧 Technology Stack

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 5.0+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: helmet, express-rate-limit
- **Logging**: Morgan
- **Payment**: Razorpay SDK
- **ORM**: Mongoose

### **Frontend**
- **Framework**: React 18+
- **Build Tool**: Vite 6+
- **Routing**: React Router 7+
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: CSS3

### **Database**
- **Cloud Database**: MongoDB Atlas
- **Collections**: Users, Products, Orders, Carts

---

## 🔑 Environment Variables

### **Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📖 API Endpoints

### **Authentication**
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - User login
GET    /api/auth/me            - Get current user (protected)
```

### **Products**
```
GET    /api/products           - Get all products
GET    /api/products/:id       - Get product details
```

### **Cart**
```
GET    /api/cart               - Get user's cart (protected)
POST   /api/cart               - Add item to cart (protected)
PUT    /api/cart/:itemId       - Update cart item (protected)
DELETE /api/cart/:itemId       - Remove cart item (protected)
```

### **Orders**
```
POST   /api/orders             - Create new order (protected)
GET    /api/orders             - Get user's orders (protected)
GET    /api/orders/:id         - Get order details (protected)
```

### **Payments**
```
POST   /api/payments/razorpay/order   - Create Razorpay order (protected)
POST   /api/payments/razorpay/verify  - Verify payment (protected)
```

---

## 🧪 Testing the Application

### **Test User Flow**

**1. Register New User**
```
Navigate to /register
Email: test@example.com
Password: Password123
```

**2. Login**
```
Navigate to /login
Email: test@example.com
Password: Password123
```

**3. Browse Products**
```
Go to /products
Click on any product for details
```

**4. Add to Cart**
```
On product details page
Click "Add to Cart"
Go to /cart to view items
```

**5. Checkout**
```
From cart page
Click "Proceed to Checkout"
Fill shipping details
Select payment method
```

**6. Payment (Sandbox)**
```
Use Razorpay test credentials
Test card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

---

## 🐛 Troubleshooting

### **Backend Issues**

**Port 5000 already in use**
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**MongoDB connection fails**
```
Check MONGODB_URI in .env
Verify MongoDB Atlas IP whitelist
Ensure database user credentials are correct
```

**API returns 500 error**
```
Check backend logs
Verify environment variables are set
Check database connection
```

### **Frontend Issues**

**API requests return 404**
```
Verify VITE_API_URL environment variable
Check backend is running
Verify API routes in backend
```

**CORS errors**
```
Check CORS configuration in backend/src/app.js
Verify CLIENT_URL matches frontend domain
Check Authorization header in requests
```

---

## 📈 Performance Optimization

### **Frontend Optimizations**
- ✅ Code splitting with Vite
- ✅ Lazy loading of routes
- ✅ Minified production builds
- ✅ CSS module optimization
- ✅ Image optimization recommendations

### **Backend Optimizations**
- ✅ Express middleware optimization
- ✅ MongoDB indexing
- ✅ Payload size limits
- ✅ Request compression
- ✅ Caching strategies (implement as needed)

### **Database Optimization**
- ✅ Proper indexing on frequently queried fields
- ✅ Connection pooling (MongoDB Atlas)
- ✅ Query optimization

---

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Rate limiting on auth endpoints
- ✅ Helmet security headers
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak sensitive info
- ✅ Environment variables for secrets
- ✅ HTTPS enforced in production
- ✅ SQL injection prevention (using Mongoose)

---

## 📝 Step-by-Step Development Process (Summary)

This project was built following a structured approach:

1. **Step 1**: Project planning and folder structure
2. **Step 2**: Backend setup with Express
3. **Step 3**: Frontend setup with React
4. **Step 4**: API development (CRUD operations)
5. **Step 5**: Frontend-Backend integration
6. **Step 6**: Authentication implementation
7. **Step 7**: UI component development
8. **Step 8**: Cart and order management
9. **Step 9**: Payment integration with Razorpay
10. **Step 10**: Final polish, optimization, and deployment (this step)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guidelines.

---

## 🚀 Deployment

For comprehensive deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick Deploy Options:**
- Vercel (Frontend) + Heroku/Railway (Backend)
- AWS S3 + CloudFront (Frontend) + EC2 (Backend)
- Netlify (Frontend) + Firebase (Backend)

---

## 📚 Learning Resources

### **MERN Stack**
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### **Security**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### **Performance**
- [Web Vitals](https://web.dev/vitals/)
- [Vite Documentation](https://vitejs.dev)
- [MongoDB Performance](https://docs.mongodb.com/manual/administration/optimization/)

---

## 📞 Support & Maintenance

### **Regular Maintenance Tasks**
- Update dependencies monthly
- Review security logs weekly
- Monitor error rates daily
- Backup database regularly

### **Scaling Considerations**
- Implement caching (Redis)
- Use CDN for static assets
- Database replication for high availability
- Load balancing for multiple servers

---

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

---

## 🎓 Key Learnings

By completing this project, you've learned:

✅ Full-stack web development with MERN  
✅ RESTful API design and implementation  
✅ Database design and MongoDB usage  
✅ User authentication and authorization  
✅ Payment processing integration  
✅ Responsive web design  
✅ Production deployment strategies  
✅ Security best practices  
✅ Error handling and logging  
✅ Code organization and modular design  

---

**Congratulations! You've built a production-ready cosmetic brand website! 🎉**

Keep learning, keep building, and keep pushing your limits!

---

*Last Updated: April 2026*  
*Project Status: Production Ready ✅*
