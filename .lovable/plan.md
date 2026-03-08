

# Dental Clinic Management Dashboard

## Overview
A comprehensive single-page dental clinic management system with role-based access (Doctor & Receptionist), patient management, treatments, payments, appointments, invoicing, and financial reporting. All data lives in-memory with pre-loaded seed data for demo purposes.

## Design System
- **Color scheme**: Dark navy sidebar/headers, white content areas, teal accents for actions/highlights
- **Aesthetic**: Clean, medical/clinical, professional feel
- **Typography**: Clear hierarchy with bold headings, readable body text

## Pages & Features

### 1. Login Screen
- Dropdown listing all registered users by name (no typing usernames)
- Password field + Login button
- First-run: Doctor registration form (bootstraps the admin account)

### 2. Dashboard (Home)
- Today's appointments count, pending payments count
- **Doctor only**: Revenue summary cards (today / week / month)
- Upcoming 5 appointments list
- Recent patients quick-access list

### 3. Patients Page
- Searchable, sortable table: Name, Phone, Last Visit, Balance, Status
- Balance & Status columns hidden for Receptionists
- Click row → Patient Detail View with tabbed layout:
  - **Demographics**: age, blood type, allergies, medical history
  - **Treatments**: procedure list with costs (Doctor can add)
  - **Payments**: payment history (both roles can add payments, including partial)
  - **Appointments**: scheduled visits for this patient
  - **Invoice button**: generates printable invoice

### 4. Appointments Page
- Calendar/timeline view of all appointments
- Add, edit, cancel appointments (both roles)
- Status management: scheduled → completed / cancelled / no-show

### 5. Finance Page (Doctor only)
- Revenue over time chart (daily/weekly/monthly)
- Top patients by outstanding balance
- Payment method breakdown (cash/card/insurance)
- Export summary option

### 6. Staff Management (Doctor only)
- List of receptionists
- Add receptionist (requires Doctor password confirmation)
- Edit receptionist name / reset password

### 7. Invoice System
- Printable invoice with clinic header, patient info, itemized treatments, payment history, balance due, and status badge
- Auto-generated invoice numbers (INV-YYYYMMDD-XXXX)
- Print via browser print targeting invoice div only

## Navigation
- Sidebar with role-aware menu items
- Finance & Staff Management hidden for receptionists
- User name/role displayed in sidebar footer with logout option

## Data & Auth
- All state managed in-memory via React useState
- Role-based permission checks throughout the UI
- Pre-loaded seed data: 1 doctor, 2 receptionists, 5 patients with treatments, payments, and appointments
- Passwords stored as plain strings (demo only)

## Interactions
- Modal dialogs for adding/editing patients, treatments, payments, appointments, and staff
- Confirmation dialogs for destructive actions (delete, cancel)
- Toast notifications for success/error feedback

