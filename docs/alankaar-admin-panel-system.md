# Alankaar Admin Panel System

## Product Goal

Alankaar should evolve from a customer-facing cosmetic MERN store into a business operating system for a beauty brand. The admin panel should feel closer to Shopify Admin, Stripe Dashboard, Nykaa Seller Panel, Linear, and Vercel than a college CRUD screen.

The current app already has a separate Vite React frontend and Express/MongoDB backend with products, users, orders, auth, Razorpay, rate limiting, and Helmet. The next step is to introduce an admin surface as a modular dashboard that can grow without disturbing the storefront.

## Recommended Architecture

Use one backend API and split the frontend into customer and admin route groups first. Move to a separate admin frontend only when the admin bundle, team workflow, or permissions justify it.

```txt
Alankaar
├─ frontend
│  ├─ src
│  │  ├─ app
│  │  │  ├─ customer
│  │  │  └─ admin
│  │  ├─ components
│  │  │  ├─ ui
│  │  │  ├─ charts
│  │  │  ├─ data-table
│  │  │  └─ forms
│  │  ├─ features
│  │  │  ├─ auth
│  │  │  ├─ dashboard
│  │  │  ├─ products
│  │  │  ├─ inventory
│  │  │  ├─ orders
│  │  │  ├─ customers
│  │  │  ├─ content
│  │  │  ├─ coupons
│  │  │  ├─ reviews
│  │  │  ├─ analytics
│  │  │  └─ ai-insights
│  │  ├─ hooks
│  │  ├─ lib
│  │  ├─ services
│  │  ├─ store
│  │  ├─ types
│  │  └─ utils
│  └─ package.json
└─ backend
   ├─ src
   │  ├─ config
   │  ├─ controllers
   │  │  ├─ admin
   │  │  └─ customer
   │  ├─ jobs
   │  ├─ middleware
   │  ├─ models
   │  ├─ routes
   │  │  ├─ admin
   │  │  └─ public
   │  ├─ services
   │  ├─ validators
   │  └─ utils
   └─ package.json
```

## Frontend Stack

Target stack:

- React + Vite initially, TypeScript migration module by module
- Tailwind CSS + shadcn/ui for dashboard primitives
- Framer Motion for route/page polish and card transitions
- Recharts for revenue, retention, growth, and product analytics
- Zustand for admin UI state, filters, selected rows, theme, and auth session metadata
- TanStack Query for server state, cache invalidation, optimistic updates, pagination, and background refetching
- React Hook Form + Zod for forms and validation
- TanStack Table for enterprise-grade data tables

Suggested packages:

```txt
@tanstack/react-query
@tanstack/react-table
zustand
zod
react-hook-form
@hookform/resolvers
recharts
framer-motion
lucide-react
date-fns
sonner
cmdk
class-variance-authority
clsx
tailwind-merge
```

## Backend Stack

Keep Express and MongoDB, then introduce clear service boundaries.

Suggested packages:

```txt
cookie-parser
express-mongo-sanitize
sanitize-html
zod
multer
cloudinary
sharp
csurf
compression
express-slow-down
nodemailer
ua-parser-js
```

Use service classes for business logic:

```txt
ProductService
InventoryService
OrderService
CustomerService
AnalyticsService
ContentService
CouponService
ReviewModerationService
AdminAuthService
AiInsightService
FileUploadService
AuditLogService
```

## Admin Roles And Permissions

Replace the current `isAdmin` boolean with a role and permissions model.

```js
roles: ["super_admin", "manager", "staff", "content_editor"]
permissions: [
  "dashboard:read",
  "products:read",
  "products:write",
  "products:delete",
  "orders:read",
  "orders:update",
  "customers:read",
  "customers:update",
  "content:write",
  "coupons:write",
  "reports:export",
  "admins:manage"
]
```

Recommended access:

- `super_admin`: all permissions, billing, admin management, deletion
- `manager`: products, orders, reports, customers, coupons
- `staff`: orders, inventory, support workflows
- `content_editor`: banners, homepage sections, blogs, FAQs, testimonials

## Database Schema Design

### User

Extend the existing user model:

```js
{
  name,
  email,
  password,
  role,
  permissions,
  status: "active" | "banned" | "pending",
  phone,
  addresses: [],
  lastLoginAt,
  passwordChangedAt,
  refreshTokenHash,
  resetPasswordTokenHash,
  resetPasswordExpiresAt,
  cartItems,
  customerTags,
  lifetimeValue,
  orderCount
}
```

### Product

Upgrade the current product model for cosmetics:

