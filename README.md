# 💰 Finance Data Processing and Access Control

This project is a **full-stack backend-focused system** built as part of a backend engineering assignment. It demonstrates API design, role-based access control (RBAC), financial data processing, and dashboard analytics.

The system consists of:
- A **REST API backend** (Node.js, Express, MongoDB)
- A **React dashboard frontend** (Vite + TypeScript)

---

# 🔑 Demo Accounts

This application includes pre-configured demo users for different roles:

| Role    | Email                                             | Password    |
| ------- | ------------------------------------------------- | ----------- |
| Admin   | [admin@example.com](mailto:admin@example.com)     | Admin123!   |
| Analyst | [analyst@example.com](mailto:analyst@example.com) | Analyst123! |
| Viewer  | [viewer@example.com](mailto:viewer@example.com)   | Viewer123!  |


---

# 🚀 Live Demo

- 🌐 Frontend: https://zorvyn-f.vercel.app  
- 🔗 Backend API: https://zorvyn-nb75.onrender.com  

---

# 🎯 Objective

This project demonstrates:
- Backend architecture design
- Clean API structuring
- Role-based access control (RBAC)
- Financial data handling
- Aggregation and analytics APIs
- Validation, security, and error handling

---

# 🧱 Tech Stack

## Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- RBAC (viewer / analyst / admin)
- Express Validator
- Rate Limiting
- Helmet (security)
- Swagger UI
- Jest + Supertest (testing)

## Frontend
- React 18
- Vite
- TypeScript
- Axios

---

# ⚙️ Features

## 👤 User & Role Management
- Create and manage users
- Assign roles: **Viewer, Analyst, Admin**
- Activate / deactivate users
- Role-based access enforcement

---

## 💳 Financial Records
Each record includes:
- Amount
- Type (Income / Expense)
- Category
- Date
- Notes

### Supported operations:
- Create / Read / Update / Delete
- Soft delete (no permanent data loss)
- Filtering (date, type, category)
- Pagination
- Text search

---

## 📊 Dashboard APIs
Provides aggregated insights:
- Total income
- Total expenses
- Net balance
- Category-wise breakdown
- Recent activity
- Weekly / monthly trends

---

## 🔐 Access Control (RBAC)

| Role | Permissions |
|------|------------|
| Viewer | Dashboard only |
| Analyst | Read records + dashboard |
| Admin | Full access (users + records) |

Implemented using middleware-based authorization.

---

## 🛡️ Validation & Security
- Input validation using express-validator
- Proper HTTP status codes
- Centralized error handling
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting (300 req / 15 min / IP)
- Helmet for security headers

---

## 🧪 Testing
- Jest + Supertest
- Uses mongodb-memory-server
- No real DB required for tests

---

# 🗂️ Project Structure

```

backend/
├── src/
├── routes/
├── models/
├── middleware/
├── tests/
└── server.js

frontend/
├── src/
├── components/
├── pages/
└── api/

````

---

# ⚡ Getting Started (Local Setup)

## 1. Clone the repository

```bash
git clone https://github.com/Satyam-Mishra-1/Zorvyn
cd project
````

---

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs at:

```
http://localhost:4000
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```


---

# 🌐 Environment Variables

## Backend (`.env`)

```
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Frontend (`.env`)

```
VITE_API_URL=http://localhost:4000
```

---

# 🧠 Design Decisions & Assumptions

* Single-tenant system (shared dataset)
* `createdBy` field used for auditing
* Soft delete used to preserve historical data
* Viewer cannot access raw transaction data
* Aggregations handled via MongoDB pipelines

---

# ⚖️ Tradeoffs

* Simplicity over microservices architecture
* Basic authentication (JWT) instead of OAuth
* Aggregation labels simplified for demo clarity

---

# 🚀 Deployment

* Frontend deployed on **Vercel**
* Backend deployed on **Render**
* MongoDB hosted on **MongoDB Atlas**

---

# 📌 Future Improvements

* Refresh tokens for authentication
* Advanced analytics (charts, forecasting)
* Multi-tenant architecture
* Role-based UI guards
* Caching (Redis)

---

# 👨‍💻 Author

**Satyam Mishra**
Backend Developer 

---

