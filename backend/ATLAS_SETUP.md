# MongoDB Atlas Setup

This project is already prepared to use MongoDB Atlas.

## What you still need to do

1. Create a free MongoDB Atlas account.
2. Create a free cluster.
3. Create a database user.
4. Add your IP address in Atlas Network Access.
5. Copy the Node.js connection string from Atlas.
6. Paste that connection string into `backend/.env` as the value of `MONGODB_URI`.

## Example format

```env
MONGODB_URI=mongodb+srv://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@YOUR_CLUSTER_URL/cosmetic_brand_db?retryWrites=true&w=majority
```

## Then run

```powershell
cd "d:\antigravity project\backend"
npm run seed:products
npm run dev
```