```js
{
  name,
  slug,
  description,
  shortDescription,
  brand,
  category,
  subCategory,
  price,
  compareAtPrice,
  costPrice,
  sku,
  barcode,
  status: "draft" | "published" | "archived",
  featured,
  images: [{ url, publicId, alt, sortOrder }],
  variants: [{
    shadeName,
    shadeHex,
    size,
    sku,
    price,
    stock,
    lowStockThreshold
  }],
  skinTypes: ["oily", "dry", "combination", "sensitive", "normal"],
  ingredients: [],
  benefits: [],
  usageInstructions,
  tags: [],
  seo: { title, description, keywords },
  rating,
  numReviews,
  salesCount,
  viewCount
}
```

### Order

Extend the current order model:

```js
{
  user,
  orderNumber,
  orderItems,
  shippingAddress,
  billingAddress,
  paymentMethod,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  fulfillmentStatus: "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded",
  timeline: [{ status, note, actor, createdAt }],
  subtotal,
  discountTotal,
  taxPrice,
  shippingPrice,
  totalPrice,
  couponCode,
  tracking: { carrier, trackingNumber, trackingUrl },
  invoice: { number, url, generatedAt },
  refund: { amount, reason, processedAt }
}
```

### Additional Collections

```txt
InventoryMovement
Category
Brand
Coupon
Review
Banner
HomeSection
BlogPost
Faq
Testimonial
AuditLog
AdminSession
ReportExport
AiInsight
Notification
```

## Indexing Strategy

Use indexes for admin search, filtering, reports, and uniqueness.

```js
User: email unique, role, status, createdAt, lifetimeValue
Product: slug unique, sku unique sparse, category, brand, status, featured, salesCount, createdAt
Product text: name, description, brand, category, tags
Order: orderNumber unique, user, paymentStatus, fulfillmentStatus, createdAt, totalPrice
Coupon: code unique, isActive, expiresAt
Review: product, user, status, rating, createdAt
AuditLog: actor, action, resourceType, createdAt
```

For analytics dashboards, add compound indexes:

```js
Order: { createdAt: -1, paymentStatus: 1 }
Order: { fulfillmentStatus: 1, createdAt: -1 }
Product: { status: 1, countInStock: 1 }
```

## Backend API Routes

Prefix admin APIs with `/api/admin`.

```txt
POST   /api/admin/auth/login
POST   /api/admin/auth/refresh
POST   /api/admin/auth/logout
POST   /api/admin/auth/forgot-password
POST   /api/admin/auth/reset-password
GET    /api/admin/me
PATCH  /api/admin/me

GET    /api/admin/dashboard/summary
GET    /api/admin/dashboard/revenue
GET    /api/admin/dashboard/sales
GET    /api/admin/dashboard/inventory-alerts
GET    /api/admin/dashboard/recent-orders

GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
PATCH  /api/admin/products/:id/status
PATCH  /api/admin/products/:id/featured
POST   /api/admin/products/bulk

GET    /api/admin/inventory
PATCH  /api/admin/inventory/:productId
GET    /api/admin/inventory/movements

GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status
POST   /api/admin/orders/:id/refund
POST   /api/admin/orders/:id/invoice
GET    /api/admin/orders/export

GET    /api/admin/customers
GET    /api/admin/customers/:id
PATCH  /api/admin/customers/:id/status
PATCH  /api/admin/customers/:id/role

GET    /api/admin/content/banners
POST   /api/admin/content/banners
PATCH  /api/admin/content/banners/:id
DELETE /api/admin/content/banners/:id

GET    /api/admin/coupons
POST   /api/admin/coupons
PATCH  /api/admin/coupons/:id
DELETE /api/admin/coupons/:id

GET    /api/admin/reviews
PATCH  /api/admin/reviews/:id/approve
PATCH  /api/admin/reviews/:id/reject
DELETE /api/admin/reviews/:id

GET    /api/admin/analytics/revenue
GET    /api/admin/analytics/products
GET    /api/admin/analytics/customers
GET    /api/admin/analytics/retention
GET    /api/admin/analytics/export

GET    /api/admin/ai/insights
POST   /api/admin/ai/product-description
POST   /api/admin/ai/sales-prediction
POST   /api/admin/ai/inventory-risk

POST   /api/admin/uploads/image
DELETE /api/admin/uploads/image/:publicId
```

## Authentication Flow

1. Admin submits email and password.
2. Backend validates credentials and role.
3. Backend returns short-lived access token and sets refresh token in a secure, HTTP-only cookie.
4. Frontend stores only safe profile/session metadata in Zustand.
5. API client sends access token in memory.
6. On `401`, client calls refresh endpoint once, retries original request, then logs out if refresh fails.
7. Password reset stores only hashed reset tokens.
8. Admin actions write `AuditLog` entries.

