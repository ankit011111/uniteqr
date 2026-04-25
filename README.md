# MenuSQR v4.0 🍽️

**QR-based ordering system for cafés** — 2-minute setup, instant digital ordering.

---

## 🚀 Quick Start

### Step 1 — Setup MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → create a free account
2. Create a new **Free Cluster**
3. Under **Database Access** → Add user (username + password)
4. Under **Network Access** → Allow from anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → Copy connection string

### Step 2 — Configure Backend

Edit `backend/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/menusqr?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_here
PORT=5000
BASE_URL=http://localhost:5173
```

> **For production (Vercel):** Change `BASE_URL` to your Vercel domain, e.g. `https://menusqr.vercel.app`

### Step 3 — Start Backend

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected
✅ Default employee seeded: username=employee, password=employee123
🚀 Server running on port 5000
```

### Step 4 — Start Frontend

```bash
cd frontend
npm run dev
```

Open → `http://localhost:5173`

---

## 👤 Default Credentials

| Role | URL | Username | Password |
|------|-----|----------|----------|
| **Employee** | `/employee/login` | `employee` | `employee123` |
| **Admin** | `/admin/login` | *(generated when café is created)* | *(shown on creation screen)* |

---

## 🔄 Full Demo Flow

1. **Login as Employee** → `http://localhost:5173/employee/login`
2. Click **Create New Café** → Enter name, phone, tables → Submit
3. Copy credentials + download QR codes
4. **Login as Admin** using the generated credentials
5. Add/edit menu items (images supported via URL)
6. Open the **customer URL**: `http://localhost:5173/cafe/<cafeId>/table/1`
7. Browse menu → Add items → Place order
8. Admin sees order live in **Orders** tab → Accept → Prepare → Ready → Complete
9. Customer **Order Status** page auto-updates every 5 seconds
10. Check **Analytics** for revenue + top items

---

## 📁 Project Structure

```
itemsqr/
├── backend/
│   ├── src/
│   │   ├── models/       # User, Employee, Table, MenuItem, Order
│   │   ├── routes/       # auth, employee, menu, orders, analytics, cafe
│   │   ├── middleware/   # JWT auth
│   │   └── server.js
│   └── .env
└── frontend/
    └── src/
        ├── pages/
        │   ├── admin/    # Login, Dashboard, Orders, Menu, Analytics, QR
        │   ├── employee/ # Login, Dashboard, CreateCafe
        │   └── customer/ # CustomerMenu, OrderStatus
        ├── components/   # AdminLayout, ...
        ├── context/      # AuthContext
        └── utils/        # api.js (axios)
```

---

## 🌐 Deploy to Vercel + Render

### Backend → Render
1. Push to GitHub
2. Create **Web Service** on Render → connect repo → set root to `backend/`
3. Add environment variables (MONGO_URI, JWT_SECRET, BASE_URL)
4. `BASE_URL` = your Vercel frontend URL

### Frontend → Vercel
1. Create project on Vercel → connect repo → set root to `frontend/`
2. Add env var: `VITE_API_URL=https://your-render-backend.onrender.com/api`

### QR Links
QR codes automatically use `BASE_URL` from backend `.env`. Once deployed, update it to your Vercel domain and regenerate QRs if needed.

---

## 🔔 Notifications (Admin Orders Page)
- **Sound alert**: plays a chime when new orders arrive
- **Browser notification**: requires notification permission (prompted automatically)
- **Polling**: every 5 seconds

---

## 📸 Adding Item Images
In Admin → Menu → Edit/Add Item, paste any public image URL, e.g.:
- Unsplash: `https://images.unsplash.com/photo-xxx?w=400&q=80`
- Or your own hosted image URL
