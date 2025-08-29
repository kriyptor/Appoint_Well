# Appoint Well

A full-stack appointment booking application for salons, featuring user, staff, and admin interfaces, appointment management, reminders, and secure authentication.

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MySQL** (local or cloud, e.g. Aiven)
- **Gmail account** (for sending emails via Nodemailer)

---

## Environment Variables

Create a `.env` file in the `/server` directory with the following variables:

```properties
API_URL=/api/v1

JWT_SECRET_KEY=your_jwt_secret_key

CASHFREE_CLIENT_ID=your_client_id
CASHFREE_CLIENT_SECRET=your_client_secret

NODE_MAILER_SERVICE=gmail
NODE_MAILER_USER=your_gmail_address
NODE_MAILER_PASSWORD=your_gmail_app_password

ALGORITHM=aes-256-cbc
ENCRYPTION_KEY=your_encryption_key

DB__URI=mysql://user:password@host:port/dbname?ssl-mode=REQUIRED
```

**Note:**  
- Replace values with your actual credentials.
- For Gmail, use an 2FA is enabled.

---

## Running Locally

### 1. Install Dependencies

#### Server

```bash
cd server
npm install
```

#### Client

```bash
cd client
npm install
```

---

### 2. Start the Application

#### Server

```bash
npm start
```

#### Client

```bash
npm run dev
```

---

## Features

- User, staff, and admin authentication
- Appointment booking, rescheduling, and cancellation
- Automated email reminders for upcoming appointments
- Staff and service management
- Secure password encryption and JWT authentication

---

## Troubleshooting

- Ensure your `.env` file is correctly configured.
- Make sure your MySQL server is running and accessible.
- For email issues, verify your Gmail credentials and app password.

---

## License
