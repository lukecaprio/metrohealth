# Metro Health Frontend

React + TypeScript + Vite frontend for the Metro Health patient care system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **React Router v6** - Navigation
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Access the App

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

## Demo Credentials

### Patient Login
- Email: `john.smith@patient.com`
- Password: `password123`

### Staff Login
- Nurse: `nurse.williams@hospital.com` / `password123`
- Doctor: `dr.thompson@hospital.com` / `password123`

## App Structure

### Patient Pages
1. **Login** (`/patient/login`) - Patient authentication
2. **Dashboard** (`/patient/dashboard`) - Overview with vitals and quick actions
3. **Request Help** (`/patient/help`) - Submit help requests (water, blanket, nurse, etc.)
4. **Test Results** (`/patient/test-results`) - View lab results with plain-language explanations
5. **Schedule** (`/patient/schedule`) - Book appointments with available doctors
6. **Messages** (`/patient/messages`) - Communication with medical staff

### Staff Pages
1. **Login** (`/staff/login`) - Staff authentication
2. **Dashboard** (`/staff/dashboard`) - Overview of alerts, patients, and requests
3. **Alert List** (`/staff/alerts`) - View and manage patient alerts
4. **Alert Detail** (`/staff/alerts/:id`) - Detailed alert with escalation options
5. **Patient List** (`/staff/patients`) - View all patients
6. **Patient Detail** (`/staff/patients/:id`) - Detailed patient information
7. **Request List** (`/staff/requests`) - Manage patient help requests

## Features

- ✅ JWT Authentication
- ✅ Role-based routing (Patient vs Staff)
- ✅ Real-time data with React Query
- ✅ Responsive tablet-optimized design
- ✅ Large, accessible UI elements
- ✅ Loading states and error handling
- ✅ Bottom navigation for staff (mobile-friendly)
- ✅ Color-coded status indicators
- ✅ Plain-language test result explanations

## API Integration

All API calls are configured to hit `http://localhost:3000/api`. The API client automatically:
- Adds JWT tokens to requests
- Handles 401 unauthorized errors
- Redirects to login when token expires

## Color Scheme

- **Primary Purple**: `#6B46C1` - Main actions and branding
- **Light Purple**: `#E9D5FF` - Backgrounds and cards
- **Success Green**: `#10B981` - Normal/completed states
- **Warning Orange**: `#F59E0B` - Medium priority
- **Error Red**: `#EF4444` - Critical/abnormal states

## Navigation Flows

### Patient Flow
```
Login → Dashboard → [Request Help | Test Results | Schedule | Messages] → Back to Dashboard
```

### Staff Flow
```
Login → Dashboard → [Alerts | Patients | Requests] → Detail Views → Back
Bottom Nav: Home | Alerts | Patients (always visible)
```

## Project Structure

```
src/
├── api/                  # API integration layer
│   ├── client.ts         # Axios instance with interceptors
│   ├── auth.ts           # Auth API
│   ├── patient.ts        # Patient API
│   └── staff.ts          # Staff API
├── components/
│   ├── common/           # Reusable components (Button, Card, Input)
│   ├── features/         # Feature-specific components (VitalsCard, AlertItem)
│   └── layout/           # Layout components (PageLayout, BottomNav)
├── context/              # React Context (AuthContext)
├── hooks/                # Custom hooks
├── pages/
│   ├── patient/          # 6 patient pages
│   └── staff/            # 7 staff pages
├── types/                # TypeScript type definitions
├── utils/                # Utility functions (formatters)
├── App.tsx               # Root component with routing
└── main.tsx              # App entry point
```

## Development

### Adding a New Page

1. Create component in `src/pages/patient/` or `src/pages/staff/`
2. Add route in `src/App.tsx`
3. Add API function in `src/api/patient.ts` or `src/api/staff.ts`
4. Add TypeScript types in `src/types/index.ts`

### Styling

Uses Tailwind CSS with custom purple theme. Common patterns:
- Buttons: `bg-purple-600 text-white rounded-2xl px-8 py-4`
- Cards: `bg-white rounded-2xl p-6 shadow-sm`
- Inputs: `border border-gray-300 rounded-2xl px-4 py-4`

## Notes

- This is a prototype/demo application
- Authentication is simplified (no refresh tokens)
- All passwords are `password123` for easy testing
- Backend must be running for full functionality
- Optimized for tablet viewport (375-768px)

## Next Steps

- [ ] Add WebSocket for real-time alerts
- [ ] Implement offline support
- [ ] Add more comprehensive error boundaries
- [ ] Add accessibility improvements (ARIA labels)
- [ ] Add automated tests