Cookie settings:

```txt
httpOnly: true
secure: true in production
sameSite: "none" for separate Vercel/Railway domains
path: "/api/admin/auth/refresh"
```

## Security Middleware

Backend middleware stack:

```txt
helmet
cors allowlist
express.json with size limit
rateLimit global
strict auth rateLimit
express-mongo-sanitize
xss/sanitize-html on rich fields
CSRF for cookie refresh/logout flows
JWT access verification
RBAC permission guard
request validation
audit logging
centralized error handler
```

Use route-level permission guards:

```js
router.post(
  "/products",
  protectAdmin,
  requirePermission("products:write"),
  validate(createProductSchema),
  createProduct
);
```

## Admin Dashboard UI

Best layout:

- Collapsible left sidebar with icon-first navigation
- Top command bar with global search, store switcher, notifications, theme toggle, profile menu
- Breadcrumbs under top bar for nested pages
- Main content uses dense, calm SaaS spacing
- Tables have saved views, filters, search, pagination, row actions, bulk actions
- Forms use drawer/modal for quick edits and full pages for complex product creation

Primary nav:

```txt
Overview
Products
Inventory
Orders
Customers
Content
Coupons
Reviews
Analytics
AI Insights
Settings
```

Dashboard sections:

```txt
Revenue, Orders, Customers, Products, Conversion Rate
Monthly Revenue Graph
Weekly Sales Chart
Top Products
Recent Orders
Pending Shipments
Low Stock Alerts
Out of Stock Alerts
Customer Growth
AI Insight Cards
```

## Reusable Component Strategy

Create small dashboard primitives:

```txt
AdminShell
Sidebar
Topbar
Breadcrumbs
PageHeader
MetricCard
ChartCard
DataTable
FilterBar
StatusBadge
RoleBadge
EmptyState
ConfirmDialog
FormDrawer
ImageUploader
RichTextField
DateRangePicker
BulkActionBar
PermissionGate
ErrorBoundary
SkeletonCard
```

Feature pages should compose primitives instead of owning layout details.

## Product Management UX

Product editor tabs:

```txt
Basics
Images
Variants
Inventory
Cosmetic Details
SEO
Publishing
```

Cosmetic-specific fields:

```txt
Shade name
Shade color swatch
Skin type tags
Ingredient list
Benefits
Usage instructions
Patch-test warning
Cruelty-free / vegan / paraben-free badges
```

Bulk actions:

```txt
Publish
Unpublish
Mark featured
Update category
Update stock threshold
Delete
Export selected
```

## Order Management UX

Order detail page:

```txt
Customer summary
Payment status
Fulfillment status
Order timeline
Purchased items
Shipping address
Tracking details
Invoice action
Refund action
Internal notes
```

Status workflow:

```txt
Pending -> Processing -> Packed -> Shipped -> Delivered
Pending/Processing -> Cancelled
Delivered/Paid -> Refunded
```

Every transition should append to `timeline` and `AuditLog`.

## Analytics And Reports

Core reports:

```txt
Revenue by date range
Average order value
Refund rate
Best-selling products
Slow-moving inventory
Low-stock products
Customer retention
Repeat purchase rate
Coupon performance
Category performance
```

Use MongoDB aggregation pipelines for the first version. Cache expensive dashboard summaries for 1 to 5 minutes.

## AI Features

Make AI features practical and explainable:

```txt
Sales prediction by category/product
Inventory risk score based on velocity and stock
Product description generator using brand tone
Trending products analysis
Customer segment insights
Review sentiment summary
Support chatbot analytics dashboard
```

Store generated outputs in `AiInsight` so the dashboard is fast and auditable.

```js
{
  type: "inventory_risk" | "sales_prediction" | "description" | "customer_behavior",
  entityType,
  entityId,
  promptVersion,
  inputHash,
  result,
  confidence,
  createdBy,
  createdAt
}
```

## Caching Strategy

Frontend:

- TanStack Query cache per feature
- Background refetch for dashboard cards
- Optimistic updates for status toggles
- Debounced search
- Keep previous data for paginated tables

Backend:

- In-memory cache for low-risk dashboard summaries first
- Redis later for multi-instance Railway deployments
- Cache keys by date range, role, and filters
- Invalidate product/order/customer caches after writes

Recommended TTL:

```txt
Dashboard cards: 60 seconds
Revenue charts: 5 minutes
Product table pages: 30 seconds
Content CMS: 5 minutes
AI insights: persisted, refresh on demand
```

## File Upload Optimization

Cloudinary flow:

