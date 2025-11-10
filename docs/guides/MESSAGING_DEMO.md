# 📨 Two-Way Messaging Demo Guide

## ✅ Messaging Is Now Connected!

The patient and staff can now communicate through the messaging system. Messages sent from the patient side will appear on the staff side and vice versa.

---

## 🎬 How to Demo Patient → Staff Messaging

### Step 1: Login as Patient
1. Go to: `http://localhost:5173/patient/login`
2. Login: `john.smith@patient.com` / `password123`

### Step 2: Send a Message
1. Click **"Messages"** in bottom navigation
2. Click **"New Message"** button
3. Fill in:
   - **Subject**: (Optional) e.g., "Question about medication"
   - **Message**: e.g., "I have a question about my blood pressure medication. When should I take it?"
4. Click **"Send Message"**
5. You'll see success and the message appears in your inbox

### Step 3: View Message as Staff
1. **Logout** from patient account
2. Click **"Staff Login →"**
3. Login: `nurse.williams@hospital.com` / `password123`
4. On the **Dashboard**, you'll see:
   - **"Unread Messages"** card showing count
   - **"View Messages"** button
5. Click **"View Messages"** or navigate to `/staff/messages`
6. You'll see the message from John Smith!
7. Click on the message to expand and read the full content

---

## 🔄 Demo Workflow

```
┌─────────────────────┐
│   PATIENT SIDE      │
│  John Smith sends:  │
│  "Question about    │
│   medication"       │
└──────────┬──────────┘
           │
           ▼
    Backend saves message
           │
           ▼
┌──────────┴──────────┐
│    STAFF SIDE       │
│  Nurse Williams     │
│  sees message in    │
│  Messages page      │
└─────────────────────┘
```

---

## 📋 Quick Test Checklist

- [ ] Patient can send message
- [ ] Message appears in patient's inbox
- [ ] Staff dashboard shows "Unread Messages" count
- [ ] Staff can view messages page
- [ ] Message from patient appears on staff side
- [ ] Message shows correct sender name and role
- [ ] Date/time formatting works correctly
- [ ] "New" badge appears for unread messages

---

## 🎯 Key Demo Points to Highlight

1. **Real-time Communication** - Patient to staff messaging
2. **Unread Count** - Staff dashboard shows unread message count
3. **Message Details** - Sender name, role, timestamp all visible
4. **Easy Navigation** - One click from dashboard to messages
5. **Patient-Friendly** - Simple interface for patients to reach care team
6. **Staff Efficiency** - All patient messages in one place

---

## 📍 URLs

- **Patient Messages**: http://localhost:5173/patient/messages
- **Staff Messages**: http://localhost:5173/staff/messages
- **Staff Dashboard**: http://localhost:5173/staff/dashboard

---

## 💡 Demo Script

**Narrator**: "Now let me show you the messaging system..."

1. **As Patient**: "A patient has a question about their medication"
   - Click Messages → New Message
   - Type question
   - Send
   
2. **Switch to Staff**: "The nurse logs in and immediately sees..."
   - Dashboard shows "2 Unread Messages"
   - Click "View Messages"
   - See patient's message
   - Can read full content

**Narrator**: "This allows seamless communication between patients and their care team, ensuring questions are answered quickly."

---

**Ready to demo messaging! 🎉**
