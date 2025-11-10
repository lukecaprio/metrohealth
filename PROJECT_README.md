# Metro Health Smart Patient Care System

A comprehensive hospital patient care application with bedside tablet interface for patients and management dashboard for medical staff.

## 🎯 Project Overview

Metro Health is a full-stack healthcare application that enables:
- **Patients** to request help, view test results, schedule appointments, and message staff from bedside tablets
- **Medical Staff** to manage alerts, view patient lists, handle requests, and communicate with patients

## 🚀 Quick Start

### Running the Demo
```bash
./docs/setup/start-demo.sh
```
This will start both backend (port 3000) and frontend (port 5173).

### Manual Setup
See **[docs/setup/QUICK_START.md](docs/setup/QUICK_START.md)** for detailed setup instructions.

## 📚 Documentation

All documentation is organized in the `/docs` folder:

### 📋 For Submission
- **[ASSIGNMENT_REQUIREMENTS.md](ASSIGNMENT_REQUIREMENTS.md)** - Main submission document (in root)
- [Implementation Summary](docs/implementation/IMPLEMENTATION_SUMMARY.md) - Backend technical details
- [Frontend Summary](docs/implementation/FRONTEND_IMPLEMENTATION_SUMMARY.md) - Frontend technical details

### 🎬 For Demo
- [Complete Demo Guide](docs/guides/COMPLETE_DEMO_GUIDE.md) - ⭐ **MAIN GUIDE** - Full walkthrough with startup, all features, messaging, and troubleshooting
- [Start Demo Script](docs/setup/start-demo.sh) - Automated startup command

### 🔧 For Development
- [Complete System Status](docs/implementation/COMPLETE_SYSTEM_STATUS.md) - Architecture overview
- [Requirements Verification](docs/implementation/REQUIREMENTS_VERIFICATION.md) - Requirement tracking
- [Testing Scripts](docs/testing/) - Backend and system tests

**Full documentation index:** [docs/README.md](docs/README.md)

## 🏗️ Tech Stack

### Backend
- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT with role-based access control

### Frontend
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Query + Context API

## 🧪 Demo Credentials

### Patient Portal
- **Email:** `john.doe@email.com`
- **Password:** `password123`

### Staff Portal
- **Email:** `sarah.nurse@metrohealth.com`
- **Password:** `password123`

## 📁 Project Structure

```
metrohealth/
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── common/      # Guards, filters, interceptors
│   │   └── infra/       # Database, Prisma
│   └── prisma/          # Database schema & migrations
├── app/                 # React frontend (Vite)
│   └── src/
│       ├── pages/       # Patient & staff screens
│       ├── components/  # Reusable UI components
│       ├── api/         # API client
│       └── context/     # Auth context
├── frontend/            # Wireframes and design assets
└── docs/               # All documentation
    ├── setup/          # Setup guides
    ├── implementation/ # Technical docs
    ├── guides/         # Demo guides
    ├── features/       # Feature docs
    └── testing/        # Test scripts
```

## ✨ Key Features

### Patient Features
- 🏥 Request help (water, blanket, nurse, etc.)
- 📊 View test results with plain language explanations
- 📅 Schedule appointments with available doctors
- 💬 Send and receive messages to/from staff
- ❤️ View current vitals on dashboard

### Staff Features
- 🚨 View and manage critical patient alerts
- 👥 Access complete patient list with vital summaries
- ✅ Process and complete help requests
- 📋 View patient details and medical records
- 💬 Communicate with patients via messaging
- 📊 Dashboard with real-time summaries

## 🔐 Security & Authorization

- JWT-based authentication
- Role-based access control (PATIENT, NURSE, PHYSICIAN, ADMIN)
- Patients can only access their own data
- Staff access controlled by role permissions
- All actions logged in audit trail

## 🎓 Assignment Information

This project was developed using **prompt-driven development** with AI assistance (Cursor AI with Claude Sonnet 4.5).

See [ASSIGNMENT_REQUIREMENTS.md](ASSIGNMENT_REQUIREMENTS.md) for:
- Complete requirement checklist
- All prompts used during development
- Architecture adherence documentation
- Cross-cutting concerns implementation
- Tech stack details
- AI tools documentation

## 📖 More Information

- **[Original Requirements](README.md)** - Initial project specification
- **[Documentation Index](docs/README.md)** - Complete documentation catalog
- **[Quick Start Guide](docs/setup/QUICK_START.md)** - Setup instructions
- **[Demo Guide](docs/guides/DEMO_GUIDE.md)** - Presentation walkthrough

---

**Developed:** November 2025  
**Demo Week:** November 10, 2025  
**Platform:** Web Application (Desktop & Tablet)