1. Admin selects images.
2. Frontend validates type, size, and dimensions.
3. Upload through backend signed endpoint or direct signed Cloudinary upload.
4. Backend stores `url`, `secure_url`, `publicId`, `width`, `height`, `alt`, `sortOrder`.
5. Use Cloudinary transformations for thumbnails, table previews, product gallery, and hero banners.

Rules:

```txt
Use WebP/AVIF delivery where possible
Generate 300px table thumbnails
Generate 800px product cards
Generate 1600px hero banners
Reject files above 5MB before upload
Allow drag sorting for gallery images
Delete unused public IDs after product update
```

## Performance And Scalability

Frontend:

- Lazy-load admin routes
- Split charts and rich editor into separate chunks
- Use virtualized tables if rows exceed 500
- Debounce search at 300ms
- Keep chart payloads aggregated, not raw orders
- Add error boundaries per route group

Backend:

- Paginate every list endpoint
- Limit response fields with projections
- Use aggregation pipelines for analytics
- Add audit logging asynchronously
- Add background jobs for report exports and AI refresh
- Avoid populating large documents in table endpoints

## Deployment Strategy

Vercel:

- Keep existing customer frontend
- Add `/admin` route group
- Configure `VITE_API_BASE_URL` to Railway API URL
- Protect admin routes client-side and server-side through API auth

Railway:

- Keep one Express app
- Add admin route group
- Configure Cloudinary, JWT, refresh token, SMTP, and optional AI provider env vars
- Enable MongoDB connection pooling
- Add health check at `/api/health`

Environment variables:

```txt
CLIENT_URL
ADMIN_CLIENT_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SMTP_HOST
SMTP_USER
SMTP_PASS
AI_PROVIDER_API_KEY
```

## Implementation Roadmap

### Phase 1: Admin Foundation

- Add role and permission fields to users
- Add admin auth routes
- Add `protectAdmin` and `requirePermission`
- Add admin shell, sidebar, topbar, protected routes
- Add dashboard summary API and cards

### Phase 2: Products And Inventory

- Expand product schema
- Add product CRUD APIs
- Add image upload service
- Add product table, filters, editor, gallery, variants
- Add low-stock and out-of-stock alerts

### Phase 3: Orders And Customers

- Add order statuses and timeline
- Add order table and order details page
- Add customer table, detail page, ban/unban, purchase history
- Add invoice generation and CSV export

### Phase 4: CMS And Marketing

- Add banners, homepage sections, blog, FAQs, testimonials
- Add coupon schema and campaign tools
- Add review moderation

### Phase 5: Analytics And AI

- Add report endpoints
- Add chart views and export jobs
- Add AI insight generator services
- Add product description generation and inventory risk scoring

### Phase 6: Production Hardening

- Add tests for auth, RBAC, product writes, order transitions
- Add audit logs
- Add Redis cache if traffic grows
- Add admin activity notifications
- Add Sentry or equivalent error monitoring

## Resume-Worthy Features

Highlight these in portfolio/resume:

```txt
Built RBAC-secured admin dashboard for cosmetic e-commerce platform
Designed MongoDB schemas for product variants, cosmetic shades, inventory movement, and order fulfillment
Implemented analytics APIs with aggregation pipelines and cached dashboard summaries
Integrated Cloudinary image pipeline with optimized product/gallery/banner transformations
Built AI-powered inventory risk, sales prediction, and product description tools
Added audit logging, secure refresh-token auth, rate limiting, Helmet, validation, and protected admin routes
Created modular SaaS dashboard architecture with reusable data tables, charts, forms, and route-level permissions
```

## Future SaaS Upgrade Path

Turn Alankaar into a SaaS-capable commerce platform:

```txt
Multi-store support
Team invitations
Per-store roles and permissions
Subscription billing
Storefront theme editor
Marketplace integrations
Warehouse management
Return management
Loyalty points
Email/SMS campaign automation
Webhook system
Public Admin API
Mobile admin app
```

## Microservices Possibilities

Keep the monolith first. Split services only after clear pressure appears.

Good future boundaries:

```txt
Auth Service
Catalog Service
Order Service
Payment Service
Inventory Service
Content Service
Analytics Service
Notification Service
AI Insight Service
```

Use message queues later for:

```txt
Order paid events
Inventory adjustments
Invoice generation
Email notifications
Report exports
AI insight refreshes
```

## Immediate Next Implementation Step

Start with the smallest impressive vertical slice:

```txt
Admin login
RBAC middleware
Admin shell
Dashboard summary cards
Product table
Product create/edit form
Order table with status updates
Low-stock alerts
```

This slice will make Alankaar feel like a real operating dashboard quickly while preserving room for the larger SaaS architecture.
