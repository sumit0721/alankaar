# Development Best Practices - Step 10

This guide outlines best practices for maintaining code quality, security, and performance in the MERN project.

---

## **TABLE OF CONTENTS**

1. [Code Quality](#code-quality)
2. [Security Practices](#security-practices)
3. [Performance](#performance)
4. [Git Workflow](#git-workflow)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## **CODE QUALITY**

### **Naming Conventions**

**Files & Folders**
```
Backend:
✅ controllers/userController.js     - Camel case for JS files
✅ models/User.js                    - PascalCase for model names
✅ utils/apiError.js                 - Descriptive, lowercase
✅ config/db.js                      - Lowercase for config files

Frontend:
✅ components/ProductCard.jsx        - PascalCase for components
✅ pages/HomePage.jsx                - PascalCase for pages
✅ services/productService.js        - Camel case for utilities
✅ styles/variables.css              - Kebab-case for CSS
```

**Variables & Functions**
```javascript
// ✅ Good
const user = getUserById(userId);
const isAdminUser = user.role === 'admin';
function calculateOrderTotal(items) { }

// ❌ Bad
const u = getUserById(uID);
const admin = user.role === 'admin';
function calc(items) { }
```

### **Code Comments**

```javascript
// ✅ Good - Explains WHY, not WHAT
// Convert price from string to number for payment processing
const amountInPaisa = Math.round(parseFloat(price) * 100);

// ✅ Good - Document complex logic
/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Order ID from database
 * @param {string} paymentId - Payment ID from Razorpay
 * @param {string} signature - Signature to verify
 * @returns {boolean} True if signature is valid
 */
function verifyPaymentSignature(orderId, paymentId, signature) { }

// ❌ Bad - States obvious
const total = price * quantity; // multiply price by quantity
```

### **Code Organization**

```javascript
// ✅ Good - Organized structure
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import ApiError from '../utils/apiError.js';

export const getProducts = async (req, res, next) => { };

// ❌ Bad - Mixed concerns
const Product = require('mongoose').model('Product');
const express = require('express');
// ... all logic in one place
```

### **Error Handling**

```javascript
// ✅ Good - Specific error handling
export const getProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid product ID');
  }
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  res.json({ success: true, data: product });
});

// ❌ Bad - Generic error handling
try {
  const product = await Product.findById(req.params.id);
  res.json(product);
} catch (err) {
  res.status(500).json({ error: 'Server error' });
}
```

---

## **SECURITY PRACTICES**

### **Never Do This**

```javascript
// ❌ DANGER - Never expose secrets
const RAZORPAY_SECRET = 'rzp_live_abc123'; // NEVER hardcode!

// ❌ DANGER - Never trust user input
const query = `SELECT * FROM users WHERE email = '${email}'`; // SQL Injection!

// ❌ DANGER - Never send passwords in responses
res.json({ user: { password: user.password } }); // Exposed!

// ❌ DANGER - Never log sensitive data
logger.info('User login', { email, password }); // Logged password!
```

### **Always Do This**

```javascript
// ✅ SAFE - Use environment variables
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// ✅ SAFE - Use parameterized queries with Mongoose
const user = await User.findOne({ email: sanitizedEmail });

// ✅ SAFE - Never return sensitive data
const { password, ...userWithoutPassword } = user.toObject();
res.json({ user: userWithoutPassword });

// ✅ SAFE - Log only safe data
logger.info('User login attempt', { email: user.email });
```

### **Input Validation**

```javascript
// ✅ Good - Validate all inputs
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description } = req.body;
  
  // Validate required fields
  if (!name || !price || !description) {
    throw new ApiError(400, 'All fields are required');
  }
  
  // Validate data types
  if (typeof price !== 'number' || price <= 0) {
    throw new ApiError(400, 'Price must be a positive number');
  }
  
  // Validate string lengths
  if (name.length > 100) {
    throw new ApiError(400, 'Product name too long');
  }
  
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});
```

---

## **PERFORMANCE**

### **Backend Performance**

```javascript
// ✅ Good - Select only needed fields
const users = await User.find().select('email name -_id');

// ✅ Good - Pagination
const products = await Product.find()
  .skip((page - 1) * limit)
  .limit(limit);

// ✅ Good - Caching strategy
const cacheKey = `products_${page}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ❌ Bad - Fetches all data
const users = await User.find();

// ❌ Bad - N+1 queries
for (const order of orders) {
  const user = await User.findById(order.userId);
}
```

### **Frontend Performance**

```javascript
// ✅ Good - Lazy load routes
const ProductDetails = lazy(() => import('./pages/ProductDetailsPage'));
const Orders = lazy(() => import('./pages/OrdersPage'));

// ✅ Good - Memoize expensive calculations
const memoizedTotal = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);

// ✅ Good - Debounce search
const debouncedSearch = debounce((query) => {
  searchProducts(query);
}, 300);

// ❌ Bad - Fetch all data upfront
const allProducts = await fetch('/api/products?limit=10000');

// ❌ Bad - Recalculate on every render
const total = items.reduce((sum, item) => sum + item.price, 0);
```

---

## **GIT WORKFLOW**

### **Commit Messages**

```bash
# ✅ Good commit messages
git commit -m "feat: add product filter functionality to product listing"
git commit -m "fix: correct JWT token verification in auth middleware"
git commit -m "docs: update deployment guide with new Vercel process"
git commit -m "refactor: reorganize error handling middleware"
git commit -m "perf: optimize product query with indexing"

# ❌ Bad commit messages
git commit -m "update stuff"
git commit -m "fixes"
git commit -m "working version"
git commit -m "changes"
```

### **Branch Naming**

```bash
# ✅ Good branch names
git checkout -b feature/user-authentication
git checkout -b fix/razorpay-payment-verification
git checkout -b docs/deployment-guide
git checkout -b refactor/error-handling

# ❌ Bad branch names
git checkout -b new-feature
git checkout -b fix-something
git checkout -b mychanges
```

### **Pull Request Process**

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to remote
git push origin feature/new-feature

# 4. Create pull request on GitHub
# - Add descriptive title
# - Describe changes
# - Link related issues
# - Request reviews

# 5. After approval, merge
git checkout main
git pull origin main
git merge --no-ff feature/new-feature
git push origin main
```

---

## **API DEVELOPMENT**

### **Route Structure**

```javascript
// ✅ Good - RESTful routes
POST   /api/products              - Create product
GET    /api/products              - List products
GET    /api/products/:id          - Get product details
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product

// ✅ Good - Nested resources
GET    /api/orders/:orderId/items - Get order items
POST   /api/users/:userId/orders  - Create user order

// ❌ Bad - Non-RESTful routes
GET    /api/getProducts
POST   /api/createProduct
GET    /api/productDetails/:id
```

### **Response Format**

```javascript
// ✅ Good - Consistent response format
// Success
res.json({
  success: true,
  data: { id: 1, name: 'Product' },
  message: 'Product created successfully'
});

// Error
res.status(400).json({
  success: false,
  message: 'Invalid product data',
  errors: ['Price must be positive']
});

// ❌ Bad - Inconsistent formats
res.json(product);
res.json({ error: 'Something went wrong' });
res.json({ message: 'Created' });
```

### **Status Codes**

```javascript
// ✅ Use correct HTTP status codes
200 - OK (successful GET, PUT, DELETE)
201 - Created (successful POST)
400 - Bad Request (invalid input)
401 - Unauthorized (authentication failed)
403 - Forbidden (authenticated but not authorized)
404 - Not Found (resource doesn't exist)
409 - Conflict (duplicate email, etc.)
500 - Internal Server Error (server crash)
```

---

## **FRONTEND DEVELOPMENT**

### **Component Structure**

```javascript
// ✅ Good - Well-organized component
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ProductCard.css';

// Props validation
function ProductCard({ productId, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${productId}`);
      setProduct(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.card}>
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  );
}

