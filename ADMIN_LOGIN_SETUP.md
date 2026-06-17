# 🔐 Admin Login System - Setup & Usage Guide

## Overview

A secure admin panel authentication system with:
- ✅ Password-protected access
- ✅ Bcrypt password hashing (secure)
- ✅ Session middleware protection
- ✅ Rate limiting (5 attempts per 15 minutes)
- ✅ Secure HTTP-only cookies
- ✅ Logout functionality

---

## 🚀 Quick Setup

### 1. Password Configuration

The system supports **two password formats**:

#### Option A: Plain Text (Simple - Current Setup)
```env
ADMIN_PASSWORD=03356935
```
⚠️ *Less secure, but works immediately*

#### Option B: Bcrypt Hash (Recommended for Production)
```env
ADMIN_PASSWORD=$2b$12$somebcrypthashhere...
```
✅ *More secure - passwords are hashed*

### 2. Generate Bcrypt Hash

Run the password generation script:

```bash
node scripts/hash-password.js
```

Then:
1. Enter your desired password when prompted
2. Copy the generated hash
3. Update `.env.local`:
   ```env
   ADMIN_PASSWORD=<paste_hash_here>
   ```

---

## 📖 How It Works

### Login Flow

```
User → Enter Password → /api/admin-login (POST)
                       ↓
                Check password (bcrypt or plain text)
                       ↓
                ✅ Valid → Set admin_session cookie → Redirect to /admin
                ❌ Invalid → Show error → Stay at login
```

### Protected Routes

The middleware (`middleware.ts`) protects:
- `/admin` - Admin dashboard (requires authentication)
- All subroutes of `/admin`

Unprotected:
- `/admin/login` - Login page (accessible to everyone)

### Session Duration

- **Login Duration**: 24 hours
- **Cookie Type**: HTTP-only (secure, can't be accessed by JavaScript)
- **Logout**: Immediately expires the cookie

---

## 🔑 Security Features

| Feature | Details |
|---------|---------|
| **Password Hashing** | Bcrypt with 12 salt rounds |
| **Session Management** | HTTP-only, Secure, SameSite=Lax cookies |
| **Rate Limiting** | 5 failed attempts per 15 minutes |
| **Middleware Protection** | All admin routes protected except login page |
| **CSRF Protection** | SameSite cookie attribute prevents CSRF |
| **Production Mode** | Secure flag enabled in production (HTTPS only) |

---

## 📁 File Structure

```
app/
├── admin/
│   ├── page.tsx              # Admin dashboard (protected)
│   └── login/
│       └── page.tsx          # Login form (public)
├── api/
│   └── admin-login/
│       └── route.ts          # POST (login) + DELETE (logout) endpoints
middleware.ts                 # Session verification middleware

lib/
└── admin-auth.ts            # Password hashing & verification utilities

scripts/
└── hash-password.js         # Password hashing script
```

---

## 🔧 API Endpoints

### Login
```
POST /api/admin-login
Content-Type: application/json

{
  "password": "your_password"
}

Response:
{
  "success": true,
  "message": "Login successful"
}
```

### Logout
```
DELETE /api/admin-login

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🛡️ Environment Variables

Required in `.env.local`:

```env
# Admin login password (plain text or bcrypt hash)
ADMIN_PASSWORD=03356935

# Optional: secret key for additional security
ADMIN_SECRET=maestravibe_secret_2025

# Node environment (development/production)
NODE_ENV=development
```

---

## ✅ Testing the System

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Login
```
http://localhost:3000/admin/login
```

### 3. Enter Password
- Use: `03356935` (or your custom password)

### 4. Access Dashboard
- You should be redirected to `/admin`

### 5. Test Logout
- Click "Logout" button in top right
- You'll be redirected to login page

### 6. Try Without Session
- Try accessing `/admin` directly without logging in
- You should be redirected to `/admin/login`

---

## 🚨 Troubleshooting

### "Cannot find module 'bcrypt'"
```bash
npm install
npm run dev
```

### Rate Limit Error After Failed Logins
- Wait 15 minutes, or
- Restart the development server

### Cookie Not Setting
- Ensure `NODE_ENV=production` has HTTPS enabled
- In development, cookies work over HTTP

### Logout Not Working
- Check browser console for errors
- Clear cookies manually: Settings → Cookies → Find maestravibe, delete `admin_session`

---

## 🔐 Best Practices

1. **Change Default Password**
   ```bash
   node scripts/hash-password.js
   # Enter a strong password
   # Update .env.local with the hash
   ```

2. **Use Bcrypt Hash in Production**
   - Never store plain text passwords
   - Use the hash script to generate secure hashes

3. **Secure .env.local**
   - Add to `.gitignore` (already done)
   - Never commit to version control

4. **Monitor Failed Attempts**
   - Rate limiting prevents brute force attacks
   - Consider logging failed attempts for security monitoring

5. **Session Timeout**
   - Current: 24 hours
   - To change: Edit `maxAge` in `/app/api/admin-login/route.ts`

---

## 📝 Changing Password

### Method 1: Plain Text
1. Edit `.env.local`
2. Change `ADMIN_PASSWORD=newpassword`
3. Restart server

### Method 2: Bcrypt Hash
1. Generate hash: `node scripts/hash-password.js`
2. Update `.env.local` with new hash
3. Restart server

---

## 🎯 Next Steps

- [ ] Change default password to something secure
- [ ] Generate bcrypt hash for production use
- [ ] Test login/logout flow
- [ ] Add login attempt logging (optional)
- [ ] Set up session timeouts based on your needs
- [ ] Consider two-factor authentication (optional enhancement)

---

**Questions or Issues?**
Check the code comments in:
- `/app/api/admin-login/route.ts` - Login logic & rate limiting
- `/lib/admin-auth.ts` - Password verification
- `/middleware.ts` - Route protection
