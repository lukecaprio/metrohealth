# Metro Health - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install PostgreSQL (if not already installed)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Or use PostgreSQL.app**: https://postgresapp.com/

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE metrohealth;

# Exit
\q
```

### Step 3: Configure Environment

Edit `backend/.env` file with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/metrohealth?schema=public"
JWT_SECRET="metro-health-demo-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

**Example** (if your PostgreSQL user is `postgres` with no password):
```env
DATABASE_URL="postgresql://postgres@localhost:5432/metrohealth?schema=public"
```

### Step 4: Run Migrations and Seed Data

```bash
cd backend

# Run migrations (creates all tables)
npm run prisma:migrate

# Seed demo data (adds patients, staff, appointments, etc.)
npm run prisma:seed
```

### Step 5: Start the Server

```bash
npm run start:dev
```

You should see:
```
🚀 Metro Health Backend is running on: http://localhost:3000/api
```

---

## ✅ Test the API

### Quick Test with cURL

1. **Login as a patient:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@patient.com","password":"password123"}'
```

2. **Copy the `accessToken` from the response**

3. **Get patient dashboard:**
```bash
curl http://localhost:3000/api/patients/me/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Browser

Visit in browser (for GET endpoints):
```
http://localhost:3000/api/staff/patients
```
(Will show 401 Unauthorized - need token in header)

### Better: Use Postman or Thunder Client

1. **Import Base URL**: `http://localhost:3000/api`
2. **Login** via `POST /auth/login`
3. **Set Authorization**: Bearer Token (paste the access token)
4. **Test all endpoints** from README.md

---

## 🎯 Demo Credentials

### Patients (password: `password123`)
- `john.smith@patient.com` - Room 101, Stable
- `michael.brown@patient.com` - Room 103, Critical (has alerts)
- `sarah.johnson@patient.com` - Room 102, Recovering

### Staff (password: `password123`)
- `nurse.williams@hospital.com` - Nurse, Cardiology
- `dr.thompson@hospital.com` - Doctor, Cardiology
- `admin@hospital.com` - Administrator

---

## 🔍 Explore the Database

Open Prisma Studio (database GUI):
```bash
cd backend
npm run prisma:studio
```

Opens at: `http://localhost:5555`

You can browse all tables, view data, and even edit records.

---

## 📖 Full Documentation

- **API Endpoints**: See `backend/README.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Assignment Tracking**: See `ASSIGNMENT_REQUIREMENTS.md`

---

## 🐛 Troubleshooting

### "Connection refused" error
- Ensure PostgreSQL is running: `brew services list`
- Check your DATABASE_URL in `.env`

### "relation does not exist" error
- Run migrations: `npm run prisma:migrate`

### Port 3000 already in use
- Change PORT in `.env` to 3001 or another port
- Restart server

### Need to reset database
```bash
npx prisma migrate reset
npm run prisma:seed
```

---

## ✨ You're Ready!

Your Metro Health backend is now running with:
- ✅ 7 patients with varied conditions
- ✅ 6 staff members (nurses, doctors, admin)
- ✅ 28 API endpoints ready to test
- ✅ Real demo data (vitals, alerts, messages, appointments)

**Next**: Test the API endpoints or connect your frontend!