export default ProductCard;
```

### **State Management**

```javascript
// ✅ Good - Use context for global state
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  
  const addToCart = useCallback((item) => {
    setCart(prev => [...prev, item]);
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ Custom hook for using context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

---

## **TESTING**

### **What to Test**

**Backend**
```javascript
// Test critical paths
✅ User authentication (login, register)
✅ Payment processing
✅ Order creation
✅ Authorization (only user can access their data)
✅ Input validation
✅ Error handling
```

**Frontend**
```javascript
✅ Page navigation works
✅ Forms submit correctly
✅ Protected routes redirect unauthorized users
✅ Data displays correctly
✅ Error messages show properly
✅ Responsive design on mobile
```

### **Manual Testing Checklist**

```markdown
## User Registration
- [ ] Register with valid email/password
- [ ] Error for duplicate email
- [ ] Error for weak password
- [ ] Redirect to login after registration

## User Login
- [ ] Login with correct credentials
- [ ] Error for wrong password
- [ ] Error for non-existent user
- [ ] JWT token stored in localStorage

## Products
- [ ] Product list loads
- [ ] Product filters work
- [ ] Product details load
- [ ] Images display correctly

## Cart
- [ ] Add item to cart
- [ ] Remove item from cart
- [ ] Update quantity
- [ ] Cart persists on page refresh

## Checkout
- [ ] Fill shipping address
- [ ] Select payment method
- [ ] Razorpay payment works
- [ ] Order created after payment

## Mobile
- [ ] Layout responsive on 320px width
- [ ] Navigation accessible on mobile
- [ ] Forms usable on mobile
- [ ] Images scale properly
```

---

## **DOCUMENTATION**

### **Code Comments Should Explain**

```javascript
// ✅ Good - Explains WHY
// Hash password with salt rounds for security
const hashedPassword = await bcrypt.hash(password, 10);

// Use Object.assign to merge without mutating original
const updatedUser = Object.assign({}, user, updates);

// ❌ Bad - Explains WHAT (code already shows this)
// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);

// Merge objects
const updatedUser = Object.assign({}, user, updates);
```

### **API Documentation**

```markdown
## Create Product

**Endpoint:** POST /api/products  
**Authentication:** Required (admin only)

### Request Body
```json
{
  "name": "Product Name",
  "price": 299.99,
  "description": "Product description",
  "category": "skincare"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "123abc",
    "name": "Product Name",
    "price": 299.99
  }
}
```

### Errors
- 400: Invalid product data
- 401: Unauthorized
- 403: Forbidden (not admin)
```

---

## **DEPLOYMENT CHECKLIST**

Before deploying to production:

```bash
# Code Quality
- [ ] No console.log statements
- [ ] No hardcoded credentials
- [ ] All error messages are user-friendly
- [ ] Code is properly formatted

# Security
- [ ] All inputs validated
- [ ] Sensitive data not exposed
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers enabled

# Performance
- [ ] Bundle size optimized
- [ ] Database queries indexed
- [ ] No N+1 queries
- [ ] Caching implemented

# Testing
- [ ] Manual testing completed
- [ ] All critical flows work
- [ ] Mobile responsive
- [ ] Error handling works

# Documentation
- [ ] README updated
- [ ] API docs up to date
- [ ] Environment variables documented
- [ ] Deployment process documented
```

---

## **Key Takeaways**

1. **Code Quality**: Clear naming, good structure, proper comments
2. **Security**: Never trust user input, use environment variables, validate everything
3. **Performance**: Paginate results, optimize queries, lazy load routes
4. **Git**: Meaningful commits, descriptive branches, code reviews
5. **Testing**: Test critical paths manually before deployment
6. **Documentation**: Document WHY, not WHAT

---

**Remember: Good code is not just code that works, it's code that others can understand and maintain!**
