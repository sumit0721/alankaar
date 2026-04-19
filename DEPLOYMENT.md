# DEPLOYMENT GUIDE - Step 10 Final Polish

This guide covers everything you need to deploy your cosmetic brand website to production.

---

## **TABLE OF CONTENTS**

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Security Best Practices](#security-best-practices)

---

## **PRE-DEPLOYMENT CHECKLIST**

Before deploying, ensure you have:

- [ ] All code committed to version control (Git)
- [ ] `.env` files added to `.gitignore` (never commit secrets)
- [ ] Environment variables configured for production
- [ ] Razorpay production credentials ready
- [ ] MongoDB Atlas production cluster created
- [ ] Domain name registered (if using custom domain)
- [ ] SSL certificate ready (most hosting provides this)
- [ ] Tested payment flow with Razorpay sandbox
- [ ] Tested all user flows (signup, login, checkout, order)
- [ ] Performance tested with load testing tools

---

## **BACKEND DEPLOYMENT**

### **Option 1: Deploy to Heroku (Easy for beginners)**

**Step 1: Create Heroku Account**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login
```

**Step 2: Create Heroku App**
```bash
# From backend directory
cd backend
heroku create your-app-name
```

**Step 3: Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_long_random_secret_string
heroku config:set CLIENT_URL=https://your-frontend-domain.com
heroku config:set RAZORPAY_KEY_ID=your_production_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_production_secret_key
```

**Step 4: Add Procfile**
Create `backend/Procfile`:
```
web: node src/server.js
```

**Step 5: Deploy**
```bash
git push heroku main
heroku logs --tail  # View logs
```

---

### **Option 2: Deploy to Railway.app (Modern Alternative)**

**Step 1: Connect GitHub Repository**
- Go to https://railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"
- Select your repository

**Step 2: Configure Environment Variables**
In Railway dashboard:
- Add each environment variable
- Click "Deploy" to trigger deployment

---

### **Option 3: Deploy to AWS EC2 (More Control)**

**Step 1: Launch EC2 Instance**
```bash
# Choose Node.js compatible AMI (Ubuntu 22.04 recommended)
```

**Step 2: Connect via SSH**
```bash
ssh -i your-key.pem ubuntu@your-ec2-instance
```

**Step 3: Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (for process management)
sudo npm install -g pm2

# Install MongoDB CLI tools (if needed)
sudo apt-get install -y mongodb-clients
```

**Step 4: Clone Repository**
```bash
cd /home/ubuntu
git clone your-repository-url
cd your-repo/backend
npm install
```

**Step 5: Create .env File**
```bash
# Create and edit .env with production values
nano .env
```

**Step 6: Start with PM2**
```bash
pm2 start src/server.js --name "cosmetic-api"
pm2 startup
pm2 save
```

**Step 7: Configure Nginx (Reverse Proxy)**
```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/your-domain
```

Add this config:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 8: Setup SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## **FRONTEND DEPLOYMENT**

### **Option 1: Deploy to Vercel (Easiest for React)**

**Step 1: Push Code to GitHub**
```bash
git push origin main
```

**Step 2: Connect Vercel**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Select `frontend` folder as root directory

**Step 3: Set Environment Variables**
In Vercel dashboard:
```
VITE_API_URL=https://your-backend-domain.com/api
```

**Step 4: Deploy**
Vercel automatically deploys on push to main branch

---

### **Option 2: Deploy to Netlify**

**Step 1: Build Frontend**
```bash
cd frontend
npm run build
```

**Step 2: Connect to Netlify**
- Go to https://netlify.com
- Drag and drop the `dist` folder, or
- Connect GitHub repository

**Step 3: Configure Build Settings**
```
Build command: npm run build
Publish directory: dist
```

**Step 3: Set Environment Variables**
```
VITE_API_URL=https://your-backend-domain.com/api
```

---

### **Option 3: Deploy to AWS S3 + CloudFront**

**Step 1: Build Frontend**
```bash
cd frontend
npm run build
```

**Step 2: Create S3 Bucket**
```bash
aws s3 mb s3://your-website-bucket
```

**Step 3: Upload Build Files**
```bash
aws s3 sync dist/ s3://your-website-bucket --delete
```

**Step 4: Enable Static Website Hosting**
```bash
aws s3 website s3://your-website-bucket --index-document index.html --error-document index.html
```

**Step 5: Setup CloudFront Distribution**
- Use CloudFront for CDN
- Point to S3 bucket origin

---

## **DATABASE SETUP**

### **MongoDB Atlas (Recommended for Cloud)**

**Step 1: Create Account**
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free account

**Step 2: Create Cluster**
- Click "Create a Deployment"
- Choose free tier
- Select region closest to your users

**Step 3: Create Database User**
- In "Database Access" tab
- Create username and password
- Save credentials securely

**Step 4: Add IP Whitelist**
- In "Network Access" tab
- Add your production IP addresses
- Add `0.0.0.0/0` only if necessary (less secure)

**Step 5: Get Connection String**
- Click "Connect"
- Copy "MongoDB URI"
- Add to your `.env.production`

---

## **ENVIRONMENT VARIABLES**

### **Backend (.env.production)**

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmetic_brand?retryWrites=true&w=majority

# JWT Secret (Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_long_random_secret_string_min_32_characters

# Frontend URL
CLIENT_URL=https://your-frontend-domain.com

# Razorpay Production Keys
RAZORPAY_KEY_ID=rzp_live_your_production_key
RAZORPAY_KEY_SECRET=your_production_secret_key
```

### **Frontend (.env.production)**

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### **Generate Secure JWT Secret**
```bash
# In Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## **MONITORING & MAINTENANCE**

### **Backend Monitoring**

**1. Using PM2**
```bash
pm2 status
pm2 logs cosmetic-api
pm2 monit
```

**2. Setup Monitoring Dashboard**
```bash
# Install PM2 Plus (paid but has free tier)
pm2 plus
```

**3. Monitor Uptime**
- Use UptimeRobot (https://uptimerobot.com)
- Add health check: `https://your-api.com/api/health`

### **Frontend Performance**

**1. Use Web Vitals Monitoring**
```javascript
// Add to frontend/src/main.jsx
import { reportWebVitals } from './utils/reportWebVitals';
reportWebVitals(console.log);
```

**2. Monitor with Google Analytics**
- Add tracking ID to frontend
- Monitor user behavior and performance

**3. Use Sentry for Error Tracking**
```bash
npm install @sentry/react
```

### **Database Backups**

**MongoDB Atlas:**
- Automatic backups enabled (free tier: 7-day retention)
- Manual backups available in admin panel

**Manual Backup:**
```bash
# Download backup from MongoDB Atlas admin panel
```

---

## **SECURITY BEST PRACTICES**

### **1. Environment Variables**
✅ Never commit `.env` files  
✅ Use different secrets for each environment  
✅ Rotate secrets regularly  
✅ Use strong, random JWT secrets (min 32 characters)  

### **2. HTTPS/SSL**
✅ Always use HTTPS in production  
✅ Get free SSL from Let's Encrypt  
✅ Auto-renew certificates  

### **3. Database**
✅ Use strong MongoDB user passwords  
✅ Whitelist only necessary IPs  
✅ Enable authentication always  
✅ Regular backups  

### **4. API Security**
✅ Use rate limiting (already in app.js)  
✅ Use Helmet for security headers (already in app.js)  
✅ Validate all inputs  
✅ Use CORS properly  
✅ Keep dependencies updated  

### **5. Payment Security**
✅ Never expose secret keys on frontend  
✅ Always verify payments on backend  
✅ Use Razorpay production keys  
✅ Enable webhook signatures  

### **6. Regular Maintenance**
```bash
# Update dependencies monthly
npm update
npm audit fix

# Check for vulnerabilities
npm audit

# Monitor logs regularly
pm2 logs

# Check server health
curl https://your-api.com/api/health
```

---

## **POST-DEPLOYMENT CHECKLIST**

- [ ] Backend API responding on production domain
- [ ] Frontend loading on production domain
- [ ] HTTPS working on both frontend and backend
- [ ] Login/Register flows working
- [ ] Product listing and details loading
- [ ] Cart functionality working
- [ ] Checkout process complete
- [ ] Razorpay payment processing successfully
- [ ] Email notifications sent (if configured)
- [ ] Error logs being captured
- [ ] Performance acceptable
- [ ] Mobile responsive design working
- [ ] All third-party services connected

---

## **TROUBLESHOOTING**

### **Backend Issues**

**Problem: Server crashes immediately**
```bash
# Check logs
heroku logs --tail
pm2 logs

# Verify environment variables are set
heroku config
```

**Problem: Database connection fails**
```bash
# Test connection string
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI')"

# Check IP whitelist in MongoDB Atlas
# Check firewall rules
```

### **Frontend Issues**

**Problem: API calls return 404**
```
// Check VITE_API_URL in frontend .env
// Verify backend is running
// Check CORS configuration on backend
```

**Problem: Build fails**
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## **NEXT STEPS**

1. **Monitor in Production**: Use tools like UptimeRobot, Sentry, Google Analytics
2. **Gather User Feedback**: Track issues and user behavior
3. **Plan Updates**: Create roadmap for new features
4. **Scale When Needed**: Use CDN, database optimization, caching
5. **Keep Learning**: Stay updated with Node.js, React, and security practices

---

**Congratulations! Your website is now in production! 🎉**

For questions about deployment, refer to specific hosting provider documentation.
