# 🎉 Metro Health - Demo Guide

## ✅ System Status

**Both servers are confirmed running:**
- ✅ Backend API: `http://localhost:3000/api` 
- ✅ Frontend App: `http://localhost:5173`
- ✅ Database: PostgreSQL with seed data
- ✅ CORS: Enabled

---

## 🚀 Starting the Demo

### Open in Browser
Navigate to: **http://localhost:5173**

### If You See a Blank Page:

**This is likely a JavaScript error. Check the browser console:**

1. **Open Developer Tools:**
   - **Mac**: `Cmd + Option + I`
   - **Windows/Linux**: `F12`

2. **Click the "Console" tab**

3. **Look for RED error messages**

4. **Common Issues & Fixes:**

   **Error: "Failed to fetch" or "Network error"**
   - Backend might not be running
   - Run: `cd /Users/lukecaprio/Desktop/metrohealth/backend && npm run start:dev`

   **Error: "Module not found" or import errors**
   - Missing dependencies
   - Run: `cd /Users/lukecaprio/Desktop/metrohealth/app && npm install`

   **Error: "Cannot read property of undefined"**
   - Check browser console for specific line number
   - Refresh page with `Cmd+Shift+R` (hard refresh)

---

## 👥 Demo Accounts

### Patient Account
```
Email:    john.smith@patient.com
Password: password123
```

### Staff Account (Nurse)
```
Email:    nurse.williams@hospital.com
Password: password123
```

### Staff Account (Doctor)
```
Email:    dr.thompson@hospital.com
Password: password123
```

### Critical Patient (for testing alerts)
```
Email:    michael.brown@patient.com
Password: password123
```

---

## 🎬 Demo Flow

### PATIENT DEMO (3-5 minutes)

**1. Login**
- Use: `john.smith@patient.com` / `password123`

**2. Dashboard**
- View vitals: Heart Rate (72 bpm), Blood Pressure (120/80), O2 (98%)
- See next appointment
- Check message/test result counts

**3. Request Help**
- Click "Request Help" button
- Select reason: "Water" or "Bathroom Assistance"
- Add optional notes
- Submit → See success message

**4. Test Results**
- Click "Test Results" in bottom nav
- Browse list of results (color-coded by severity)
- Click any result to see plain-language explanation
- Notice: Red (Critical), Orange (High), Yellow (Medium), Green (Normal)

**5. Book Appointment**
- Click "Schedule" in bottom nav
- View available doctors and time slots
- Select doctor and time
- Confirm booking → Success message

**6. Messages**
- Click "Messages" in bottom nav
- View message history
- Click "Send New Message"
- Type message and send

---

### STAFF DEMO (3-5 minutes)

**1. Logout & Login**
- Logout from patient account
- Click "Staff Login →"
- Use: `nurse.williams@hospital.com` / `password123`

**2. Dashboard**
- View summary cards:
  - 7 Patients Assigned
  - 3 Active Alerts  
  - 2 Critical Alerts
- Recent activity feed

**3. Alerts (CRITICAL FEATURE)**
- Click "Alerts" in bottom nav
- View list sorted by priority (Critical → High → Medium)
- **Click on Michael Brown (CRITICAL alert)**
- See vitals: HR 125 bpm, BP 160/95 mmHg
- Click "Acknowledge Alert" → Alert acknowledged

**4. Patient List**
- Click "Patients" in bottom nav
- Browse assigned patients
- Click any patient for detailed view:
  - Vitals history
  - Test results
  - Medication list
  - Recent activity

**5. Help Requests**
- Click "Home" → "View Active Requests"
- See all pending help requests from patients
- Click "Mark Complete" on a request
- Request disappears from active list

---

## 🎯 Key Features to Highlight

### For Patients:
- ✨ **Large, Touch-Friendly UI** - Optimized for tablets
- ✨ **Plain-Language Test Results** - Medical jargon translated
- ✨ **Color-Coded Status** - Easy to understand at a glance
- ✨ **Quick Help Requests** - One-tap assistance
- ✨ **Appointment Booking** - Self-service scheduling

### For Staff:
- ✨ **Priority-Based Alerts** - Critical issues highlighted
- ✨ **Patient Dashboard** - Complete patient overview
- ✨ **Real-Time Vitals** - Current patient status
- ✨ **Request Management** - Track and complete patient needs
- ✨ **Mobile-Optimized** - Works on tablets and phones

---

## 🔧 Troubleshooting

### Backend Not Responding
```bash
cd /Users/lukecaprio/Desktop/metrohealth/backend
npm run start:dev
```

### Frontend Not Loading
```bash
cd /Users/lukecaprio/Desktop/metrohealth/app
npm run dev
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Reset Database
```bash
cd /Users/lukecaprio/Desktop/metrohealth/backend
npm run prisma:migrate
npm run prisma:seed
```

---

## 📊 Technical Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS 4 (styling)
- React Query (data fetching)
- React Router (routing)
- Axios (HTTP client)

**Backend:**
- NestJS + TypeScript
- PostgreSQL (database)
- Prisma ORM
- JWT Authentication
- RBAC (Role-Based Access Control)

**AI Tools Used:**
- Cursor AI (Claude Sonnet 4.5)
- Prompt-driven development
- Automated code generation

---

## 📁 Project Structure

```
metrohealth/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── common/   # Guards, filters, decorators
│   │   └── main.ts
│   └── prisma/       # Database schema & seed
│
├── app/              # React Frontend
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/  # Auth state
│   │   └── types/
│   └── index.html
│
└── Documentation files
```

---

## 🎓 Assignment Requirements Met

✅ Prompt-Driven Development  
✅ Architecture Adherence (Clean Architecture, Separation of Concerns)  
✅ Cross-Cutting Concerns (Auth, Validation, Error Handling)  
✅ Data Model Integration (Prisma ORM, relationships)  
✅ Tech Stack Documentation  
✅ AI Tools Documentation (Cursor AI usage tracked)  
✅ Wireframe Implementation (All screens match designs)  
✅ Patient & Staff Workflows (Complete and tested)  

---

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify both servers are running
3. Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
4. Check logs in `/tmp/backend-output.log` and `/tmp/frontend-output.log`

---

**Ready to demo! 🚀**

