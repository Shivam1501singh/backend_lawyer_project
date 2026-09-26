# Frontend Integration Guide & API Reference

This document serves as a complete integration guide for frontend developers to connect their React/Vite (or any frontend client) application to the backend authentication services. 

It covers both the **User** and the upgraded **Advocate** registration and login flows, including API specifications, validation requirements, and frontend integration code snippets.

---

## 1. Tech Stack & Connection Defaults
- **Backend Base URL:** `http://localhost:5000`
- **Prefix:** `/api` (All routes are prefixed, e.g. `http://localhost:5000/api/auth/me`)
- **Session Mechanism:** JSON Web Tokens (JWT) signed and set as an HTTP-only secure cookie named `auth_token` (Web) OR via `Authorization: Bearer <token>` header (Mobile / App Clients).
- **Axios Configuration requirement (Web):** You **MUST** configure your Axios client or Fetch wrapper to send credentials (`withCredentials: true`). Otherwise, the session cookie will not be stored or sent back.
- **Header Configuration (Mobile/App):** You can retrieve the `token` directly from the JSON body of login responses and pass it in subsequent authenticated requests using the header `Authorization: Bearer <your_token>`.

### Client Configuration Example (Web with Cookies)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // MANDATORY for HTTP-only cookie synchronization on Web
});

export default api;
```

### Client Configuration Example (Mobile / Bearer Token)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Attach bearer token if stored in mobile storage
api.interceptors.request.use((config) => {
  const token = getSavedToken(); // Fetch token from secure storage (SecureStore, Keychain, etc.)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 2. Core Authentication Matrix

| Account Type | Authentication Mode | ID Field | Credentials Required |
| :--- | :--- | :--- | :--- |
| **User** | Phone OTP | `phone` | 6-digit SMS code |
| **User** | Email OTP | `email` | 6-digit Email code |
| **User** | Google OAuth | Google ID | None (Google verified callback) |
| **Advocate** | Phone OTP | `phone` | 6-digit SMS code |
| **Advocate** | Email OTP | `email` | 6-digit Email code |
| **Advocate** | Google OAuth | Google ID | None (Google verified callback) |

*Note: Advocate registrations require password hashing on creation, but logins currently verify via passwordless OTP or Google OAuth channels.*

---

## 3. User Registration Flow
The User registration is a 3-step wizard.

```text
Step 1: Name + Email Start ──> Email OTP / Google ──> Step 2: Phone Verification (Send & Verify OTP) ──> Step 3: Address & Profile Complete (Finalizes Auto-Creation)
```

### Endpoints Reference

#### Step 1 (Part A): Start & Send Email OTP
- **Endpoint:** `POST /api/auth/user/register/start`
- **Request Body:**
  ```json
  { 
    "fullName": "Shivam Singh", 
    "email": "user@example.com",
    "registrationId": "uuid-string" (optional: pass to update/resubmit details)
  }
  ```
- **Response:**
  ```json
  { 
    "success": true, 
    "message": "Verification OTP sent to your email.",
    "registrationId": "uuid-string",
    "email": "user@example.com"
  }
  ```

#### Step 1 (Part B): Resend Email OTP
- **Endpoint:** `POST /api/auth/user/register/resend-email-otp`
- **Request Body:**
  ```json
  { "registrationId": "uuid-string", "email": "user@example.com" }
  ```
- **Response:**
  ```json
  { "success": true, "message": "OTP sent to your email address successfully." }
  ```

#### Step 1 (Part C): Verify Email OTP
- **Endpoint:** `POST /api/auth/user/verify-email`
- **Request Body:**
  ```json
  { "registrationId": "uuid-string", "otp": "123456" }
  ```
- **Response:**
  ```json
  { 
    "success": true, 
    "message": "Email verified successfully.", 
    "registrationId": "uuid-string",
    "registration": {
      "fullName": "Shivam Singh",
      "email": "user@example.com",
      "emailVerified": true
    },
    "nextStep": 2
  }
  ```

#### Step 1 (Alternative): "Continue with Google / Gmail" Auth Link
Instead of manually typing an email and waiting for an OTP, users can tap **"Continue with Google"** / **"Continue with Gmail"**.

- **Mobile App Link:**
  ```text
  GET http://localhost:5000/api/auth/user/google/register
  ```
  *(Optional: pass `?registrationId=<uuid>` if name was already entered)*
  - **Redirect Received in Mobile App:**
    `advocateconnect://register-callback?step=2&registrationId=<session_id>&type=user&fullName=<name>&email=<email>`
  - The mobile app automatically extracts `registrationId` and advances the UI directly to **Step 2 (Phone Verification)** with email already verified.

- **Web Browser Link:**
  ```text
  GET http://localhost:5000/api/auth/user/google/register?platform=web
  ```
  - **Redirect Received in Web Client:**
    `http://localhost:5173/register/user?step=2&registrationId=<session_id>`

#### Query Registration Session Details (Helpful for Google OAuth Callback resume)
- **Endpoint:** `GET /api/auth/user/register/session/:registrationId`
- **Response:**
  ```json
  {
    "success": true,
    "session": {
      "id": "uuid-string",
      "fullName": "Shivam Singh",
      "email": "user@example.com",
      "emailVerified": true,
      "phone": "9876543210",
      "phoneVerified": true,
      "accountType": "USER"
    }
  }
  ```

#### Step 2 (Part A): Send Phone OTP
- **Endpoint:** `POST /api/auth/user/send-phone-otp`
- **Request Body:**
  ```json
  {
    "registrationId": "uuid-string",
    "phone": "9876543210"
  }
  ```
- **Response:**
  ```json
  { "success": true, "message": "OTP sent successfully" }
  ```

#### Step 2 (Part B): Verify Phone OTP
- **Endpoint:** `POST /api/auth/user/verify-phone`
- **Request Body:**
  ```json
  {
    "registrationId": "uuid-string",
    "otp": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Phone number verified successfully",
    "phoneVerified": true
  }
  ```

#### Step 3: Complete Profile Details (Address & Location Step)
- **Endpoint:** `POST /api/auth/user/profile`
- **Security Check:** `emailVerified === true` and `phoneVerified === true` must be true in the registration session. If not, the request will be rejected.
- **Request Body:**
  ```json
  {
    "registrationId": "uuid-string",
    "city": "Ghaziabad",
    "state": "Uttar Pradesh",
    "pincode": "201014",
    "latitude": 28.6692,
    "longitude": 77.4538
  }
  ```
- **Location Fields (Optional):**
  - `latitude` — `number` (or float representation), representing the latitude coordinate of user's browser location (fetched via `navigator.geolocation.getCurrentPosition()`).
  - `longitude` — `number` (or float representation), representing the longitude coordinate of user's browser location.
- **Response (Auto-creates User account and clears session):**
  ```json
  {
    "success": true,
    "message": "Profile completed successfully."
  }
  ```
- **Error Response (If phone is not verified yet):**
  ```json
  {
    "success": false,
    "message": "Please verify your phone number before adding your address."
  }
  ```

---

## 4. Advocate Registration Flow (Simplified Wizard)

```text
Step 1: Name + Email (Email OTP / Google)
        ↓
Step 2: Upload Photo & Gender Selection
        ↓
Step 3: Phone OTP Verification (Powerstext SMS)
        ↓
Step 4: Professional Info (Bar Council ID, Aadhaar, Languages)
        ↓
Step 5: Password Security Configuration
        ↓
Step 6: Location Selectors (Country, State, City)
        ↓
Step 7: Review & Finalize Account Creation
```

### Endpoints Reference & Payloads

#### Step 1 (Part A): Start & Send Email OTP
- **Endpoint:** `POST /api/auth/advocate/register/start`
- **Request Body:**
  ```json
  { 
    "fullName": "Shivam Singh", 
    "email": "advocate@example.com",
    "registrationId": "uuid-string" (optional: pass to update/resubmit details)
  }
  ```
- **Response:**
  ```json
  { 
    "success": true, 
    "message": "Verification OTP sent to your email.",
    "registrationId": "uuid-string",
    "email": "advocate@example.com"
  }
  ```

#### Step 1 (Part B): Resend Email OTP
- **Endpoint:** `POST /api/auth/advocate/register/resend-email-otp`
- **Request Body:**
  ```json
  { "registrationId": "uuid-string", "email": "advocate@example.com" }
  ```
- **Response:**
  ```json
  { "success": true, "message": "OTP sent to your email address successfully." }
  ```

#### Step 1 (Part C): Verify Email OTP
- **Endpoint:** `POST /api/auth/advocate/verify-email`
- **Request Body:**
  ```json
  { "registrationId": "uuid-string", "otp": "123456" }
  ```
- **Response:**
  ```json
  { 
    "success": true, 
    "message": "Email verified successfully.", 
    "registrationId": "uuid-string",
    "registration": {
      "fullName": "Shivam Singh",
      "email": "advocate@example.com",
      "emailVerified": true
    },
    "nextStep": 2
  }
  ```

#### Step 1 (Alternative): "Continue with Google / Gmail" Auth Link
Advocates can also tap **"Continue with Google"** / **"Continue with Gmail"** during registration.

- **Mobile App Link:**
  ```text
  GET http://localhost:5000/api/auth/advocate/google/register
  ```
  *(Optional: pass `?registrationId=<uuid>` if name was already entered)*
  - **Redirect Received in Mobile App:**
    `advocateconnect://register-callback?step=2&registrationId=<session_id>&type=advocate&fullName=<name>&email=<email>`
  - The mobile app extracts `registrationId` and advances the UI directly to **Step 2 (Photo & Gender Selection)** with email pre-verified.

- **Web Browser Link:**
  ```text
  GET http://localhost:5000/api/auth/advocate/google/register?platform=web
  ```
  - **Redirect Received in Web Client:**
    `http://localhost:5173/register/advocate?step=2&registrationId=<session_id>`

#### Query Registration Session Details (Helpful for Google OAuth Callback resume)
- **Endpoint:** `GET /api/auth/advocate/register/session/:registrationId`
- **Response:**
  ```json
  {
    "success": true,
    "session": {
      "id": "uuid-string",
      "fullName": "Shivam Singh",
      "email": "advocate@example.com",
      "emailVerified": true,
      "phone": "9876543210",
      "phoneVerified": false,
      "profilePhotoUrl": "...",
      "profilePhotoPublicId": "...",
      "gender": "Male",
      "accountType": "ADVOCATE"
    }
  }
  ```

#### Step 2 (Part A): Upload Profile Photo
- **Endpoint:** `POST /api/auth/advocate/upload-profile-photo`
- **Content-Type:** `multipart/form-data`
- **Body Form-Data:**
  - `profilePhoto`: File (Supports JPG, JPEG, PNG, WEBP. Max size: 5MB)
- **Response:**
  ```json
  {
    "success": true,
    "profilePhotoUrl": "https://res.cloudinary.com/.../advocates/xxxx.png",
    "profilePhotoPublicId": "advocates/xxxx"
  }
  ```

#### Step 2 (Part B): Submit Basic Details
- **Endpoint:** `POST /api/auth/advocate/register/start`
- **Request Body:**
  ```json
  {
    "fullName": "Shivam Singh",
    "email": "advocate@example.com",
    "profilePhotoUrl": "https://res.cloudinary.com/.../advocates/xxxx.png",
    "profilePhotoPublicId": "advocates/xxxx",
    "gender": "Male",
    "registrationId": "uuid-string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "registrationId": "uuid-string"
  }
  ```

#### Step 3: Send & Verify Phone OTP
- **Send OTP:** `POST /api/auth/advocate/send-phone-otp`
  - Body: `{ "registrationId": "uuid-string", "phone": "9876543210" }`
- **Verify OTP:** `POST /api/auth/advocate/verify-phone`
  - Body: `{ "registrationId": "uuid-string", "otp": "123456" }`

#### Steps 4 to 7: Submit Advocate Profile & Complete Registration
- **Endpoint:** `POST /api/auth/advocate/profile`
- **Authentication:** `registrationId` from session (not logged in yet)

> **Note:** `country` is NOT required. This platform is specific to Indian legal services.

- **Request Body:**
  ```json
  {
    "registrationId": "uuid-string",
    "barCouncilId": "MAH/1234/2024",
    "aadhaarNumber": "123456789012",
    "password": "SecurePassword123",
    "languagesSpoken": ["Hindi", "English"],
    "state": "Uttar Pradesh",
    "city": "Ghaziabad",
    "pincode": "201001",
    "latitude": 28.6692,
    "longitude": 77.4538
  }
  ```
- **Location Fields (Optional):**
  - `latitude` — `number` (or float representation), representing the latitude coordinate of advocate's browser location.
  - `longitude` — `number` (or float representation), representing the longitude coordinate of advocate's browser location.

- **Location Field Validation:**
  - `state` — Required, Indian State or Union Territory name, max 100 chars
  - `city` — Required, min 2 chars, max 100 chars
  - `pincode` — Required, **exactly 6 digits** (e.g. `201001`). Must match `^[0-9]{6}$`. Spaces, letters, and 5 or 7+ digit values are rejected.
  - `country` — **Removed. Do not send.**

- **Response:**
  ```json
  {
    "success": true,
    "message": "Registration completed successfully.",
    "advocateId": "advocate-uuid-string"
  }
  ```

- **Postman Testing:**

  | Test | Pincode | Expected |
  |------|---------|----------|
  | Valid | `201001` | `200 OK` |
  | Too short | `20100` | `400 Bad Request` — Pincode must be exactly 6 digits |
  | Too long | `2010011` | `400 Bad Request` — Pincode must be exactly 6 digits |
  | Non-numeric | `ABC123` | `400 Bad Request` — Pincode must be exactly 6 digits |
  | Mixed | `12345a` | `400 Bad Request` — Pincode must be exactly 6 digits |
  | Missing city | send without `city` | `400 Bad Request` — validation failure |
  | Sending country | send with `"country": "India"` | **Ignored** (not in schema) |

---

## 5. Google OAuth — Web and Mobile

### Overview & Architecture
The backend provides a unified Google OAuth implementation supporting both the **Web Application** (Single Page App / Next.js / Vite) and the **React Native Mobile Application** (`WebBrowser.openAuthSessionAsync()`).

```text
                                  GOOGLE OAUTH INITIATION
                        ┌────────────────────────────────────────┐
                        │   GET /api/auth/google?client=web      │
                        │   GET /api/auth/google?client=mobile   │
                        └───────────────────┬────────────────────┘
                                            │
                                  Validate Client Param
                                ('web' | 'mobile' allowed)
                                            │
                                Encode Secure OAuth State
                             { client, registrationId, ... }
                                            │
                                            ▼
                                  Google Authentication
                                            │
                                            ▼
                                  Backend OAuth Callback
                                            │
                               Validate State & Identify Client
                                            │
                             ┌──────────────┴──────────────┐
                             │                             │
                      client === 'web'              client === 'mobile'
                             │                             │
                             ▼                             ▼
                      WEB_CLIENT_URL               MOBILE_CLIENT_URL
                 (http://localhost:5173)         (advocateconnect://)
                             │                             │
               • Set HTTP-only auth_token cookie • Redirect with 60s exchange code
               • Redirect to /dashboard          • Client exchanges code for JWT
```

---

### Environment Variables

Configure distinct client URLs in `.env` for both local development and production deployments:

```env
# Web Client Configuration
WEB_CLIENT_URL="http://localhost:5173"
CLIENT_URL="http://localhost:5173" # Backward-compatible fallback

# Mobile Client Configuration
MOBILE_CLIENT_URL="advocateconnect://"
MOBILE_APP_SCHEME="advocateconnect"

# Google OAuth Credentials & Backend Callbacks
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_USER_LOGIN_CALLBACK_URL="https://your-backend-domain.com/api/auth/user/google/login/callback"
GOOGLE_USER_REGISTER_CALLBACK_URL="https://your-backend-domain.com/api/auth/user/google/register/callback"
GOOGLE_ADVOCATE_LOGIN_CALLBACK_URL="https://your-backend-domain.com/api/auth/advocate/google/login/callback"
GOOGLE_ADVOCATE_REGISTER_CALLBACK_URL="https://your-backend-domain.com/api/auth/advocate/google/register/callback"
```

#### Production Configuration Example
```env
WEB_CLIENT_URL="https://lawyer-web-app.com"
MOBILE_CLIENT_URL="advocateconnect://"
```

---

### OAuth Initiation Endpoints

Initiate OAuth by providing `client=web` or `client=mobile`. If the parameter is omitted, it safely defaults to `web` for backward compatibility.

| Flow | Role | Method & Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Generic Login** | User | `GET /api/auth/google` | `?client=web` or `?client=mobile` | Default Google sign-in |
| **User Login** | User | `GET /api/auth/user/google/login` | `?client=web` or `?client=mobile` | User Google sign-in |
| **User Register** | User | `GET /api/auth/user/google/register` | `?client=web` or `?client=mobile` | User Google registration |
| **Advocate Login** | Advocate | `GET /api/auth/advocate/google/login` | `?client=web` or `?client=mobile` | Advocate Google sign-in |
| **Advocate Register** | Advocate | `GET /api/auth/advocate/google/register` | `?client=web` or `?client=mobile`&`registrationId=...` | Advocate Google registration |

> [!IMPORTANT]
> **Client Validation**:
> Arbitrary client values (e.g. `?client=xyz` or `?client=malicious-url`) are strictly rejected with `400 Bad Request` to prevent open-redirect vulnerabilities.

---

### Web OAuth Flow
1. **Initiation**: Web browser hits `GET /api/auth/google?client=web` (or `GET /api/auth/user/google/login?client=web`).
2. **Google Sign-In**: User logs in with Google.
3. **Backend Callback**: Google redirects back to backend callback (`/api/auth/user/google/login/callback`).
4. **Validation & State**: Backend validates OAuth `state`, recognizes `client === 'web'`.
5. **Success**: Backend signs JWT token, sets secure HTTP-Only `auth_token` cookie, and redirects to `${WEB_CLIENT_URL}/dashboard`.
6. **Error**: If an error occurs (e.g., account not found), backend redirects to `${WEB_CLIENT_URL}/login/user?error=<error_code>`.

---

### React Native Mobile OAuth Flow
1. **Initiation**: Mobile app triggers `WebBrowser.openAuthSessionAsync('https://your-backend-domain.com/api/auth/google?client=mobile', 'advocateconnect://')`.
2. **Google Sign-In**: User authenticates in the in-app browser sheet.
3. **Backend Callback**: Google redirects back to backend callback.
4. **Validation & State**: Backend validates OAuth `state`, recognizes `client === 'mobile'`.
5. **Success**: Backend generates a single-use 60-second exchange code and redirects the browser to:
   ```text
   advocateconnect://auth-callback?code=<single_use_code>&type=user
   ```
6. **Deep Link Capture**: React Native `WebBrowser` captures the `advocateconnect://` deep link callback.
7. **Token Exchange**: Mobile app calls `POST /api/auth/oauth/exchange` with `{ "code": "<single_use_code>" }` to receive the final JWT access token and user profile.
8. **Error**: If authentication fails, backend redirects to:
   ```text
   advocateconnect://auth-callback?error=<error_code>&type=user
   ```

---

### Mobile Deep-Link Specifications

#### 1. Mobile Login Callback Deep Link
- **Success Format:** `advocateconnect://auth-callback?code=<single_use_exchange_code>&type=<user|advocate>`
- **Error Format:** `advocateconnect://auth-callback?error=<error_code>&type=<user|advocate>`
  - Error codes: `google_auth_failed`, `account_not_found`, `account_inactive`, `server_error`

#### 2. Mobile Registration Callback Deep Link
- **Success Format:** `advocateconnect://register-callback?step=<next_step>&registrationId=<session_id>&type=<user|advocate>&fullName=<name>&email=<email>`
- **Error Format:** `advocateconnect://register-callback?error=<error_code>&type=<user|advocate>`
  - Error codes: `account_exists`, `advocate_exists`, `session_expired`, `invalid_registration_state`, `google_auth_failed`, `server_error`

---

### Mobile OAuth Code Exchange API

After receiving `advocateconnect://auth-callback?code=...`, exchange the temporary 60-second code for JWT access tokens.

* **Endpoint:** `POST /api/auth/oauth/exchange` OR `POST /auth/oauth/exchange`
* **Rate Limiting:** OAuth limiter applied (10 requests / 10 minutes)
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "code": "a1b2c3d4e5f67890..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "fullName": "Jane Doe",
      "accountType": "user"
    }
  }
  ```
* **Error Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Invalid or expired OAuth authorization code"
  }
  ```

---

### Testing Instructions (Postman & Browser)

#### 1. Test Web Client OAuth
- Open in browser: `http://localhost:5000/api/auth/google?client=web` (or `/api/auth/user/google/login?client=web`)
- Authenticate with Google.
- **Expected Result**: Redirects to `http://localhost:5173/dashboard` with HTTP-Only cookie `auth_token` set.

#### 2. Test Mobile Client OAuth
- Open in browser / Postman: `http://localhost:5000/api/auth/google?client=mobile` (or `/api/auth/user/google/login?client=mobile`)
- Authenticate with Google.
- **Expected Result**: Redirects to `advocateconnect://auth-callback?code=<code_hex>&type=user`.
- Copy `<code_hex>` and send `POST /api/auth/oauth/exchange` with `{ "code": "<code_hex>" }` to receive JWT.

#### 3. Test Invalid Client Rejection
- Send request: `GET /api/auth/google?client=invalid_client`
- **Expected Result**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Invalid client. Must be \"web\" or \"mobile\""
  }
  ```

---

### Advocate Google Registration Wizard (Preserving State)
To register an Advocate using Google OAuth without losing multi-step wizard state:
1. **Pass Registration ID:** Call `GET /api/auth/advocate/google/register?client=mobile&registrationId=<session_id>`.
2. **Passport State Mapping:** Encodes `registrationId`, `client: "mobile"`, and `scheme` into base64url state parameter.
3. **Google Callback & Auto-Verification:** Upon authentication, backend sets `emailVerified = true` in the `RegistrationSession` and computes the next step.
4. **Resuming Wizard:** Backend redirects to `advocateconnect://register-callback?step=3&registrationId=<session_id>&type=advocate...` (or web URL if `client=web`), seamlessly resuming registration wizard.

---

## 6. Login APIs

### User Phone OTP Login
- **Send OTP:** `POST /api/auth/user/login/send-otp` (Body: `{ "phone": "9876543210" }`)
- **Verify OTP:** `POST /api/auth/user/login/verify-otp` (Body: `{ "phone": "9876543210", "otp": "123456" }`)

### User Email OTP Login
- **Send OTP:** `POST /api/auth/user/login/send-email-otp` (Body: `{ "email": "user@gmail.com" }`)
- **Verify OTP:** `POST /api/auth/user/login/verify-email-otp` (Body: `{ "email": "user@gmail.com", "otp": "123456" }`)

### User "Continue with Google / Gmail" Login
- **Mobile App Link:**
  ```text
  GET http://localhost:5000/api/auth/user/google/login
  ```
  - **Redirect Received in Mobile App:** `advocateconnect://auth-callback?code=<single_use_code>&type=user`
  - **Exchange Token:** Mobile app calls `POST /auth/oauth/exchange` (or `POST /api/auth/oauth/exchange`) with `{ "code": "<single_use_code>" }` to receive JWT access token.
- **Web Browser Link:**
  ```text
  GET http://localhost:5000/api/auth/user/google/login?platform=web
  ```
  - Sets HTTP-only `auth_token` cookie and redirects to `/dashboard`.

### Advocate Phone OTP Login
- **Send OTP:** `POST /api/auth/advocate/login/send-otp` (Body: `{ "phone": "9876543210" }`)
- **Verify OTP:** `POST /api/auth/advocate/login/verify-otp` (Body: `{ "phone": "9876543210", "otp": "123456" }`)

### Advocate Email & Password Login
- **Endpoint:** `POST /api/auth/advocate/login`
- **Request Body:**
  ```json
  {
    "email": "advocate@gmail.com",
    "password": "SecurePassword123"
  }
  ```
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Advocate "Continue with Google / Gmail" Login
- **Mobile App Link:**
  ```text
  GET http://localhost:5000/api/auth/advocate/google/login
  ```
  - **Redirect Received in Mobile App:** `advocateconnect://auth-callback?code=<single_use_code>&type=advocate`
  - **Exchange Token:** Mobile app calls `POST /auth/oauth/exchange` (or `POST /api/auth/oauth/exchange`) with `{ "code": "<single_use_code>" }` to receive JWT access token.
- **Web Browser Link:**
  ```text
  GET http://localhost:5000/api/auth/advocate/google/login?platform=web
  ```
  - Sets HTTP-only `auth_token` cookie and redirects to `/dashboard`.

---

## 7. Get Current Session User Profile (`/api/auth/me`)

- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Requires:** `auth_token` HTTP-only Cookie OR `Authorization: Bearer <token>` Header

### User Response Structure
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "fullName": "Shivam Singh",
    "email": "user@example.com",
    "phone": "9876543210",
    "city": "Ghaziabad",
    "state": "Uttar Pradesh",
    "pincode": "201014",
    "type": "user"
  }
}
```

### Advocate Response Structure
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "fullName": "Shivam Singh",
    "email": "advocate@example.com",
    "phone": "9876543210",
    "profilePhotoUrl": "https://res.cloudinary.com/...",
    "gender": "Male",
    "barCouncilId": "MAH/1234/2024",
    "languagesSpoken": ["Hindi", "English"],
    "country": "India",
    "state": "Uttar Pradesh",
    "city": "Ghaziabad",
    "type": "advocate"
  }
}
```
*Notice: Sensitive Aadhaar numbers and password hashes are never returned.*

---

## 8. Frontend Design & Validation Requirements
Make sure the frontend enforces the following constraints before sending payloads to avoid Zod validation errors:

1. **OTP Code:** Exactly 6 digits, only numbers.
2. **Phone Number:** Exactly 10 digits, only numbers.
3. **Pincode (for User flow):** Exactly 6 digits, only numbers.
4. **Aadhaar Number (for Advocate flow):** Exactly 12 digits, only numbers.
5. **Bar Council ID:** String length 3 to 50 characters.
6. **Languages Spoken:** Non-empty array containing valid text strings.
7. **Password:** Minimum 8 characters.
8. **Gender:** Controlled selection restricted to:
   - `Male`
   - `Female`
   - `Other`
   - `Prefer not to say`
9. **Profile Photo Upload:** Use FormData to upload files:
   ```javascript
   const formData = new FormData();
   formData.append('profilePhoto', fileInput.files[0]);
   const res = await api.post('/auth/advocate/upload-profile-photo', formData);
   ```
10. **Aadhaar Masking:** Ensure Aadhaar numbers are masked on the final review step on the client side (e.g. `XXXX XXXX 1234`).

---

## 9. Advocate Profile Management

This feature enables authenticated Advocates to retrieve, complete, and update their professional profile fields (which are separate from the initial registration data).

### API Authentication & Authorization
- **Required Header/Cookie:** `auth_token` set as HTTP-only cookie.
- **Axios configuration:** `withCredentials: true` must be enabled.
- **Cross-account protection:** Advocate ID is derived directly from the authenticated JWT session. The API does not accept arbitrary Advocate IDs in the body or URL parameters.
- **Role Control:** Logged-out users receive `401 Unauthorized`. Non-Advocate accounts (e.g., standard Users) receive `403 Forbidden`.

### Endpoints Reference & Payloads

#### A. Get Profile Details
- **Method:** `GET`
- **Endpoint:** `/api/advocate/profile`
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "advocate": {
      "id": "uuid-string",
      "fullName": "Shivam Singh",
      "email": "advocate@example.com",
      "phone": "9876543210",
      "profilePhotoUrl": "https://res.cloudinary.com/...",
      "gender": "Male",
      "barCouncilId": "MAH/1234/2024",
      "languagesSpoken": ["Hindi", "English"],
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "experienceYears": 5,
      "casesHandled": 120,
      "practiceAreas": ["Civil Law", "Family Law"],
      "bestPracticeArea": "Property Disputes",
      "about": "Experienced advocate specializing in civil and property disputes with a focus on practical solutions.",
      "courtPractice": ["High Court", "District Court"],
      "topCourtPractised": "Delhi High Court",
      "completeAddress": "Office No. 204, District Court Complex",
      "videoCallChargePerMinute": 50,
      "voiceCallChargePerMinute": 30,
      "offlineVisitingFee": 1000,
      "type": "advocate"
    }
  }
  ```
  *Note: Sensitive fields like `passwordHash` and `aadhaarNumber` are strictly omitted from responses.*

#### B. Update Profile Fields (Partial Updates / PATCH)
- **Method:** `PATCH`
- **Endpoint:** `/api/advocate/profile`
- **Authentication:** Required (Advocate cookie session only)
- **Request Body (Direct Fields Example):**
  ```json
  {
    "experienceYears": 5,
    "casesHandled": 120,
    "practiceAreas": ["Civil Law", "Family Law"],
    "bestPracticeArea": "Property Disputes",
    "topCourtPractised": "Delhi High Court",
    "about": "Experienced advocate specializing in civil and property disputes with a focus on practical solutions.",
    "courtPractice": ["High Court", "District Court"],
    "completeAddress": "Office No. 204, District Court Complex",
    "videoCallChargePerMinute": 50,
    "voiceCallChargePerMinute": 30,
    "offlineVisitingFee": 1000,
    "country": "India",
    "state": "Uttar Pradesh",
    "city": "Ghaziabad"
  }
  ```
- **Request Body (Aliases Example - Fully Supported):**
  ```json
  {
    "experience": 5,
    "casesHandled": 120,
    "practiceAreas": ["Civil Law", "Family Law"],
    "bestPracticeArea": "Property Disputes",
    "topCourtPractised": "Delhi High Court",
    "about": "Experienced advocate specializing in civil and property disputes with a focus on practical solutions.",
    "courtPractice": ["High Court"],
    "videoChargePerMinute": 50,
    "voiceChargePerMinute": 30,
    "offlineVisitingFee": 1000,
    "languages": ["Hindi", "English"]
  }
  ```
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "advocate": {
      "id": "uuid-string",
      "fullName": "Shivam Singh",
      "email": "advocate@example.com",
      "gender": "Male",
      "experienceYears": 5,
      "casesHandled": 120,
      "practiceAreas": ["Civil Law", "Family Law"],
      "bestPracticeArea": "Property Disputes",
      "topCourtPractised": "Delhi High Court",
      "about": "Experienced advocate...",
      "courtPractice": ["High Court"],
      "languagesSpoken": ["Hindi", "English"],
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "videoCallChargePerMinute": 50,
      "voiceCallChargePerMinute": 30,
      "offlineVisitingFee": 1000,
      "averageRating": 4.5,
      "totalReviews": 0
    }
  }
  ```

#### C. Upload Profile Photo
- **Method:** `POST`
- **Endpoint:** `/api/advocate/profile/photo`
- **Content-Type:** `multipart/form-data`
- **Body Form-Data:**
  - `profilePhoto`: File (JPG, JPEG, PNG, WEBP. Max size: 5MB)
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "message": "Photo updated successfully",
    "profilePhotoUrl": "https://res.cloudinary.com/.../new-photo.png",
    "advocate": { ... }
  }
  ```

---

### Backend Validation Schema Rules (Zod)

The `advocateProfileUpdateSchema` enforces the following backend validations:
1. **Experience (`experience` or `experienceYears`):** Integer >= 0 and <= 80 (Years).
2. **Cases Handled (`casesHandled`):** Integer >= 0 and <= 100,000.
3. **Practice Areas (`practiceAreas`):** Array of non-empty strings (maximum 20 areas).
4. **Best Practice Area & Top Court Practised:** Strings, max length 100 characters.
5. **Biography (`about` / `bio`):** String, must contain between 50 and 500 words (word count, not character count, custom split-word refinement validation).
6. **Court Practice (`courtPractice`):** Array of valid text strings representing courts.
7. **Complete Address (`completeAddress`):** String, max length 500 characters.
8. **Charges (`videoCallChargePerMinute` / `videoChargePerMinute`, `voiceCallChargePerMinute` / `voiceChargePerMinute`, `offlineVisitingFee`):** Numbers >= 0. Raw numbers are stored in the database.
9. **Strict Body validation:** Unknown fields are rejected with `.strict()`.

---

### Cloudinary Photo Upload Safety Flow
When updating a photo, the backend uses a transactional sequence:
1. Upload the new file to Cloudinary.
2. If upload succeeds, update the database record (`profilePhotoUrl` and `profilePhotoPublicId`).
3. If database update succeeds, delete the old photo from Cloudinary (using the previous stored `publicId`).
4. If database update fails, delete the *new* Cloudinary asset immediately to prevent orphaned images, leaving the old image intact.

---

### End-to-End Profile Workflow

```text
Advocate Login
      ↓
GET /api/advocate/profile
      ↓
Display Existing Profile
      ↓
Click Edit Profile
      ↓
Modify Professional Information
      ↓
Optional Profile Photo Update
      ↓
PATCH /api/advocate/profile
      ↓
Backend Zod Validation
      ↓
Prisma Update
      ↓
Updated Profile
      ↓
React Refreshes Profile
```

---

## Advocate Bio Validation

Bio must contain between 50 and 500 words.

Minimum: 50 words
Maximum: 500 words

The validation is performed on the backend.

The restriction is strictly based on **word count**, not character count. Word counting trims leading and trailing whitespace and splits text by whitespace tokens (`\s+`), ensuring multiple spaces, tabs, or newlines do not incorrectly inflate the word count.

### Postman Testing Guide

#### Test 1 — 49 words (Below minimum)
**Request:** `PATCH /api/advocate/profile`
```json
{
  "bio": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25 word26 word27 word28 word29 word30 word31 word32 word33 word34 word35 word36 word37 word38 word39 word40 word41 word42 word43 word44 word45 word46 word47 word48 word49"
}
```
**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Bio must contain at least 50 words."
}
```

#### Test 2 — 50 words (Exact minimum boundary)
**Request:** `PATCH /api/advocate/profile`
```json
{
  "bio": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25 word26 word27 word28 word29 word30 word31 word32 word33 word34 word35 word36 word37 word38 word39 word40 word41 word42 word43 word44 word45 word46 word47 word48 word49 word50"
}
```
**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### Test 3 — 500 words (Exact maximum boundary)
**Request:** `PATCH /api/advocate/profile`
*(Payload containing exactly 500 whitespace-separated words)*

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### Test 4 — 501 words (Exceeds maximum)
**Request:** `PATCH /api/advocate/profile`
*(Payload containing 501 whitespace-separated words)*

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Bio must not exceed 500 words."
}
```

---

## 10. Help & Support API

This feature provides a public support ticketing system that does NOT require login, registration, cookies, or JWT headers. Anyone visiting the site (Visitor, User, Advocate, or Admin) can submit a ticket and look up their status.

### API Authorization Matrix
| Feature / Route | Authentication | Visitor | User | Advocate | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Submit Help concern (`POST /api/help`) | None | ✓ Allowed | ✓ Allowed | ✓ Allowed | ✓ Allowed |
| Lookup Help status (`POST /api/help/lookup`) | None | Ref ID + Email | Ref ID + Email | Ref ID + Email | Ref ID + Email |
| Admin List requests (`GET /api/admin/help`) | `x-admin-secret` | ✗ Forbidden | ✗ Forbidden | ✗ Forbidden | ✓ Allowed |
| Admin Get request details (`GET /api/admin/help/:id`) | `x-admin-secret` | ✗ Forbidden | ✗ Forbidden | ✗ Forbidden | ✓ Allowed |
| Admin Respond to request (`PATCH /api/admin/help/:id`) | `x-admin-secret` | ✗ Forbidden | ✗ Forbidden | ✗ Forbidden | ✓ Allowed |

---

### Public Endpoints Reference

#### A. Submit Public Help Request
- **Method:** `POST`
- **Endpoint:** `/api/help`
- **Rate Limit:** 5 requests per 15 minutes per IP.
- **Request Body:**
  ```json
  {
    "name": "Shivam Singh",
    "email": "shivam@example.com",
    "phoneNumber": "9876543210",
    "concern": "I am unable to update my advocate profile. Whenever I try to save, the system returns a CORS methods block."
  }
  ```
- **Response Example (201 Created):**
  ```json
  {
    "success": true,
    "message": "Your help request has been submitted successfully.",
    "referenceId": "HELP-8F4K29"
  }
  ```

#### B. Public Lookup Request Status
- **Method:** `POST`
- **Endpoint:** `/api/help/lookup`
- **Rate Limit:** 5 requests per 15 minutes per IP.
- **Request Body:**
  ```json
  {
    "referenceId": "HELP-8F4K29",
    "email": "shivam@example.com"
  }
  ```
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "helpRequest": {
      "id": "help-request-uuid",
      "referenceId": "HELP-8F4K29",
      "name": "Shivam Singh",
      "email": "shivam@example.com",
      "concern": "I am unable to update my advocate profile...",
      "response": "Resolved the method block. Please check again.",
      "status": "RESOLVED",
      "createdAt": "2026-08-17T15:20:00.000Z",
      "updatedAt": "2026-08-17T15:30:00.000Z",
      "respondedAt": "2026-08-17T15:30:00.000Z"
    }
  }
  ```

#### C. Get Practice Areas List
- **Method:** `GET`
- **Endpoint:** `/api/practice-areas`
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "practiceAreas": [
      {
        "id": "pa-uuid-1",
        "name": "Criminal Law"
      },
      {
        "id": "pa-uuid-2",
        "name": "Civil Law"
      }
    ]
  }
  ```

#### D. Get Courts List
- **Method:** `GET`
- **Endpoint:** `/api/courts`
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "courts": [
      {
        "id": "c-uuid-1",
        "name": "Supreme Court of India"
      },
      {
        "id": "c-uuid-2",
        "name": "Delhi High Court"
      }
    ]
  }
  ```

---

### Admin Endpoints Reference

#### A. List and Filter Help Requests (Paginated)
- **Method:** `GET`
- **Endpoint:** `/api/admin/help`
- **Required Header:** `x-admin-secret` matching `process.env.ADMIN_SECRET` (defaults to `super-admin-secret`).
- **Query Params:**
  - `page`: default 1
  - `limit`: default 20
  - `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED (optional filter)
  - `email`: optional text filter
  - `referenceId`: optional exact filter
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "helpRequests": [
      {
        "id": "help-request-uuid",
        "referenceId": "HELP-8F4K29",
        "name": "Shivam Singh",
        "email": "shivam@example.com",
        "concern": "I am unable to update my advocate profile...",
        "response": null,
        "status": "OPEN",
        "createdAt": "2026-08-17T15:20:00.000Z",
        "updatedAt": "2026-08-17T15:20:00.000Z",
        "respondedAt": null
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

#### B. Get Help Request Details
- **Method:** `GET`
- **Endpoint:** `/api/admin/help/:id`
- **Required Header:** `x-admin-secret` matching `process.env.ADMIN_SECRET` (defaults to `super-admin-secret`).

#### C. Respond to Help Request
- **Method:** `PATCH`
- **Endpoint:** `/api/admin/help/:id`
- **Required Header:** `x-admin-secret` matching `process.env.ADMIN_SECRET` (defaults to `super-admin-secret`).
- **Request Body:**
  ```json
  {
    "response": "Resolved the method block. Please check again.",
    "status": "RESOLVED"
  }
  ```
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "message": "Help request response submitted successfully",
    "helpRequest": {
      "id": "help-request-uuid",
      "referenceId": "HELP-8F4K29",
      "status": "RESOLVED",
      "response": "Resolved the method block. Please check again.",
      "respondedAt": "2026-08-17T15:30:00.000Z"
    }
  }
  ```

---

### Zod Validation Rules (`help.validator.js`)
1. **Public Help Request Schema:**
   - `name`: string, required, trimmed, min 2, max 100 characters.
   - `email`: string, required, trimmed, valid email address format.
   - `concern`: string, required, trimmed, min 10, max 2000 characters.
2. **Public Lookup Schema:**
   - `referenceId`: string, required, trimmed.
   - `email`: string, required, trimmed, valid email address format.
3. **Admin Response Schema:**
   - `response`: string, required, trimmed, min 1, max 2000 characters.
   - `status`: enum restricted to `['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']`.

---

### Postman Testing Workflow

#### 1. Public Ticket Submission
1. Open Postman, make a request `POST {{BASE_URL}}/api/help`.
2. Do not supply cookies or authorization headers.
3. Request Body:
   ```json
   {
     "name": "Test Visitor",
     "email": "test@example.com",
     "phoneNumber": "9876543210",
     "concern": "I am experiencing issues logging in using Google OAuth."
   }
   ```
4. Click send and verify it returns a secure Reference ID (e.g. `HELP-A3B9X1`).

#### 2. Public Status Lookup
1. Make a request `POST {{BASE_URL}}/api/help/lookup`.
2. Body:
   ```json
   {
     "referenceId": "HELP-A3B9X1",
     "email": "test@example.com"
   }
   ```
3. Send and verify it loads the concern and `"OPEN"` status.
4. Try with a different email (e.g. `wrong@example.com`). Verify it returns `404 Not Found`.

#### 3. Admin Response
1. Switch to a request `PATCH {{BASE_URL}}/api/admin/help/{{TICKET_DATABASE_UUID}}`. (Copy database UUID from the lookup details response).
2. Under Headers tab, add:
   - Key: `x-admin-secret`
   - Value: `super-admin-secret`
3. Request Body:
   ```json
   {
4. Send and verify it successfully updates the database.
5. Re-run step 2 (Public Status Lookup) and verify `status` is now `RESOLVED` and `response` contains the admin reply text.

## Lawyer Directory - Method: `GET`
- **Endpoint:** `/api/advocates`
- **Authentication:** Optional (Supports Guest Users & Authenticated Users)
  * **Guest Users:** Default listing and sorting (or manual filters).
  * **Authenticated Users:** If the user is logged in as a Client/User (via `auth_token` cookie), their location coordinates (`latitude`/`longitude` or resolved `pincode`) are automatically resolved and used to sort matching advocates nearest-first by default (when no explicit manual `sort` parameter is provided).
- **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `limit`: Number of advocates per page (default: `12`)
  - `search`: Case-insensitive search on Name, Top Court Practised, City, State, and exact match on Practice Areas.
  - `sort`: `rating` (sort by rating descending), `experience` (sort by experience descending), `casesHandled` (sort by cases handled descending). Ignored for proximity sorting when `pincode` is supplied or when an authenticated user location is available and the default sort option is selected.
  - `practiceArea`: Filter by practice area name string.
  - `practiceAreaId`: Filter by practice area ID.
  - `topCourtPractised`: Filter by top court practised name string.
  - `topCourtPractisedId`: Filter by top court practised ID.
  - `bestPracticeArea`: Filter by best practice area name.
  - `courtPractice`: Filter by specific court practice (e.g., array item matches).
  - `state`: Filter by state.
  - `city`: Filter by city.
  - `experienceYears`: Filter by minimum years of experience (greater than or equal).
  - `rating`: Filter by minimum average rating (e.g. `4.5`).
  - `pincode`: Optional 6-digit numeric Indian pincode (e.g. `110001`). If supplied, overrides user location and calculates distance to each advocate using the Haversine formula and sorts results by nearest distance first.

#### Proximity Sorting & Distance Calculation
* **Location Resolution:** 
  1. If `pincode` query param is supplied, it is resolved first (manually overridden).
  2. Otherwise, if the user is authenticated, the backend looks up their user profile. If `latitude` and `longitude` are present, they are used directly. If only a `pincode` is present on the user, it is resolved.
* **Distance Sorting:**
  * Distance is calculated in kilometers using the Haversine formula ($R = 6371\text{ km}$).
  * Advocates with resolved location coordinates will have their distance computed.
  * If a manual `sort` key is selected (e.g., experience or rating), results are sorted by that key instead, but the calculated distance is still attached to the results if reference coordinates are available.
  * Advocates with no coordinate data are placed at the end of the list (distance is set to `null`).

#### Postman Testing Guide

##### Test 1 — Public Guest Listing (No Authentication)
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates`
* **Expected Response:** `200 OK`. Returns advocates sorted by creation date descending. No `distance` field is present.

##### Test 2 — Authenticated User Proximity Sorting (Delhi User)
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates`
* **Headers:** Pass the HTTP-only cookie `auth_token` for a user located in Delhi (e.g. `client.rahul@example.com`).
* **Expected Response:** `200 OK`. Returns advocates sorted with nearest (Delhi advocates) first. Each advocate has a `"distance"` key showing kilometers from the user.

##### Test 3 — Authenticated User + Practice Area Filter
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates?practiceArea=Criminal%20Law`
* **Headers:** Pass the HTTP-only cookie `auth_token`.
* **Expected Response:** `200 OK`. Returns only advocates who practice `Criminal Law`, ordered by proximity to the logged-in user.

##### Test 4 — Manual Pincode Override (Overriding Logged-in User Location)
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates?pincode=400001`
* **Headers:** Pass the HTTP-only cookie `auth_token` for a Delhi user.
* **Expected Response:** `200 OK`. Returns advocates sorted by distance to Mumbai (`400001`) instead of the user's location in Delhi.

##### Test 5 — Authenticated User with Manual Sort Override
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates?sort=experience`
* **Headers:** Pass the HTTP-only cookie `auth_token`.
* **Expected Response:** `200 OK`. Returns advocates sorted by experience descending. The `"distance"` field is still calculated and attached to each record.

##### Test 6 — Invalid Pincode Format
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates?pincode=1100` (less than 6 digits) or `pincode=ABC001` (non-numeric)
* **Expected Response:** `400 Bad Request`.

##### Test 7 — Unknown Pincode
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates?pincode=999999`
* **Expected Response:** `400 Bad Request`.

##### Test 8 — Pagination
* **Method:** `GET`
* **URL:** `{{BASE_URL}}/api/advocates?page=2&limit=5`
* **Expected Response:** `200 OK`. Returns the next slice of proximity-sorted advocates. Sorting occurs before pagination.

- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "advocates": [
      {
        "id": "uuid-string",
        "fullName": "Advocate Name",
        "profilePhotoUrl": "...",
        "experienceYears": 8,
        "casesHandled": 145,
        "practiceAreas": ["Criminal Law", "Civil Law"],
        "bestPracticeArea": "Criminal Litigation",
        "courtPractice": ["High Court"],
        "topCourtPractised": "Delhi High Court",
        "languagesSpoken": ["Hindi", "English"],
        "country": "India",
        "state": "Uttar Pradesh",
        "city": "Ghaziabad",
        "videoCallChargePerMinute": 50,
        "voiceCallChargePerMinute": 30,
        "offlineVisitingFee": 1000,
        "averageRating": 4.6,
        "totalReviews": 28
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

### 2. Get Public Lawyer Profile
- **Method:** `GET`
- **Endpoint:** `/api/advocates/:id`
- **Authentication:** None (Public)
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "advocate": {
      "id": "uuid-string",
      "fullName": "Advocate Name",
      "profilePhotoUrl": "...",
      "gender": "MALE",
      "experienceYears": 8,
      "casesHandled": 145,
      "practiceAreas": ["Criminal Law", "Civil Law"],
      "bestPracticeArea": "Criminal Litigation",
      "courtPractice": ["High Court"],
      "topCourtPractised": "Delhi High Court",
      "languagesSpoken": ["Hindi", "English"],
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "completeAddress": "District Court Complex",
      "videoCallChargePerMinute": 50,
      "voiceCallChargePerMinute": 30,
      "offlineVisitingFee": 1000,
      "averageRating": 4.6,
      "totalReviews": 28
    }
  }
  ```

### Review & Rating Rules & Constraints
- **Review Rating Range:** Individual reviews can only have integer ratings from `0` to `5` inclusive.
- **Average-Rating Calculation:** The average rating of an advocate is calculated as the sum of all their review ratings divided by the total number of reviews.
- **Rounding Rule:** The calculated average is rounded to exactly **one decimal place** using standard round half-up behavior. E.g., `4.34` rounds to `4.3`, `4.35` to `4.4`, `4.36` to `4.4`, and `5` to `5.0` (which is formatted to one decimal place on display).
- **Reviewing Constraints:**
  - Only authenticated standard Users can submit, edit, or delete reviews.
  - Advocates cannot submit reviews.
  - A standard User can review a specific Advocate only once (enforced by a database unique constraint `@@unique([userId, advocateId])`).

### 3. Get Lawyer Reviews
- **Method:** `GET`
- **Endpoint:** `/api/advocates/:id/reviews`
- **Authentication:** None (Public)
- **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `limit`: Reviews per page (default: `10`)
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "reviews": [
      {
        "id": "uuid-string",
        "rating": 5,
        "reviewText": "Very professional advocate.",
        "createdAt": "2026-08-15T00:00:00.000Z",
        "user": {
          "fullName": "Shivam Singh"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "summary": {
      "averageRating": 5.0,
      "totalReviews": 1,
      "distribution": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 1
      }
    }
  }
  ```

### 4. Create Review
- **Method:** `POST`
- **Endpoint:** `/api/advocates/:advocateId/review`
- **Authentication:** Required (User accounts only)
- **Request Body:**
  ```json
  {
    "rating": 5,
    "reviewText": "The advocate was professional and explained everything clearly."
  }
  ```
- **Response Example (201 Created):**
  ```json
  {
    "success": true,
    "message": "Review submitted successfully.",
    "review": {
      "id": "uuid-string",
      "userId": "user-uuid",
      "advocateId": "adv-uuid",
      "rating": 5,
      "reviewText": "..."
    }
  }
  ```

### 5. Update Review
- **Method:** `PATCH`
- **Endpoint:** `/api/advocates/:advocateId/review`
- **Authentication:** Required (User accounts only, owner only)
- **Request Body:** Same as Create.

### 6. Delete Review
- **Method:** `DELETE`
- **Endpoint:** `/api/advocates/:advocateId/review`
- **Authentication:** Required (User accounts only, owner only)

---

## 9. Aadhaar DigiLocker Verification & Lockout (Advocate registration Step 4)

To complete the profile registration, advocates must verify their Aadhaar using IDSPay DigiLocker KYC. The backend enforces a 3-attempt failure limit and a 24-hour lockout.

### 1. Initiate Verification
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/initiate`
- **Request Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "aadhaarNumber": "123456789012"
  }
  ```
- **Response Example (200 OK - Successful Initiation):**
  ```json
  {
    "success": true,
    "clientId": "mock_success_id",
    "url": "http://localhost:5173/digilocker-mock-success"
  }
  ```
- **Response Example (400 Bad Request - Malformed Aadhaar, increments failed attempts):**
  ```json
  {
    "success": false,
    "message": "Aadhaar number must be exactly 12 digits.",
    "remainingAttempts": 2,
    "blocked": false,
    "blockedUntil": null
  }
  ```
- **Response Example (403 Forbidden - Locked Out):**
  ```json
  {
    "success": false,
    "message": "Aadhaar verification is temporarily blocked. Please try again after 24 hours.",
    "blocked": true,
    "blockedUntil": "2026-08-21T10:30:00.000Z"
  }
  ```

### 2. Fetch Verification Status
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/verify`
- **Request Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "clientId": "mock_success_id"
  }
  ```
- **Response Example (200 OK - Successful Verification):**
  ```json
  {
    "success": true,
    "aadhaarVerified": true,
    "message": "Aadhaar verified successfully."
  }
  ```
- **Response Example (400 Bad Request - Verification failed / not completed):**
  ```json
  {
    "success": false,
    "message": "Aadhaar verification failed.",
    "remainingAttempts": 1,
    "blocked": false,
    "blockedUntil": null
  }
  ```

---

# Aadhaar Verification Attempt Limit - Postman Testing

Follow these steps in Postman to verify the 3-attempt limit and 24-hour lockout.

### Prerequisites
1. Start Advocate registration using `POST /api/auth/advocate/register/start`.
2. Extract the returned `<registrationId>`.
3. Complete Email verification and Phone verification steps to unlock the professional information stage.

---

### Test 1 — First Failed Verification (Incorrect/Fail Aadhaar)
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/initiate`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "aadhaarNumber": "123456789000"
  }
  ```
  *(Returns `clientId: "mock_fail_id"`, which simulates a failed DigiLocker validation).*
- Check status using:
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/verify`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "clientId": "mock_fail_id"
  }
  ```
- **Expected Response:**
  ```json
  {
    "success": false,
    "message": "Aadhaar verification failed.",
    "remainingAttempts": 2,
    "blocked": false,
    "blockedUntil": null
  }
  ```

---

### Test 2 — Second Failed Verification (Incorrect format)
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/initiate`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "aadhaarNumber": "12345"
  }
  ```
  *(Invalid 5-digit string triggers validation failure, which counts as an attempt).*
- **Expected Response:**
  ```json
  {
    "success": false,
    "message": "Aadhaar number must be exactly 12 digits.",
    "remainingAttempts": 1,
    "blocked": false,
    "blockedUntil": null
  }
  ```

---

### Test 3 — Third Failed Verification
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/initiate`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "aadhaarNumber": "123456789000"
  }
  ```
- Check status:
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/verify`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "clientId": "mock_fail_id"
  }
  ```
- **Expected Response:**
  ```json
  {
    "success": false,
    "message": "Aadhaar verification failed. Aadhaar verification has been blocked for 24 hours.",
    "remainingAttempts": 0,
    "blocked": true,
    "blockedUntil": "2026-08-21T12:22:00.000Z"
  }
  ```

---

### Test 4 — Fourth Attempt During Block
- Try initiating another verification:
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/initiate`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "aadhaarNumber": "123456789012"
  }
  ```
- **Expected Response (403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Aadhaar verification is temporarily blocked. Please try again after 24 hours.",
    "blocked": true,
    "blockedUntil": "2026-08-21T12:22:00.000Z"
  }
  ```
  *(Notice that IDSPay is NOT called and request is rejected instantly).*

---

### Test 5 — Reset/Success After 24 Hours
If you wait 24 hours (or manually change the database `aadhaarBlockedUntil` in Neon to a past date), the block expires:
- **Method:** `POST`
- **Endpoint:** `/api/auth/advocate/aadhaar/initiate`
- **Body:**
  ```json
  {
    "registrationId": "<registrationId>",
    "aadhaarNumber": "123456789012"
  }
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "clientId": "mock_success_id",
    "url": "http://localhost:5173/digilocker-mock-success"
  }
  ```
  *(Attempts counter is reset to 0, blockedUntil becomes null, and verification initiates successfully).*

---

## 9. Saved Lawyers Feature

This feature allows authenticated users to save (bookmark) advocates for future reference, view their list of saved advocates, and remove advocates from their saved list.

### Base Endpoint: `/api/saved-lawyers`
*All endpoints below require authentication. Standard cookie session `auth_token` must be present.*

---

### A. Save Lawyer
Allows an authenticated user to save an advocate.
- **Method:** `POST`
- **Endpoint:** `/api/saved-lawyers`
- **Authentication:** Required (Standard Client/User type only)
- **Request Body:**
  ```json
  {
    "advocateId": "uuid-of-advocate"
  }
  ```
- **Response Example (201 Created):**
  ```json
  {
    "success": true,
    "message": "Lawyer saved successfully.",
    "saved": {
      "id": "uuid-of-saved-record",
      "userId": "uuid-of-user",
      "advocateId": "uuid-of-advocate",
      "createdAt": "2026-08-21T16:25:20.000Z"
    }
  }
  ```
- **Error Response Example (400 Bad Request - Already Saved):**
  ```json
  {
    "success": false,
    "message": "Lawyer is already saved"
  }
  ```

---

### B. Get Saved Lawyers
Retrieves all advocates saved by the currently authenticated user.
- **Method:** `GET`
- **Endpoint:** `/api/saved-lawyers`
- **Authentication:** Required (Standard Client/User type only)
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "advocates": [
      {
        "id": "uuid-of-advocate",
        "fullName": "Adv. Rajesh Sharma",
        "profilePhotoUrl": "...",
        "gender": "Male",
        "experienceYears": 14,
        "casesHandled": 245,
        "practiceAreas": ["Criminal Law", "Civil Law"],
        "bestPracticeArea": "Criminal Law",
        "courtPractice": ["Delhi High Court"],
        "languagesSpoken": ["English", "Hindi"],
        "state": "Delhi",
        "city": "New Delhi",
        "completeAddress": "Chamber 405...",
        "videoCallChargePerMinute": 60,
        "voiceCallChargePerMinute": 40,
        "offlineVisitingFee": 2500,
        "averageRating": 4.3,
        "totalReviews": 3,
        "isSaved": true
      }
    ]
  }
  ```

---

### C. Remove Saved Lawyer
Removes an advocate from the authenticated user's saved list.
- **Method:** `DELETE`
- **Endpoint:** `/api/saved-lawyers/:advocateId`
- **Authentication:** Required (Standard Client/User type only)
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lawyer removed from saved list successfully."
  }
  ```
- **Error Response Example (400 Bad Request - Not Saved):**
  ```json
  {
    "success": false,
    "message": "Saved lawyer not found"
  }
  ```

---

### Postman Testing Steps

#### Test 1 — Save Valid Lawyer
1. Login as standard user (e.g. `client.rahul@example.com`).
2. Make `POST /api/saved-lawyers` request with a valid `advocateId`.
3. Verify status code is `201 Created` and `success` is `true`.

#### Test 2 — Duplicate Save Protection
1. Make the exact same `POST /api/saved-lawyers` request with the same `advocateId`.
2. Verify status code is `400 Bad Request` and `message` is `"Lawyer is already saved"`.

#### Test 3 — Unauthorized Access
1. Make `GET /api/saved-lawyers` without passing the `auth_token` cookie.
2. Verify status code is `401 Unauthorized` (or matches standard auth middleware format).

#### Test 4 — Retrieve Saved Lawyers List
1. Make `GET /api/saved-lawyers` with user session cookie.
2. Verify status code is `200 OK` and the returned `advocates` array contains the saved advocate.

#### Test 5 — User Isolation
1. Login as User A (`client.rahul@example.com`) and save Advocate X.
2. Login as User B (`client.rohit@example.com`) and call `GET /api/saved-lawyers`.
3. Verify that Advocate X is **NOT** present in User B's saved lawyers list.

#### Test 6 — Remove Saved Lawyer
1. Make `DELETE /api/saved-lawyers/<advocateId>` with user session cookie.
2. Verify status code is `200 OK` and `"success": true`.
3. Call `GET /api/saved-lawyers` and verify the list is now empty.
4. Verify that the advocate still exists in the general directory `GET /api/advocates` (the advocate itself was not deleted).

#### Test 7 — Remove Unsaved Lawyer
1. Make `DELETE /api/saved-lawyers/<advocateId>` for a lawyer that is not saved.
2. Verify status code is `400 Bad Request` and `message` is `"Saved lawyer not found"`.

---

## 9. Logout APIs & Client Integration Guide

This section documents the User and Advocate logout APIs, including testing instructions for both Web (Cookie-based) and Mobile/API (Header-based) environments.

### Authentication & Stateless JWT Architecture Note
> [!NOTE]
> The backend session mechanism uses completely stateless JSON Web Tokens (JWT). Because JWT tokens are stateless, **logout cannot physically revoke or invalidate an already-issued token on the server side** (as there is no database storage or token blacklist).
> - **Web Clients:** The server clears the `auth_token` cookie from the browser on logout.
> - **Mobile/API Clients:** The client must delete the stored JWT access token from its local secure storage (e.g., Keychain, SharedPreferences, Expo SecureStore) upon receiving a successful logout response. Subsequent requests with that token will naturally be accepted until it expires, unless deleted locally by the client.

---

### API Specifications

#### User Logout
- **Endpoint:** `POST /api/user/logout` (Alternative: `POST /api/auth/user/logout`)
- **HTTP Method:** `POST`
- **Authentication Required:** Yes (Active User session via Cookie or Bearer Token)
- **Headers:** 
  - Web: None (Cookie is automatically sent by the browser)
  - Mobile: `Authorization: Bearer <ACCESS_TOKEN>`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Error Responses:**
  - **401 Unauthorized (Missing/Expired/Invalid Token or Cookie):**
    ```json
    {
      "success": false,
      "message": "Authentication required. Please login."
    }
    ```

#### Advocate Logout
- **Endpoint:** `POST /api/advocate/logout` (Alternative: `POST /api/auth/advocate/logout`)
- **HTTP Method:** `POST`
- **Authentication Required:** Yes (Active Advocate session via Cookie or Bearer Token)
- **Headers:** 
  - Web: None (Cookie is automatically sent by the browser)
  - Mobile: `Authorization: Bearer <ACCESS_TOKEN>`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Error Responses:**
  - **401 Unauthorized (Missing/Expired/Invalid Token or Cookie):**
    ```json
    {
      "success": false,
      "message": "Authentication required. Please login."
    }
    ```

---

### Postman Testing Guides

#### 1. Web / Cookie Testing Flow

This test validates standard web browser sessions using HTTP-only cookies.

##### User Flow:
1. **Login:** Send a request to `POST /api/auth/user/login/verify-otp` (or the equivalent OTP login verification endpoint) with valid credentials.
2. **Verify Cookie:** Confirm that the server returns a Set-Cookie header for `auth_token`.
3. **Protected API Access:** Make a `GET /api/auth/me` request. Confirm it succeeds and returns user details.
4. **Logout:** Call `POST /api/user/logout` (or `POST /api/auth/user/logout`).
5. **Verify Cookie Cleared:** Confirm that the response clears the `auth_token` cookie (sets it to expire immediately).
6. **Protected API Check:** Call `GET /api/auth/me` again. Verify that the response returns `401 Unauthorized`.

##### Advocate Flow:
1. **Login:** Send a request to `POST /api/auth/advocate/login` with valid email and password credentials.
2. **Verify Cookie:** Confirm that the server returns a Set-Cookie header for `auth_token`.
3. **Protected API Access:** Make a `GET /api/auth/me` request. Confirm it succeeds and returns advocate details.
4. **Logout:** Call `POST /api/advocate/logout` (or `POST /api/auth/advocate/logout`).
5. **Verify Cookie Cleared:** Confirm that the response clears the `auth_token` cookie.
6. **Protected API Check:** Call `GET /api/auth/me` again. Verify that the response returns `401 Unauthorized`.

---

#### 2. Mobile / Bearer Token Testing Flow

This test validates mobile app sessions using Authorization headers.

##### User Flow:
1. **Login:** Send a request to `POST /api/auth/user/login/verify-otp` (or the equivalent OTP login verification endpoint).
2. **Retrieve Token:** Copy the `"token"` string returned in the JSON response body.
3. **Protected API Access:** Call `GET /api/auth/me`, passing the token in the header:
   ```http
   Authorization: Bearer <ACCESS_TOKEN>
   ```
   Confirm that the response returns the user profile.
4. **Logout:** Send a request to `POST /api/user/logout` (or `POST /api/auth/user/logout`), passing the same Authorization header.
5. **Client Cleanup:** Delete the token from your local storage/testing client variables.
6. **Protected API Check:** Attempt to call `GET /api/auth/me` without headers. Verify that the response returns `401 Unauthorized`.

##### Advocate Flow:
1. **Login:** Send a request to `POST /api/auth/advocate/login` with email and password.
2. **Retrieve Token:** Copy the `"token"` string returned in the JSON response body.
3. **Protected API Access:** Call `GET /api/auth/me` passing the token in the header:
   ```http
   Authorization: Bearer <ACCESS_TOKEN>
   ```
   Confirm that the response returns the advocate profile.
4. **Logout:** Send a request to `POST /api/advocate/logout` (or `POST /api/auth/advocate/logout`), passing the same Authorization header.
5. **Client Cleanup:** Delete the token from your local storage/testing client variables.
6. **Protected API Check:** Attempt to call `GET /api/auth/me` without headers. Verify that the response returns `401 Unauthorized`.

---

### Mobile Developer Integration Reference

#### Web Client
* **Authentication Storage:** Browsers automatically receive, store, and send the HTTP-only `auth_token` cookie.
* **Logout Actions:** Make a `POST` request to the logout API. The backend handles clearing the cookie automatically.

#### Mobile Client
* **Authentication Storage:** Mobile apps must extract the `token` string from the successful login response JSON body, and save it locally in secure storage (Keychain / SharedPreferences / Expo SecureStore).
* **Authenticated Requests:** Send the stored token in the `Authorization` header as a Bearer token:
  ```http
  Authorization: Bearer <your_token>
  ```
* **Logout Actions:** Make a `POST` request to the logout API (with the Authorization header). Upon success, the mobile app **must delete the token from local storage**. Do not rely on browser cookie clearing.

---

## 11. Advocate Aadhaar OTP Verification (Sandbox API)

The legal platform supports two methods for Advocate Aadhaar verification during registration:
1. **DigiLocker/IDSPay** (Existing redirection-based flow)
2. **Aadhaar OTP** (Direct OTP-based flow using Sandbox API)

### 11.1 Method 2: Sandbox Aadhaar OTP Flow Details

This is a direct 2-step verification method:
1. **Generate OTP:** The advocate submits their 12-digit Aadhaar number. The backend calls Sandbox to trigger an OTP sent to the mobile number linked with their Aadhaar. Sandbox returns a `reference_id`.
2. **Verify OTP:** The advocate enters the 6-digit OTP received on their phone. The backend sends the `reference_id` and `otp` to Sandbox. If successful, Aadhaar is marked as verified, and the advocate can proceed to step 4 of registration.

---

### 11.2 API Reference

#### 11.2.1 Generate Aadhaar OTP
* **Endpoint:** `POST /api/auth/advocate/aadhaar/otp/generate`
* **Headers:**
  ```http
  Content-Type: application/json
  ```
* **Request Body:**
  ```json
  {
    "registrationId": "uuid-registration-session-id",
    "aadhaar_number": "123456789012"
  }
  ```
* **Request Validation:**
  * `registrationId` must be a valid UUID.
  * `aadhaar_number` must be exactly 12 digits (no spaces, special characters, or alphabets allowed).
* **Response (Success):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "reference_id": "1234567"
  }
  ```
* **Common Errors:**
  * `400 Bad Request`: Invalid Aadhaar format or invalid session ID.
  * `403 Forbidden`: Aadhaar verification temporarily blocked (due to 3 incorrect verification attempts).
  * `502 Bad Gateway`: Sandbox provider connection error.

---

#### 11.2.2 Verify Aadhaar OTP
* **Endpoint:** `POST /api/auth/advocate/aadhaar/otp/verify`
* **Headers:**
  ```http
  Content-Type: application/json
  ```
* **Request Body:**
  ```json
  {
    "registrationId": "uuid-registration-session-id",
    "reference_id": "1234567",
    "otp": "123456"
  }
  ```
* **Request Validation:**
  * `registrationId` must be a valid UUID.
  * `reference_id` must be a non-empty string.
  * `otp` must be exactly 6 numeric digits.
* **Response (Success):**
  ```json
  {
    "success": true,
    "aadhaarVerified": true,
    "message": "Aadhaar verified successfully."
  }
  ```
* **Common Errors:**
  * `400 Bad Request`: Incorrect OTP or reference ID mismatch. Returns `remainingAttempts`, `blocked` (boolean), and `blockedUntil` (timestamp if blocked).
  * `403 Forbidden`: Aadhaar verification temporarily blocked (max attempts reached).

---

### Aadhaar Storage

The application stores the Aadhaar number in its original form (`123456789012`) after successful verification.

Aadhaar must not be exposed in public APIs or application logs unless explicitly authorized by the existing business requirements.

---

### 11.3 Postman Testing Workflow

Use these instructions to test the direct Aadhaar OTP verification via Postman.

#### Setup Postman Environment Variables
Create a Postman Environment and add these variables:
* `BACKEND_URL` - `http://localhost:5000`
* `registrationId` - The UUID received from `POST /api/auth/advocate/register/start` response.
* `reference_id` - Leave blank (will be populated from the OTP generation response).

*(Note: Keep your actual Sandbox API credentials secure in your local backend `.env` file; do not put them in shared collection files or READMEs).*

#### Test Cases

##### Step 1: Start Registration
* **Method & URL:** `POST {{BACKEND_URL}}/api/auth/advocate/register/start`
* **Body:**
  ```json
  {
    "fullName": "Demo Lawyer",
    "email": "demo.lawyer@example.com"
  }
  ```
* Save the returned `registrationId` to your Postman environment.

##### Step 2: Generate OTP (Success & Mock Bypass)
* **Method & URL:** `POST {{BACKEND_URL}}/api/auth/advocate/aadhaar/otp/generate`
* **Body:**
  ```json
  {
    "registrationId": "{{registrationId}}",
    "aadhaar_number": "123456789012"
  }
  ```
  *(Note: `123456789012` is the mock bypass Aadhaar. For a live test, use a real Aadhaar number).*
* **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "reference_id": "mock_ref_xxxxxxx"
  }
  ```
* Copy the returned `reference_id` into your Postman environment variable `reference_id`.

##### Step 3: Verify OTP (Incorrect Code)
* **Method & URL:** `POST {{BACKEND_URL}}/api/auth/advocate/aadhaar/otp/verify`
* **Body:**
  ```json
  {
    "registrationId": "{{registrationId}}",
    "reference_id": "{{reference_id}}",
    "otp": "000000"
  }
  ```
* **Response:**
  ```json
  {
    "success": false,
    "message": "Invalid OTP.",
    "remainingAttempts": 2,
    "blocked": false,
    "blockedUntil": null
  }
  ```

##### Step 4: Verify OTP (Correct Code & Success)
* **Method & URL:** `POST {{BACKEND_URL}}/api/auth/advocate/aadhaar/otp/verify`
* **Body:**
  ```json
  {
    "registrationId": "{{registrationId}}",
    "reference_id": "{{reference_id}}",
    "otp": "123456"
  }
  ```
  *(Note: `123456` is the mock bypass OTP for mock reference IDs).*
* **Response:**
  ```json
  {
    "success": true,
    "aadhaarVerified": true,
    "message": "Aadhaar verified successfully."
  }
  ```

##### Step 5: Complete Registration
* Proceed to submit additional profile photos, verify email/phone, and call `POST /api/auth/advocate/profile` to complete registration. The Advocate record in the database will be created with `aadhaarVerificationMethod` saved as `OTP`.


---

## 12. Content Creator & Blog Feature

This feature adds a third role (`CONTENT_CREATOR`) to the application and introduces a public read-only Blog system.

### 12.1 Authentication defaults
- **Role:** `CONTENT_CREATOR`
- **Default Account:**
  - **Email:** `trainee6@techvunex.in`
  - **Password:** `1234`
- **Session:** Uses the same HTTP-only secure cookie `auth_token` or `Authorization: Bearer <token>` header as other roles.

---

### 12.2 API Reference

#### 1. Content Creator Login
- **Endpoint:** `POST /api/content-creator/login`
- **Request Body:**
  ```json
  {
    "email": "trainee6@techvunex.in",
    "password": "1234"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "JWT_TOKEN",
    "contentCreator": {
      "id": "content-creator-uuid",
      "email": "trainee6@techvunex.in",
      "fullName": "Content Creator"
    }
  }
  ```
  *(Note: It also sets the `auth_token` HTTP-only cookie).*

#### 2. Create Blog
- **Endpoint:** `POST /api/blogs`
- **Authentication:** `CONTENT_CREATOR` role required.
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `image`: Image file (required, max 5MB, JPEG/PNG/WEBP)
  - `heading`: string (required)
  - `title`: string (required)
  - `date`: string (valid date format, e.g. `2026-08-26`) (required)
  - `writtenBy`: string (required)
  - `content`: string (required)
  - `metaTitle`: string (required, trimmed, max 60 characters)
  - `metaDescription`: string (required, trimmed, max 160 characters)
  - `metaKeywords`: string (optional, trimmed, comma-separated keywords)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Blog created successfully",
    "blog": {
      "id": "blog-uuid",
      "heading": "Legal Awareness",
      "title": "Understanding Bail Laws in India",
      "slug": "understanding-bail-laws-in-india",
      "date": "2026-08-26T00:00:00.000Z",
      "writtenBy": "Techvunex Legal Content Team",
      "content": "Complete blog content...",
      "image": "https://res.cloudinary.com/...",
      "imagePublicId": "...",
      "metaTitle": "Understanding Bail Laws in India | Legal Guide",
      "metaDescription": "Learn about bail laws in India, types of bail, eligibility, and the legal process explained simply.",
      "metaKeywords": [
        "bail laws India",
        "bail process",
        "legal rights",
        "Indian law"
      ],
      "contentCreator": {
        "id": "creator-uuid",
        "name": "Techvunex Legal Content Team",
        "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60",
        "bio": "Legal content creator focused on simplifying Indian legal information and making legal knowledge easier to understand."
      },
      "authorId": "content-creator-uuid",
      "published": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

#### 3. Get All Blogs — PUBLIC (Paginated)
- **Endpoint:** `GET /api/blogs`
- **Query Parameters:**
  - `page`: positive integer (optional, default: `1`)
  - `limit`: positive integer (optional, default: `10`, maximum: `50`)
- **Authentication:** None (Public)
- **Response:**
  ```json
  {
    "success": true,
    "blogs": [
      {
        "id": "blog-uuid",
        "image": "https://res.cloudinary.com/...",
        "heading": "Legal Awareness",
        "title": "Understanding Bail Laws in India",
        "slug": "understanding-bail-laws-in-india",
        "date": "2026-08-26T00:00:00.000Z",
        "writtenBy": "Techvunex Legal Content Team",
        "content": "Complete blog content...",
        "metaTitle": "Understanding Bail Laws in India | Legal Guide",
        "metaDescription": "Learn about bail laws in India, types of bail, eligibility, and the legal process explained simply.",
        "metaKeywords": [
          "bail laws India",
          "bail process",
          "legal rights",
          "Indian law"
        ],
        "contentCreator": {
          "id": "creator-uuid",
          "name": "Techvunex Legal Content Team",
          "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60",
          "bio": "Legal content creator focused on simplifying Indian legal information and making legal knowledge easier to understand."
        },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalBlogs": 15,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

#### 4. Get Single Blog — PUBLIC
- **Endpoint:** `GET /api/blogs/:id` (Accepts either the UUID `id` or the unique URL `slug`)
- **Authentication:** None (Public)
- **Response:**
  ```json
  {
    "success": true,
    "blog": {
      "id": "blog-uuid",
      "image": "https://res.cloudinary.com/...",
      "heading": "Legal Awareness",
      "title": "Understanding Bail Laws in India",
      "slug": "understanding-bail-laws-in-india",
      "date": "2026-08-26T00:00:00.000Z",
      "writtenBy": "Techvunex Legal Content Team",
      "content": "Complete blog content...",
      "metaTitle": "Understanding Bail Laws in India | Legal Guide",
      "metaDescription": "Learn about bail laws in India, types of bail, eligibility, and the legal process explained simply.",
      "metaKeywords": [
        "bail laws India",
        "bail process",
        "legal rights",
        "Indian law"
      ],
      "contentCreator": {
        "id": "creator-uuid",
        "name": "Techvunex Legal Content Team",
        "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60",
        "bio": "Legal content creator focused on simplifying Indian legal information and making legal knowledge easier to understand."
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

#### 5. Update Blog
- **Endpoint:** `PUT /api/blogs/:id`
- **Authentication:** `CONTENT_CREATOR` (Owner only)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `image`: New image file (optional, max 5MB, JPEG/PNG/WEBP)
  - `heading`: string (optional)
  - `title`: string (optional, regenerates `slug` if modified)
  - `date`: string (optional, valid date format)
  - `writtenBy`: string (optional)
  - `content`: string (optional)
  - `metaTitle`: string (required, trimmed, max 60 characters)
  - `metaDescription`: string (required, trimmed, max 160 characters)
  - `metaKeywords`: string (optional, trimmed, comma-separated keywords)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Blog updated successfully",
    "blog": {
      "id": "blog-uuid",
      "heading": "Legal Awareness",
      "title": "Understanding Bail Laws in India",
      "slug": "understanding-bail-laws-in-india",
      "date": "2026-08-26T00:00:00.000Z",
      "writtenBy": "Techvunex Legal Content Team",
      "content": "Updated blog content...",
      "image": "https://res.cloudinary.com/...",
      "imagePublicId": "...",
      "metaTitle": "Understanding Bail Laws in India | Legal Guide",
      "metaDescription": "Learn about bail laws in India, types of bail, eligibility, and the legal process explained simply.",
      "metaKeywords": [
        "bail laws India",
        "bail process",
        "legal rights",
        "Indian law"
      ],
      "contentCreator": {
        "id": "creator-uuid",
        "name": "Techvunex Legal Content Team",
        "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60",
        "bio": "Legal content creator focused on simplifying Indian legal information and making legal knowledge easier to understand."
      },
      "authorId": "content-creator-uuid",
      "published": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

#### 6. Delete Blog
- **Endpoint:** `DELETE /api/blogs/:id`
- **Authentication:** `CONTENT_CREATOR` (Owner only)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Blog deleted successfully"
  }
  ```

---

### 12.3 Seeding Mock Blogs

The project contains a database seed script to populate exactly 15 legal blog posts. This data is essential to verify pagination and relationship mapping.
To run the seed script:
```bash
node prisma/seed.js
```
*Note: This operation is idempotent. Running it repeatedly cleans up existing mock creator blogs first, ensuring exactly 15 blogs exist in the database.*

### 12.4 Postman Testing Flow (Pagination & Creator Profile)

Follow this structured flow to test the pagination and creator profile integrations:

#### Test 1 — First Page
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=1&limit=10`
* **Authentication:** None (Public)
* **Verify:** Returns status `200 OK` with 10 blogs. The pagination metadata should be:
  ```json
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalBlogs": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
  ```
  Ensure each blog in the response list includes the `contentCreator` nested object with `name`, `image`, and `bio`.

#### Test 2 — Second Page
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=2&limit=10`
* **Authentication:** None (Public)
* **Verify:** Returns status `200 OK` with 5 blogs. The pagination metadata should be:
  ```json
  "pagination": {
    "currentPage": 2,
    "limit": 10,
    "totalBlogs": 15,
    "totalPages": 2,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
  ```

#### Test 3 — Different Page Size
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=1&limit=5`
* **Authentication:** None (Public)
* **Verify:** Returns status `200 OK` with 5 blogs, `totalBlogs` = 15, and `totalPages` = 3.

#### Test 4 — Public Access
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=1&limit=10` without sending any authentication tokens/cookies.
* **Verify:** Works successfully without any authorization issues.

#### Test 5 — Invalid Page Parameter
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=0&limit=10`
* **Verify:** Returns status `400 Bad Request` with Zod validation error: `"Page must be a positive integer"`.

#### Test 6 — Invalid Limit Parameter
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=1&limit=0`
* **Verify:** Returns status `400 Bad Request` with Zod validation error: `"Limit must be a positive integer"`.

#### Test 7 — Maximum Limit Policy
* **Method & URL:** `GET {{BACKEND_URL}}/api/blogs?page=1&limit=1000`
* **Verify:** Returns status `400 Bad Request` with validation error: `"Limit cannot exceed 50"`, enforcing a strict client limit policy.

---

### 12.5 Important Note on SEO Ranking

> [!NOTE]
> Pushing SEO metadata fields through this API provides structured content for the frontend to populate HTML page headers (`<title>`, `<meta name="description">`, `<meta name="keywords">`). The backend validates and returns this structured data, but does not guarantee search engine ranking. Search engine ranking depends on content quality, mobile usability, page performance, crawlability, and page experience. Modern search engines generally do not use the `meta keywords` tag as a ranking factor, but they are supported for metadata organization.

---

## 13. ADMIN APIs & Advocate Management

This section documents the Admin authentication system, Content Creator account creation, Advocate status management, and the Lawyer Visibility Rules.

### 13.1 Role Model Overview

The system supports four distinct roles:
1. `USER`: Normal client looking for legal services.
2. `ADVOCATE`: Legal practitioner providing services.
3. `CONTENT_CREATOR`: Content manager who writes and maintains public blogs.
4. `ADMIN`: Administrative account with access to system management.

---

### 13.2 Default Admin Credentials & Seeding

The system automatically seeds an idempotent Admin account:
* **Email:** `it2@techvunex.in`
* **Password:** `123456` *(Stored as a bcrypt password hash, never plain text)*
* **Role:** `ADMIN`

---

### 13.3 Critical Lawyer Visibility Rule

> [!IMPORTANT]
> **Database-Enforced Advocate Visibility**:
> Normal Users can ONLY discover Advocates whose `status` is set to `ACTIVE`.
> When an Admin sets an Advocate's status to `BLOCKED`:
> - The Advocate is strictly excluded from `GET /api/advocates` (Directory / Discovery / Search / Filter).
> - The Advocate is strictly excluded from nearby lawyer searches (`GET /api/advocates?pincode=...` or location-based sorting).
> - Direct profile access via `GET /api/advocates/:id` returns `404 Not Found`.
> - Saved lawyer listings (`GET /api/saved-lawyers`) exclude blocked Advocates.
> 
> When an Admin changes the Advocate's status back to `ACTIVE`, the Advocate becomes discoverable again across all normal user APIs.

---

### 13.4 Admin API Endpoints

#### 1. Admin Login
* **Endpoint:** `POST /api/admin/login`
* **Authentication:** Public
* **Request Body:**
  ```json
  {
    "email": "it2@techvunex.in",
    "password": "123456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "admin": {
      "id": "admin-uuid",
      "email": "it2@techvunex.in",
      "fullName": "System Admin",
      "role": "ADMIN"
    }
  }
  ```
  *(Also sets HTTP-only `auth_token` cookie for web clients).*

#### 2. Create Content Creator Account
* **Endpoint:** `POST /api/admin/content-creators`
* **Authentication:** `ADMIN` required (`requireAuth`, `requireRole('ADMIN')`)
* **Request Body:**
  ```json
  {
    "name": "Content Creator Name",
    "email": "creator@example.com",
    "password": "securePassword",
    "bio": "Short bio about the content creator.",
    "image": "https://example.com/image.jpg"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Content Creator account created successfully",
    "contentCreator": {
      "id": "creator-uuid",
      "name": "Content Creator Name",
      "fullName": "Content Creator Name",
      "email": "creator@example.com",
      "image": "https://example.com/image.jpg",
      "bio": "Short bio about the content creator.",
      "role": "CONTENT_CREATOR",
      "createdAt": "2026-09-01T07:48:51.138Z"
    }
  }
  ```
  *(Password/passwordHash is NEVER returned in the response. Creating a duplicate email returns `409 Conflict`).*

#### 3. List Content Creators
* **Endpoint:** `GET /api/admin/content-creators`
* **Authentication:** `ADMIN` required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "contentCreators": [
      {
        "id": "creator-uuid",
        "name": "Techvunex Legal Content Team",
        "fullName": "Techvunex Legal Content Team",
        "email": "trainee6@techvunex.in",
        "image": "https://...",
        "bio": "Legal content creator...",
        "role": "CONTENT_CREATOR",
        "createdAt": "2026-08-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### 4. List Advocates (Management View)
* **Endpoint:** `GET /api/admin/advocates`
* **Authentication:** `ADMIN` required
* **Description:** Returns both `ACTIVE` and `BLOCKED` Advocates for management. Excludes sensitive auth secrets (password hashes, Aadhaar numbers, tokens).
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "advocates": [
      {
        "id": "advocate-uuid",
        "name": "Adv. Rajesh Sharma",
        "fullName": "Adv. Rajesh Sharma",
        "email": "adv.rajesh@example.com",
        "phone": "9876543210",
        "status": "ACTIVE",
        "lawType": "Criminal Law",
        "barCouncilId": "D/1234/2015",
        "state": "Delhi",
        "city": "New Delhi",
        "pincode": "110001",
        "createdAt": "2026-08-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### 5. Block Advocate
* **Endpoint:** `PATCH /api/admin/advocates/:advocateId/status`
* **Authentication:** `ADMIN` required
* **Request Body:**
  ```json
  {
    "status": "BLOCKED"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate status updated successfully",
    "data": {
      "id": "advocate-uuid",
      "status": "BLOCKED"
    }
  }
  ```

#### 6. Activate Advocate
* **Endpoint:** `PATCH /api/admin/advocates/:advocateId/status`
* **Authentication:** `ADMIN` required
* **Request Body:**
  ```json
  {
    "status": "ACTIVE"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate status updated successfully",
    "data": {
      "id": "advocate-uuid",
      "status": "ACTIVE"
    }
  }
  ```

---

## 14. ADVOCATE PROFILE APPROVAL WORKFLOW

This section documents the Advocate profile approval flow introduced between registration/profile completion and public visibility/booking.

### 14.1 Status & Visibility Rules Matrix

```text
PENDING
→ Profile submitted, waiting for Admin approval
→ Not publicly visible
→ Not available for booking/connection (GET /api/advocates & GET /api/advocates/:id return 404/hidden)

APPROVED + ACTIVE
→ Publicly visible
→ Available for booking/connection
→ Can appear in lawyer search, nearby lawyers, pincode search

APPROVED + BLOCKED
→ Not publicly visible
→ Not available for booking/connection

REJECTED
→ Not publicly visible
→ Not available for booking/connection
→ Can be resubmitted after profile update/correction (returns status to PENDING)
```

**Critical Business Rule**:
```text
┌─────────────────────────────────────────┐
│ approvalStatus = APPROVED               │
│                 AND                     │
│ accountStatus = ACTIVE                  │
└─────────────────────────────────────────┘
                    ↓
          Visible + Available
```

---

### 14.2 Approval Workflow Endpoints

#### 1. Advocate Submit Profile for Approval
* **Endpoint:** `POST /api/advocates/profile/submit-for-approval` (alias: `POST /api/advocate/profile/submit-for-approval`)
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Validation:** Advocate ID comes from authenticated token. Validates required profile fields (`fullName`, `phone`, `barCouncilId`, `profilePhotoUrl`, `practiceAreas`/`bestPracticeArea`, `experienceYears`, `about`, `city`, `state`, `pincode`, `emailVerified`, `phoneVerified`).
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Your profile has been submitted for admin approval"
  }
  ```
* **Incomplete Profile Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Please complete your Advocate profile before submitting it for approval"
  }
  ```

#### 2. Admin View Pending Advocates Queue
* **Endpoint:** `GET /api/admin/advocates/pending`
* **Authentication:** `ADMIN` required (`requireAuth`, `requireRole('ADMIN')`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "advocate-uuid",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "barId": "BAR12345",
        "profileImage": "https://example.com/photo.jpg",
        "lawType": "Criminal Law",
        "experience": 8,
        "city": "Delhi",
        "profileCompleted": true,
        "approvalStatus": "PENDING"
      }
    ]
  }
  ```

#### 3. Admin Review Advocate Profile
* **Endpoint:** `GET /api/admin/advocates/:advocateId`
* **Authentication:** `ADMIN` required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "advocate-uuid",
      "fullName": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "barCouncilId": "BAR12345",
      "profilePhotoUrl": "https://example.com/photo.jpg",
      "approvalStatus": "PENDING",
      "status": "ACTIVE"
    }
  }
  ```

#### 4. Admin Approve Advocate
* **Endpoint:** `PATCH /api/admin/advocates/:advocateId/approve`
* **Authentication:** `ADMIN` required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate profile approved successfully",
    "data": {
      "id": "advocate-uuid",
      "approvalStatus": "APPROVED",
      "status": "ACTIVE",
      "accountStatus": "ACTIVE"
    }
  }
  ```

#### 5. Admin Reject Advocate
* **Endpoint:** `PATCH /api/admin/advocates/:advocateId/reject`
* **Authentication:** `ADMIN` required
* **Request Body:**
  ```json
  {
    "reason": "BAR ID verification information is incomplete"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate profile rejected",
    "data": {
      "id": "advocate-uuid",
      "approvalStatus": "REJECTED",
      "accountStatus": "ACTIVE",
      "rejectionReason": "BAR ID verification information is incomplete"
    }
  }
  ```

---

### 14.3 Complete Postman Step-by-Step Testing Guide

#### Test 1 — Register Advocate
1. Call registration API to register a new Advocate.
2. Verify initial state in DB: `approvalStatus = PENDING`.

#### Test 2 — Login Advocate
1. Call `POST /api/auth/advocate/login/email-password` with advocate credentials.
2. Store the returned `token`. Verify Advocate authenticates cleanly.

#### Test 3 — Complete Profile
1. Call `PATCH /api/advocate/profile` with `Authorization: Bearer <advocate_token>`.
2. Fill all required profile fields (`experienceYears`, `practiceAreas`, `bestPracticeArea`, `about`, `courtPractice`, address).
3. Upload profile photo via `POST /api/advocate/profile/photo`.

#### Test 4 — Submit Profile for Approval
1. Call `POST /api/advocates/profile/submit-for-approval` with `Authorization: Bearer <advocate_token>`.
2. Verify response:
   ```json
   {
     "success": true,
     "message": "Your profile has been submitted for admin approval"
   }
   ```

#### Test 5 — Normal User Searches Lawyers
1. Login as Normal User.
2. Call `GET /api/advocates?search=<Advocate_Name>`.
3. Verify the pending Advocate does **NOT** appear in search results.

#### Test 6 — Normal User Fetches Pending Advocate
1. Call `GET /api/advocates/:advocateId` for the pending Advocate.
2. Verify response is `404 Not Found`.

#### Test 7 — Admin Views Pending Advocates
1. Login as Admin (`POST /api/admin/login`). Store `admin_token`.
2. Call `GET /api/admin/advocates/pending` with `Authorization: Bearer <admin_token>`.
3. Verify the submitted Advocate appears in `data` list with `approvalStatus = "PENDING"`.

#### Test 8 — Admin Reviews Profile
1. Call `GET /api/admin/advocates/:advocateId` with `Authorization: Bearer <admin_token>`.
2. Verify complete advocate profile details are returned for Admin review without exposing passwords/tokens.

#### Test 9 — Admin Approves Advocate
1. Call `PATCH /api/admin/advocates/:advocateId/approve` with `Authorization: Bearer <admin_token>`.
2. Verify response: `approvalStatus = "APPROVED"` and `accountStatus = "ACTIVE"`.

#### Test 10 — Normal User Searches Again
1. As Normal User, call `GET /api/advocates?search=<Advocate_Name>`.
2. Verify the approved Advocate now appears in the lawyer search results.

#### Test 11 — Normal User Fetches Profile
1. Call `GET /api/advocates/:advocateId`.
2. Verify profile returns `200 OK` with `likeCount`, `isLiked`, and `team` fields included.


#### Test 13 — Admin Rejects Advocate
1. Register another Advocate and submit their profile for approval.
2. As Admin, call `PATCH /api/admin/advocates/:advocateId/reject` with body `{"reason": "BAR ID verification information is incomplete"}`.
3. Verify response: `approvalStatus = "REJECTED"` and `rejectionReason` is populated.

#### Test 14 — Rejected Advocate Hidden
1. As Normal User, search lawyers (`GET /api/advocates`), fetch profile (`GET /api/advocates/:id`), and attempt booking.
2. Verify rejected Advocate returns 404 / is hidden and unavailable.

#### Test 15 — Re-submit Rejected Profile
1. Login as the rejected Advocate.
2. Update profile details and call `POST /api/advocates/profile/submit-for-approval`.
3. Verify `approvalStatus = "PENDING"` and old rejection reason is cleared.
4. Verify Advocate remains hidden from Normal Users until Admin approves again.

#### Test 16 — Admin Blocks Approved Advocate
1. As Admin, call `PATCH /api/admin/advocates/:advocateId/status` with `{"status": "BLOCKED"}` on an approved Advocate.
2. Verify state: `approvalStatus = "APPROVED"`, `accountStatus = "BLOCKED"`.
3. Verify Normal Users can no longer see, book, or connect with the Advocate.

#### Test 17 — Admin Activates Advocate
1. As Admin, call `PATCH /api/admin/advocates/:advocateId/status` with `{"status": "ACTIVE"}`.
2. Verify state: `approvalStatus = "APPROVED"`, `accountStatus = "ACTIVE"`.
3. Verify Advocate becomes publicly visible and bookable again.
    "message": "Advocate status updated successfully",
    "data": {
      "id": "advocate-uuid",
      "status": "ACTIVE"
    }
  }
  ```

---

### 13.5 Postman & Role Authorization Matrix

| Endpoint | Unauthenticated | Normal User | Advocate | Content Creator | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /api/admin/login` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| `POST /api/admin/content-creators` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 201 |
| `GET /api/admin/content-creators` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `GET /api/admin/advocates` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `PATCH /api/admin/advocates/:id/status` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |

---


## 15. ADVOCATE LIKE FEATURE

A logged-in Normal User can like an Advocate once and can later unlike the Advocate. Each User can have only one like per Advocate, enforced at the database level.

### Overview & Rules
* **Target:** Applies strictly to **Advocates/Lawyers**. (No likes or comments are added to Blogs).
* **Combination:** Each like record represents `User + Advocate`.
* **Database Constraint:** `@@unique([userId, advocateId])` prevents duplicate like records.
* **Role Authorization:** Only users with `AccountType = USER` (`req.user.type === 'user'`) can create or remove likes.
* **ACTIVE/BLOCKED Behavior:**
  * Only `ACTIVE` Advocates can receive new likes from Normal Users. Attempting to like a `BLOCKED` Advocate returns `400 Bad Request` (`This lawyer is currently unavailable.`).
  * Existing likes are preserved when an Advocate is blocked by Admin, but blocked Advocates are excluded from public discovery and `GET /api/user/liked-advocates`.
  * If the Advocate is later unblocked (`ACTIVE`), historical likes become available again.

---

### 15.1 Like Advocate API
* **Method:** `POST`
* **Endpoint:** `/api/advocates/:advocateId/like`
* **Authentication:** `USER` required (`requireAuth`, `requireRole('USER')`)
* **Request Body:** None required (`userId` is automatically extracted from JWT/session token).
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate liked successfully",
    "data": {
      "advocateId": "advocate-uuid",
      "liked": true,
      "likeCount": 26
    }
  }
  ```
* **Duplicate Like Response (409 Conflict):**
  ```json
  {
    "success": false,
    "message": "You have already liked this advocate."
  }
  ```
* **Blocked Advocate Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "This lawyer is currently unavailable."
  }
  ```

---

### 15.2 Unlike Advocate API
* **Method:** `DELETE`
* **Endpoint:** `/api/advocates/:advocateId/like`
* **Authentication:** `USER` required (`requireAuth`, `requireRole('USER')`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate unliked successfully",
    "data": {
      "advocateId": "advocate-uuid",
      "liked": false,
      "likeCount": 25
    }
  }
  ```
* **Not Liked Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "You have not liked this advocate."
  }
  ```

---

### 15.3 Get User's Liked Advocates API
* **Method:** `GET`
* **Endpoint:** `/api/user/liked-advocates`
* **Authentication:** `USER` required (`requireAuth`, `requireRole('USER')`)
* **Description:** Returns only `ACTIVE` Advocates liked by the currently authenticated User.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "advocate-uuid",
        "name": "Advocate Name",
        "fullName": "Advocate Name",
        "profilePhotoUrl": "https://res.cloudinary.com/...",
        "gender": "Male",
        "experienceYears": 12,
        "casesHandled": 150,
        "practiceAreas": ["Criminal Law", "Civil Law"],
        "topCourtPractised": "Delhi High Court",
        "bestPracticeArea": "Criminal Law",
        "about": "Experienced High Court litigation advocate...",
        "courtPractice": ["Delhi High Court", "Supreme Court"],
        "languagesSpoken": ["English", "Hindi"],
        "state": "Delhi",
        "city": "New Delhi",
        "completeAddress": "Chamber 402, High Court",
        "videoCallChargePerMinute": 50,
        "voiceCallChargePerMinute": 30,
        "offlineVisitingFee": 1500,
        "averageRating": 4.8,
        "totalReviews": 25,
        "status": "ACTIVE",
        "likeCount": 26,
        "isLiked": true
      }
    ]
  }
  ```

---

### 15.4 Advocate Discovery & Profile Integration
All Advocate listing and public profile endpoints (`GET /api/advocates`, `GET /api/advocates/:id`, `GET /api/lawyers/:id`) return the latest database state including:
* `likeCount`: Total number of Users who currently like this Advocate (computed via database relation count).
* `isLiked`: `true` if the requesting client is an authenticated `USER` who has liked the Advocate; `false` for unauthenticated requests or users who have not liked the Advocate.
* `team`: Contains confirmed, active mutual Team Mates of the Advocate (`[ { id, name, barId, profileImage, lawType, city, state, status } ]`). PENDING requests and BLOCKED team members are automatically excluded.

---

### 15.5 Complete Postman Testing Flow

1. **Login as Normal User (User A)**
   - Login using the existing Normal User login API. Save access token / session.
2. **Fetch Advocate Profile**
   - Call `GET /api/advocates/:advocateId` or `GET /api/lawyers/:advocateId`.
   - Verify the response contains `likeCount`, `isLiked`, `team`, and all existing Advocate fields.
3. **Like Advocate**
   - Call `POST /api/advocates/:advocateId/like` as User A.
   - Then fetch `GET /api/advocates/:advocateId` $\rightarrow$ Verify `isLiked: true` and `likeCount` has increased by 1.
4. **Unlike Advocate**
   - Call `DELETE /api/advocates/:advocateId/like` as User A.
   - Then fetch `GET /api/advocates/:advocateId` $\rightarrow$ Verify `isLiked: false` and `likeCount` has decreased.
5. **Create Team Mate**
   - Login as Advocate A.
   - Search Advocate B by Name or BAR ID (`GET /api/advocates/search?query=...`).
   - Send Team Request (`POST /api/advocates/:advocateId/team-request`).
   - Complete OTP verification (`POST /api/advocates/team-request/:requestId/verify`).
6. **Fetch Advocate Profile After Team Connection**
   - As a Normal User, call `GET /api/advocates/:advocateAId` (or `GET /api/lawyers/:advocateAId`).
   - Verify `team` array contains Advocate B.
7. **Verify Pending Team Requests Are Hidden**
   - Create a new Team Request from Advocate A to Advocate C, but do NOT complete OTP verification.
   - Fetch Advocate A's profile as a Normal User $\rightarrow$ Verify pending Advocate C does NOT appear in `team`.
8. **Verify Blocked Team Member Rule**
   - Admin changes a team member's status to `BLOCKED`.
   - Fetch Advocate profile as a Normal User $\rightarrow$ Verify the blocked Advocate is excluded from `team`.
9. **Verify Multiple Users' Likes**
   - Login as User B and like the same Advocate.
   - Fetch profile as User B $\rightarrow$ Verify `isLiked: true` and `likeCount` reflects both likes.
   - Switch back to User A $\rightarrow$ Verify `isLiked` is calculated per authenticated User, not globally stored.

---

### 15.6 Final Advocate Like Permission Matrix

| Feature | User | Advocate | Content Creator | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Like Advocate | ✅ | ❌ | ❌ | ❌ |
| Unlike Advocate | ✅ | ❌ | ❌ | ❌ |
| View Advocate Like Count | ✅ | ✅ | ✅ | ✅ |
| View Own Liked Advocates | ✅ | ❌ | ❌ | ❌ |
| Manage Advocate Likes | ❌ | ❌ | ❌ | ❌ |
| Block / Activate Advocate | ❌ | ❌ | ❌ | ✅ |

---

## 16. ADVOCATE TEAM MATE FEATURE

An authenticated **ADVOCATE** (Advocate A) can search for another advocate (Advocate B) using their **Name or BAR ID**, view their profile, send a team member request, and verify it via a 6-digit OTP sent to Advocate B's registered mobile number. Once verified, a mutual team mate relationship is established.

### Overview & Security Rules
* **Role Authorization:** `ADVOCATE` only (`requireAuth`, `requireRole('ADVOCATE')`). Normal Users, Content Creators, and Admins cannot initiate or verify team requests.
* **Name or BAR ID Search:** Case-insensitive search on `fullName` or `barCouncilId`. Exposes only safe public profile data. Supports partial name searches and pagination.
* **Self-Exclusion & Self-Add Protection:** An advocate cannot find themselves in search results or send a team request to themselves (`400 Bad Request`).
* **ACTIVE/BLOCKED Enforcement:** Target advocate must exist and have status `ACTIVE` (`isActive: true`). Rejects requests to `BLOCKED` advocates (`403 Forbidden`).
* **OTP Delivery:** 6-digit cryptographically secure OTP is hashed with `bcrypt` and sent to **Advocate B's registered mobile number** via SMS. Valid for 5 minutes.
* **OTP Verification:** Only the requesting Advocate (Advocate A) can submit the OTP to complete the team connection. Limited to 5 attempts.
* **Mutual Team Relationship:** Once verified, a single canonical DB record `(min(A,B), max(A,B))` establishes a mutual relationship (`A ↔ B`) visible in both advocates' team lists.

---

### 16.1 Search Advocate by Name or BAR ID
* **Method:** `GET`
* **Endpoint:** `/api/advocates/search?query=<name-or-bar-id>&page=1&limit=10`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Query Parameters:**
  * `query` (string, required): Matches either Advocate's full name (partial, case-insensitive) or BAR ID (exact, case-insensitive). Max length 100 chars.
  * `page` (integer, optional, default: 1): Page number for pagination.
  * `limit` (integer, optional, default: 10, max: 50): Number of results per page.
* **Example Requests:**
  * Search by BAR ID: `GET /api/advocates/search?query=BAR12345`
  * Search by Partial Name: `GET /api/advocates/search?query=Rahul&page=1&limit=10`
  * Search by Full Name: `GET /api/advocates/search?query=Rahul%20Sharma`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "advocate-b-uuid",
        "name": "Rahul Sharma",
        "fullName": "Rahul Sharma",
        "barId": "BAR12345",
        "barCouncilId": "BAR12345",
        "profileImage": "https://res.cloudinary.com/...",
        "profilePhotoUrl": "https://res.cloudinary.com/...",
        "lawType": "Criminal Law",
        "bestPracticeArea": "Criminal Law",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "status": "ACTIVE",
        "experienceYears": 8
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```
* **Validation Error (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Search query parameter is required."
  }
  ```

---

### 16.2 Send Team Request / Initiate OTP
* **Method:** `POST`
* **Endpoint:** `/api/advocates/:advocateId/team-request`
* **Authentication:** `ADVOCATE` required with **Admin Approved Profile** (`requireAuth`, `requireRole('ADVOCATE')`, `requireApprovedAdvocate`)
* **Path Parameters:** `advocateId` (ID of Target Advocate B)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Team request initiated successfully. OTP sent to Advocate's registered mobile number.",
    "data": {
      "requestId": "team-request-uuid",
      "targetAdvocateId": "advocate-b-uuid",
      "maskedPhone": "******2222",
      "expiresInMinutes": 5
    }
  }
  ```
* **Error Responses:**
  * **Pending Admin Approval (403 Forbidden):** `{"success": false, "message": "Your advocate profile must be approved by admin before you can send team requests."}`
  * **Rejected Admin Approval (403 Forbidden):** `{"success": false, "message": "Your advocate profile has not been approved by admin. You cannot send team requests."}`
  * **Self-Add (400 Bad Request):** `{"success": false, "message": "You cannot add yourself as a team mate"}`
  * **Blocked Advocate (403 Forbidden):** `{"success": false, "message": "Target advocate is currently unavailable or blocked."}`
  * **Already Team Mates (409 Conflict):** `{"success": false, "message": "Advocate is already in your team."}`
  * **Duplicate Pending Request (409 Conflict):** `{"success": false, "message": "A pending team request already exists for this advocate."}`

---

### 16.3 Verify Team Request OTP
* **Method:** `POST`
* **Endpoint:** `/api/advocates/team-request/:requestId/verify`
* **Authentication:** `ADVOCATE` required (Must be the requesting Advocate A)
* **Path Parameters:** `requestId`
* **Request Body:**
  ```json
  {
    "otp": "123456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate successfully added as your team mate",
    "data": {
      "requestId": "team-request-uuid",
      "teamMateId": "advocate-b-uuid",
      "verified": true
    }
  }
  ```
* **Error Responses:**
  * **Invalid OTP (400 Bad Request):** `{"success": false, "message": "Invalid OTP"}`
  * **Expired OTP (400 Bad Request):** `{"success": false, "message": "OTP has expired"}`
  * **Unauthorized Verifier (403 Forbidden):** `{"success": false, "message": "Access forbidden. You are not the requester of this team request."}`

---

### 16.4 View Advocate Team Mates
* **Method:** `GET`
* **Endpoint:** `/api/advocates/team-mates`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "teamMates": [
      {
        "id": "advocate-b-uuid",
        "name": "Rahul Sharma",
        "fullName": "Rahul Sharma",
        "barId": "BAR12345",
        "barCouncilId": "BAR12345",
        "profileImage": "https://res.cloudinary.com/...",
        "profilePhotoUrl": "https://res.cloudinary.com/...",
        "experience": 8,
        "lawType": "Criminal Law",
        "bestPracticeArea": "Criminal Law",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "status": "ACTIVE"
      }
    ]
  }
  ```
* **Key Fields:**
  * `barId` → Advocate's Bar ID (populated from `barCouncilId`)
  * `barCouncilId` → Advocate's Bar Council ID
  * `experience` → Advocate's experience from the Advocate profile (in years)


---

### 16.5 Remove Team Mate
* **Method:** `DELETE`
* **Endpoint:** `/api/advocates/team-mates/:advocateId`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Path Parameters:** `advocateId` (ID of the team mate to remove)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Team mate removed successfully."
  }
  ```
* **Not Found Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Team mate relationship not found."
  }
  ```

---

### 16.6 Complete Postman Testing Flow

```text
1. Login Advocate A
   - Call Advocate login endpoint to obtain access token for Advocate A.

2. Search by BAR ID
   - Call: GET /api/advocates/search?query=BAR12345
   - Verify Advocate B is returned in data array.

3. Search by Name
   - Call: GET /api/advocates/search?query=Rahul
   - Verify matching Advocates are returned with pagination meta.

4. Search Full Name
   - Call: GET /api/advocates/search?query=Rahul%20Sharma
   - Verify correct Advocate is returned.

5. Search Case Insensitivity
   - Test queries: rahul, Rahul, RAHUL
   - Verify output is consistent across letter cases.

6. Search Own Name/BAR ID
   - Search Advocate A's own Name or BAR ID.
   - Verify Advocate A is excluded from results / cannot send team request to self.

7. Select Advocate B
   - Obtain advocateId for Advocate B from search results.

8. Send Team Request
   - Call: POST /api/advocates/:advocateId/team-request
   - Verify OTP generated, sent to Advocate B's registered mobile, requestId returned. OTP itself NOT returned.

9. Verify OTP
   - Call: POST /api/advocates/team-request/:requestId/verify
   - Body: { "otp": "123456" }
   - Verify team relationship created.

10. Get Team Mates
    - Call: GET /api/advocates/team-mates
    - Verify Advocate B appears in Advocate A's team list.

11. Duplicate Team Request
    - Try sending another team request to Advocate B.
    - Verify 409 Conflict returned.

12. Search BLOCKED Advocate
    - Admin sets Advocate status to BLOCKED.
    - Verify BLOCKED advocate is excluded from team search results / request rejected (403 Forbidden).

13. Unauthorized User
    - Login as Normal User and attempt: GET /api/advocates/search?query=Rahul
    - Verify 403 Forbidden returned.

14. Unauthenticated Request
    - Call: GET /api/advocates/search?query=Rahul without token.
    - Verify 401 Unauthorized returned.
```

---

### 16.7 Permission Matrix

| Action | Unauthenticated | Normal User | Unapproved Advocate (Pending/Rejected) | Approved Advocate | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Search Advocate by Name/BAR ID | ❌ | ❌ | ✅ | ✅ | ❌ |
| View Advocate Profile | According to existing rules | According to existing rules | ✅ | ✅ | ✅ |
| Send Team Request | ❌ | ❌ | ❌ | ✅ | ❌ |
| Verify Team OTP | ❌ | ❌ | ❌ (for new requests) | ✅ | ❌ |
| View Own Team Mates | ❌ | ❌ | ✅ | ✅ | ❌ |
| Remove Team Mate | ❌ | ❌ | ✅ | ✅ | ❌ |

---

### 16.8 Advocate Team Request — Admin Approval Requirement

#### Team Request Approval Rule
An Advocate must have an **Admin-approved profile** (`approvalStatus = APPROVED`) before they can send a team request to another Advocate.

Registration alone does not grant permission to send team requests.

The following Advocates cannot send new team requests:
* **Pending Approval** (`approvalStatus = PENDING`)
* **Rejected** (`approvalStatus = REJECTED`)
* **Blocked/Inactive** (`status = BLOCKED` or `isActive = false`)

```text
REGISTERED ADVOCATE
        │
        ▼
COMPLETE PROFILE
        │
        ▼
ADMIN REVIEW
        │
   ┌────┴────┐
   │         │
REJECTED   APPROVED
   │         │
   ▼         ▼
Cannot     Can send
send       team request
team          │
request       ▼
           Existing
           OTP flow
```

#### Postman Testing — Approval Requirement

##### 1. Postman Test — Pending Advocate
* **Pre-condition:** Login as a registered Advocate whose profile status is `approvalStatus = PENDING`.
* **Call:** `POST /api/advocates/:advocateId/team-request`
* **Expected Response (HTTP 403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Your advocate profile must be approved by admin before you can send team requests."
  }
  ```
* **Verification:** OTP is **NOT** generated, SMS is **NOT** sent, and no pending team request record is created in the database.

##### 2. Postman Test — Approved Advocate
* **Pre-condition:** Login as an Advocate whose profile has been approved by Admin (`approvalStatus = APPROVED`).
* **Call:** `POST /api/advocates/:advocateId/team-request`
* **Expected Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Team request initiated successfully. OTP sent to Advocate's registered mobile number.",
    "data": {
      "requestId": "team-request-uuid",
      "targetAdvocateId": "advocate-b-uuid",
      "maskedPhone": "******2222",
      "expiresInMinutes": 5
    }
  }
  ```
* **Verification:** Existing OTP flow continues normally.

##### 3. Postman Test — Rejected Advocate
* **Pre-condition:** Login as an Advocate whose profile has been rejected (`approvalStatus = REJECTED`).
* **Call:** `POST /api/advocates/:advocateId/team-request`
* **Expected Response (HTTP 403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Your advocate profile has not been approved by admin. You cannot send team requests."
  }
  ```

##### 4. Postman Test — Unauthenticated Request
* **Call:** `POST /api/advocates/:advocateId/team-request` without auth header/cookie.
* **Expected Response (HTTP 401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Authentication required. Please login."
  }
  ```

##### 5. Postman Test — Direct API Bypass Attempt
* **Scenario:** An unapproved advocate uses Postman / cURL to directly call `POST /api/advocates/:advocateId/team-request`, bypassing any frontend button restriction.
* **Expected Result (HTTP 403 Forbidden):** Request is rejected server-side before any business logic executes.



---

## 17. Demo Advocate Credentials & Testing Guide

> [!WARNING]
> **DEVELOPMENT / DEMO ONLY**
> The following credentials and pre-seeded advocate accounts are intended strictly for local development and feature testing.

### Demo Advocate Credentials

| Advocate | Name | Email | Password | BAR ID | Phone | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Demo Advocate 1** | Arjun Sharma | `demoadvocate1@gmail.com` | `123456789` | `DEMO-BAR-1001` | `9999901001` | `ACTIVE` |
| **Demo Advocate 2** | Priya Verma | `demoadvocate2@gmail.com` | `123456789` | `DEMO-BAR-1002` | `9999901002` | `ACTIVE` |

---

### Seeding the Demo Data

To populate or reset these demo advocate accounts in your local database, run:

```bash
npm run seed
# or
npx prisma db seed
```

Seeding is **idempotent** and safe to run multiple times without creating duplicate records.

---

### Testing Workflows

#### 1. Advocate Login Testing

##### Login as Demo Advocate 1
```http
POST /api/auth/advocate/login
Content-Type: application/json

{
  "email": "demoadvocate1@gmail.com",
  "password": "123456789"
}
```

##### Login as Demo Advocate 2
```http
POST /api/auth/advocate/login
Content-Type: application/json

{
  "email": "demoadvocate2@gmail.com",
  "password": "123456789"
}
```

---

#### 2. Advocate Search Testing (Advocate-Only)

> **Note:** Requires an active `ADVOCATE` session token.

##### Search by Name (Arjun / Priya)
```http
GET /api/advocates/search?query=Arjun
Authorization: Bearer <advocate_jwt_token>
```
```http
GET /api/advocates/search?query=Priya
Authorization: Bearer <advocate_jwt_token>
```

##### Search by BAR ID
```http
GET /api/advocates/search?query=DEMO-BAR-1001
Authorization: Bearer <advocate_jwt_token>
```
```http
GET /api/advocates/search?query=DEMO-BAR-1002
Authorization: Bearer <advocate_jwt_token>
```

---

#### 3. Team Mate Feature Testing

##### Pre-Seeded Team Relationship
The seed script automatically establishes a confirmed team relationship (`Demo Advocate 1 ↔ Demo Advocate 2`). You can immediately test:
```http
GET /api/advocates/team-mates
Authorization: Bearer <advocate1_jwt_token>
```
*Returns Demo Advocate 2 in Demo Advocate 1's team list.*

##### Manual OTP Team Connection Flow
```text
Login as Demo Advocate 1
        ↓
Search for Demo Advocate 2 (by name or BAR ID)
        ↓
POST /api/advocates/:advocate2Id/team-request
        ↓
POST /api/advocates/team-request/:requestId/verify  (Body: { "otp": "<received_otp>" })
        ↓
GET /api/advocates/team-mates (Team relationship confirmed)
```

---

#### 4. Normal User Profile & Like Testing

##### Fetch Seeded Advocate Profile
```http
GET /api/advocates/:advocateId
```
*Returns full advocate profile details, `likeCount`, `isLiked` (user-specific), and confirmed `team` mates list.*

##### Like / Unlike Advocate
```http
POST /api/advocates/:advocateId/like
Authorization: Bearer <user_jwt_token>
```
```http
DELETE /api/advocates/:advocateId/like
Authorization: Bearer <user_jwt_token>
```

---

## IPC & BNS Legal Content APIs

The **Legal Content System** provides separate, dedicated database models and endpoints for **IPC** (Indian Penal Code) and **BNS** (Bharatiya Nyaya Sanhita). 

The underlying architecture uses completely separate Prisma database models (`IPCSection` and `BNSSection`), separate Content Creator endpoints, and separate public discovery/search endpoints. No `actType` field is used.

### Authorization Summary & Permission Matrix

| API | Public | Normal User | Advocate | Content Creator |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/ipc` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/ipc/:ipcId` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/ipc/search` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/content-creator/ipc` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/content-creator/ipc/:ipcId` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/bns` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/bns/:bnsId` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/bns/search` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/content-creator/bns` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/content-creator/bns/:bnsId` | ❌ | ❌ | ❌ | ✅ |

---

### 1. Content Creator — Create IPC Section

- **Endpoint:** `POST /api/content-creator/ipc`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <content_creator_jwt_token>` (or `auth_token` cookie)
- **Keywords Representation:** Array of strings (e.g. `["IPC Section 302", "murder", "Indian Penal Code"]`)

#### Postman Example Request
```http
POST /api/content-creator/ipc
Content-Type: application/json
Authorization: Bearer <content_creator_jwt_token>

{
  "sectionNo": "302",
  "heading": "Punishment for murder",
  "paragraph": "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
  "explanation": "This section explains the punishment applicable to a person who commits murder under IPC.",
  "content": "Additional detailed legal provisions and judicial precedents regarding murder.",
  "metaTitle": "IPC Section 302 - Punishment for Murder",
  "keywords": [
    "IPC Section 302",
    "murder",
    "Indian Penal Code"
  ],
  "metaDescription": "Information about IPC Section 302 and punishment for murder."
}
```

#### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "IPC section created successfully",
  "data": {
    "id": "c1f7a2d8-5b4e-4e6f-8d9e-1a2b3c4d5e6f",
    "sectionNo": "302",
    "heading": "Punishment for murder",
    "paragraph": "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
    "explanation": "This section explains the punishment applicable to a person who commits murder under IPC.",
    "content": "Additional detailed legal provisions and judicial precedents regarding murder.",
    "metaTitle": "IPC Section 302 - Punishment for Murder",
    "keywords": [
      "IPC Section 302",
      "murder",
      "Indian Penal Code"
    ],
    "metaDescription": "Information about IPC Section 302 and punishment for murder."
  }
}
```

---

### 2. Content Creator — Create BNS Section

- **Endpoint:** `POST /api/content-creator/bns`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <content_creator_jwt_token>` (or `auth_token` cookie)

#### Postman Example Request
```http
POST /api/content-creator/bns
Content-Type: application/json
Authorization: Bearer <content_creator_jwt_token>

{
  "sectionNo": "103",
  "heading": "Punishment for murder under BNS",
  "paragraph": "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
  "explanation": "Section 103 under Bharatiya Nyaya Sanhita corresponds to IPC Section 302.",
  "content": "Comparative legal analysis between BNS 103 and legacy IPC 302.",
  "metaTitle": "BNS Section 103 - Punishment for Murder",
  "keywords": [
    "BNS Section 103",
    "murder",
    "Bharatiya Nyaya Sanhita"
  ],
  "metaDescription": "Information about BNS Section 103."
}
```

---

### 3. Content Creator — Edit IPC / BNS Sections

#### Edit IPC Section
```http
PATCH /api/content-creator/ipc/c1f7a2d8-5b4e-4e6f-8d9e-1a2b3c4d5e6f
Content-Type: application/json
Authorization: Bearer <content_creator_jwt_token>

{
  "heading": "Punishment for murder (Updated Definition)",
  "metaTitle": "Updated IPC Section 302 SEO Title"
}
```

#### Edit BNS Section
```http
PATCH /api/content-creator/bns/e2a1f9d3-6c5b-4a3d-9e8f-7a6b5c4d3e2f
Content-Type: application/json
Authorization: Bearer <content_creator_jwt_token>

{
  "explanation": "Updated explanation of BNS Section 103 provisions."
}
```

---

### 4. Public IPC Endpoints (No Auth Required)

#### List IPC Sections
```http
GET /api/ipc?page=1&limit=15
```
*Note: IPC sections are always returned in ascending legal section order (1, 2, 3, ..., 9, 10, 11, 29, 29A, 30, ...).*

#### Single IPC Section View
```http
GET /api/ipc/c1f7a2d8-5b4e-4e6f-8d9e-1a2b3c4d5e6f
```

#### Search IPC Sections
```http
GET /api/ipc/search?q=murder&page=1&limit=15
```
```http
GET /api/ipc/search?q=302
```
*Note: Searches exclusively within the `IPCSection` database table and maintains legal section ascending order.*

---

### 5. Public BNS Endpoints (No Auth Required)

#### List BNS Sections
```http
GET /api/bns?page=1&limit=15
```
*Note: BNS sections are always returned in ascending legal section order (1, 2, 3, ..., 9, 10, 11, 20, 100, ...).*

#### Single BNS Section View
```http
GET /api/bns/e2a1f9d3-6c5b-4a3d-9e8f-7a6b5c4d3e2f
```

#### Search BNS Sections
```http
GET /api/bns/search?q=murder&page=1&limit=15
```
```http
GET /api/bns/search?q=103
```
*Note: Searches exclusively within the `BNSSection` database table and maintains legal section ascending order.*

---

### Validation & Error Responses

#### Missing Required Field
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "heading",
      "message": "Heading is required"
    }
  ]
}
```

#### Forbidden Client Field (`actType` or `createdBy`)
```json
{
  "success": false,
  "message": "Field 'actType' cannot be provided by the client"
}
```

#### Duplicate Section Number within Act
```json
{
  "success": false,
  "message": "This IPC section already exists"
}
```

#### Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

#### Forbidden Role (403 Forbidden)
```json
{
  "success": false,
  "message": "Access forbidden. Insufficient permissions."
}
```

---

## Advocate Forgot Password / Password Reset

The **Advocate Password Reset System** allows advocates to securely recover access to their account using their **registered email address** or **registered mobile number**. 

The process uses cryptographically secure 6-digit OTP verification followed by a single-use password reset token.

### Security Summary

- **OTP Expiration:** 10 minutes
- **Max OTP Attempts:** 5 attempts (after 5 failed tries, the OTP is invalidated)
- **Reset Token Expiration:** 15 minutes (single-use token)
- **Rate Limiting:** Maximum 3 password reset requests per 15 minutes per IP
- **Account Enumeration Protection:** Generic success response returned to prevent discovering registered advocate accounts

---

### Step-by-Step API Flow

```text
              ADVOCATE
                  │
                  ▼
          Forgot Password
                  │
          ┌───────┴────────┐
          ▼                ▼
       EMAIL             PHONE
          │                │
          └───────┬────────┘
                  ▼
   POST /api/advocate/forgot-password
                  │
                  ▼
             Send OTP (10 min expiry)
                  │
                  ▼
   POST /api/advocate/verify-reset-otp
                  │
                  ▼
    Returns Reset Token (15 min expiry)
                  │
                  ▼
   POST /api/advocate/reset-password
                  │
                  ▼
      Password Updated & Saved
                  │
                  ▼
   Existing Login: POST /api/auth/advocate/login
```

---

### 1. Request Password Reset OTP

- **Endpoint:** `POST /api/advocate/forgot-password`
- **Rate Limiter:** 3 requests / 15 mins

#### Postman Example Request — Email Flow
```http
POST /api/advocate/forgot-password
Content-Type: application/json

{
  "email": "advocate@example.com"
}
```

#### Postman Example Request — Phone Flow
```http
POST /api/advocate/forgot-password
Content-Type: application/json

{
  "phone": "9876543210"
}
```

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "If an advocate account exists with the provided details, an OTP has been sent."
}
```

---

### 2. Resend Password Reset OTP

- **Endpoint:** `POST /api/advocate/resend-reset-otp`
- **Behavior:** Invalidates previous active OTP and dispatches a fresh 6-digit OTP to the advocate's registered email or phone.

```http
POST /api/advocate/resend-reset-otp
Content-Type: application/json

{
  "email": "advocate@example.com"
}
```

---

### 3. Verify Reset OTP

- **Endpoint:** `POST /api/advocate/verify-reset-otp`
- **Behavior:** Verifies OTP code, enforces 5-attempt limit, and returns a single-use `resetToken`.

#### Postman Example Request — Email
```http
POST /api/advocate/verify-reset-otp
Content-Type: application/json

{
  "email": "advocate@example.com",
  "otp": "482913"
}
```

#### Postman Example Request — Phone
```http
POST /api/advocate/verify-reset-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "482913"
}
```

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "c7f91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f"
}
```

---

### 4. Reset Password

- **Endpoint:** `POST /api/advocate/reset-password`
- **Behavior:** Validates single-use `resetToken`, checks matching `newPassword` and `confirmPassword`, hashes new password with bcrypt, updates Advocate account, and invalidates reset tokens.

#### Postman Example Request
```http
POST /api/advocate/reset-password
Content-Type: application/json

{
  "resetToken": "c7f91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
  "newPassword": "NewStrongPassword123!",
  "confirmPassword": "NewStrongPassword123!"
}
```

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

### 5. Login with New Password

Use the existing Advocate login endpoint with your updated credentials:

```http
POST /api/auth/advocate/login
Content-Type: application/json

{
  "email": "advocate@example.com",
  "password": "NewStrongPassword123!"
}
```

---

### Error Responses

#### Mismatched Passwords (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "confirmPassword",
      "message": "New password and confirm password do not match"
    }
  ]
}
```

#### Exceeded Attempt Limit (400 Bad Request)
```json
{
  "success": false,
  "message": "Maximum OTP verification attempts exceeded. Please request a new OTP."
}
```

#### Invalid / Used Reset Token (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid or expired password reset token. Please restart the password reset process."
}
```

---

## Seed Advocate Team Members

### Purpose
The Advocate Team Member seeding feature generates demo teammate relationships for existing advocates in the database, allowing frontend and API demonstrations to display active Advocate Teams out of the box.

### Command
Execute the project's standard seed command:

```bash
npm run seed
```

### Seed Behavior & Rules
- **3 Unique Teammates**: Every advocate in the database receives at least 3 unique teammates.
- **Self-referential Prohibition**: An advocate is never added as their own teammate (`advocateId != teammateId`).
- **Idempotency & Duplicate Prevention**: Existing teammate relationships are checked prior to insertion; running the seed multiple times is safe and will not create duplicate records.
- **Minimum Advocate Requirement**: A minimum of **4 advocates** must exist in the database to seed 3 unique teammates per advocate.
- **Pre-verified State**: Seeded teammate relationships are stored directly in the `AdvocateTeamMate` model representing established/verified team members.
- **No Real OTP Sent**: Demonstrations bypass the production SMS OTP verification workflow during seeding.

---

## Advocate Profile Verification Status

### Overview
Authenticated Advocates can retrieve their current profile verification status from the backend at any point in their account lifecycle (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, or `REJECTED`).

### Endpoint
```http
GET /api/advocate/profile/verification-status
```

### Authentication
- **Required**: Advocate Authentication
- Identity is determined strictly from the authenticated JWT session / cookie (`req.user.id`).
- Accepts `Authorization: Bearer <advocateToken>` header or `auth_token` HTTP-only cookie.
- Does NOT accept `advocateId` query parameters or body attributes.

---

### Permission Matrix

| Action | Unauthenticated | Normal User | Advocate | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Check own verification status | ❌ | ❌ | ✅ | — |
| View approved own profile preview | ❌ | ❌ | ✅ | — |
| Approve Advocate | ❌ | ❌ | ❌ | ✅ |
| Reject Advocate | ❌ | ❌ | ❌ | ✅ |

---

### Response Specifications by Approval State

#### 1. Profile Not Submitted (`NOT_SUBMITTED`)
Returned when an Advocate has registered but has not yet submitted their completed profile for Admin verification (`submittedForApprovalAt` is null).

**Response (200 OK):**
```json
{
  "success": true,
  "status": "NOT_SUBMITTED",
  "message": "Your profile has not been submitted for admin approval."
}
```

#### 2. Pending Admin Review (`PENDING`)
Returned when an Advocate has submitted their profile and it is awaiting Admin verification.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "PENDING",
  "message": "Your profile is pending admin approval.",
  "submittedAt": "2026-09-12T10:30:00.000Z"
}
```
*Note: Full profile preview is NOT returned in this state.*

#### 3. Approved (`APPROVED`)
Returned when the Admin has verified and approved the Advocate profile. Returns the complete sanitized Advocate profile preview.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "APPROVED",
  "message": "Your profile has been approved.",
  "profile": {
    "id": "679ddd27-aa0f-49cc-9c9d-e73c4e03ee48",
    "fullName": "Demo Advocate",
    "name": "Demo Advocate",
    "email": "advocate@example.com",
    "phone": "9888812345",
    "gender": "Male",
    "barCouncilId": "BAR12345",
    "barId": "BAR12345",
    "profilePhotoUrl": "https://example.com/photo.jpg",
    "profileImage": "https://example.com/photo.jpg",
    "experienceYears": 8,
    "experience": 8,
    "casesHandled": 45,
    "practiceAreas": ["Criminal Law", "Civil Law"],
    "bestPracticeArea": "Criminal Law",
    "lawType": "Criminal Law",
    "topCourtPractised": "Delhi High Court",
    "courtPractice": ["Delhi High Court", "Supreme Court of India"],
    "languagesSpoken": ["English", "Hindi"],
    "state": "Delhi",
    "city": "New Delhi",
    "pincode": "110001",
    "completeAddress": "Office 101, Delhi High Court Chamber",
    "about": "Experienced criminal defense advocate with 8 years of practice.",
    "bio": "Experienced criminal defense advocate with 8 years of practice.",
    "videoCallChargePerMinute": 50,
    "voiceCallChargePerMinute": 30,
    "offlineVisitingFee": 1000,
    "averageRating": null,
    "totalReviews": 0,
    "status": "ACTIVE",
    "accountStatus": "ACTIVE",
    "approvalStatus": "APPROVED"
  }
}
```

#### 4. Rejected (`REJECTED`)
Returned when the Admin has rejected the Advocate profile. Includes the rejection reason when provided by the Admin.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "REJECTED",
  "message": "Your profile has been rejected.",
  "rejectionReason": "Please provide valid Bar Council information."
}
```

---

### Error Responses

#### Missing / Invalid Authentication (401 Unauthorized)
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

#### Forbidden Access — Non-Advocate Role (403 Forbidden)
```json
{
  "success": false,
  "message": "Access forbidden. Advocate role required."
}
```

---

## Centralized Error Logging

### Overview
The backend includes a centralized, fail-safe error-logging system that automatically captures API and server-side errors into the database without requiring custom `try/catch` or manual logging code inside every API controller or service.

### Database Model (`ErrorLog`)
Error logs are stored in the PostgreSQL database in the `ErrorLog` table via Prisma ORM.

#### Fields
| Field Name | Type | Description |
|---|---|---|
| `id` | String (UUID) | Unique record identifier |
| `ipAddress` | String? | Originating request IP address (supports `x-forwarded-for` reverse proxies) |
| `method` | String | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| `url` | String | Requested API URL (e.g. `/api/advocate/profile`) |
| `path` | String? | Request path without query parameters |
| `statusCode` | Int | HTTP status code (e.g. `400`, `401`, `403`, `404`, `500`, `502`) |
| `errorName` | String? | Error class/type name (e.g. `ZodError`, `DatabaseError`, `Error`) |
| `errorMessage` | String (Text) | Detailed error message |
| `errorStack` | String? (Text) | Complete server-side stack trace for debugging |
| `date` | String | Canonical date string (`YYYY-MM-DD`) |
| `time` | String | Canonical time string (`HH:mm:ss`) |
| `userId` | String? | Authenticated user ID (if request is authenticated) |
| `userType` | String? | Authenticated user type (`USER`, `ADVOCATE`, `ADMIN`, `CONTENT_CREATOR`) |
| `requestId` | String? | Correlation/Request ID (if present in headers) |
| `createdAt` | DateTime | Timestamp of record creation (`@default(now())`) |

### Error Flow
```text
               Incoming Request
                      │
                      ▼
               Express Router
                      │
                      ▼
            Controller / Service
                      │
                Error Occurs
                      │
                      ▼
            Global Error Handler
                      │
                      ▼
          Sanitize Sensitive Data
           (Aadhaar, JWT, Passwords)
                      │
                      ▼
         Save ErrorLog to Database
             (Fail-Safe Isolated)
                      │
                      ▼
        Return Original API Error Response
```

### Sensitive Data Protection Rules
- **Aadhaar Protection**: 12-digit Aadhaar numbers are automatically redacted before database insertion (e.g., `XXXX-XXXX-9012`).
- **Token & Credentials Protection**: Bearer tokens, raw JWTs, passwords, password hashes, and OTPs are redacted (`[REDACTED_TOKEN]`, `[REDACTED_JWT]`, `[REDACTED]`).
- **Fail-Safe Mechanism**: If saving the error log to the database fails, the error logger catches the exception gracefully without disrupting or altering the client API error response.

### Sample Database Record
```json
{
  "id": "ae15af46-3205-4156-9306-77ff8b2184b0",
  "ipAddress": "127.0.0.1",
  "method": "POST",
  "url": "/api/advocate/profile",
  "path": "/api/advocate/profile",
  "statusCode": 500,
  "errorName": "DatabaseError",
  "errorMessage": "Unable to update advocate profile",
  "errorStack": "Error: Unable to update advocate profile\n    at AdvocateService.updateProfile (...)\n    at AdvocateController.update (...)",
  "date": "2026-09-14",
  "time": "12:30:00",
  "userId": "316a5ead-ddfb-4384-b166-180463c8f32e",
  "userType": "ADVOCATE",
  "requestId": null,
  "createdAt": "2026-09-14T12:30:00.000Z"
}
```

### Postman & Manual Testing Guide
1. Start the backend server (`npm run dev` or `npm start`).
2. Send an API request in Postman that intentionally produces an error (e.g. `GET /api/nonexistent-route` for `404`, or `POST /api/auth/user/login/send-otp` with `{}` for `400`).
3. Observe the API response format (remains clean and unchanged).
4. Query the `ErrorLog` table in PostgreSQL or via Prisma:
   ```bash
   npx prisma studio
   ```
5. Verify the newly generated `ErrorLog` record contains all mandatory fields:
   - `ipAddress` → Present (e.g., `127.0.0.1` or client IP)
   - `date` → Present (`YYYY-MM-DD`)
   - `time` → Present (`HH:mm:ss`)
   - `url` → Correct API endpoint
   - `method` → Correct HTTP method (`GET`, `POST`, etc.)
   - `statusCode` → Correct HTTP status (`404`, `400`, `500`, etc.)
   - `errorMessage` → Detailed message (sanitized)
   - `errorStack` → Detailed stack trace (when available)

### Automated Test Suite
Run the automated e2e test suite covering 500 errors, 404 routes, 400 validation, authenticated user logs, unauthenticated logs, fail-safe isolation, and Aadhaar redaction:
```bash
node scratch/test-centralized-error-logging-e2e.js
```

---

## Normal User Account Deletion With OTP + 30-Day Grace Period

### Overview
Logged-in Normal Users can request account deletion. Upon OTP verification, the account enters a **30-day soft-delete grace period** (`status = DELETION_PENDING`). The account is **not permanently deleted immediately**.

### System Architecture & Workflow

```text
                    NORMAL USER
                         │
                         ▼
                 Request Deletion (`POST /api/user/delete-account/request-otp`)
                         │
                         ▼
                  OTP to Phone (Registered Phone)
                         │
                         ▼
                   Verify OTP (`POST /api/user/delete-account/verify-otp`)
                         │
                         ▼
                `DELETION_PENDING` (30-Day Grace Period)
                         │
             ┌───────────┴───────────┐
             │                       │
          Login                  No Login
       within 30 days          for 30 days
             │                       │
             ▼                       ▼
          `ACTIVE`               Move Data
   (Deletion Cancelled)              │
             │                       ▼
             │                  `DeletedUser`
             │                       │
             │                       ▼
             │               Delete Active Account
             │
             ▼
       Continue Normally
```

---

### Database Models

#### 1. `User` Schema Additions
```prisma
enum UserStatus {
  ACTIVE
  DELETION_PENDING
}

model User {
  // Existing User fields...
  status              UserStatus  @default(ACTIVE)
  deletionRequestedAt DateTime?
  scheduledDeletionAt DateTime?
}
```

#### 2. `DeletedUser` Schema
```prisma
model DeletedUser {
  id                  String   @id @default(uuid())
  originalUserId      String   @unique
  fullName            String
  email               String
  phone               String
  city                String?
  state               String?
  pincode             String?
  latitude            Float?
  longitude           Float?
  profileData         Json?
  reason              String?
  deletionRequestedAt DateTime
  deletedAt           DateTime @default(now())
  createdAt           DateTime @default(now())

  @@index([originalUserId])
  @@index([email])
  @@index([phone])
}
```

---

### API Endpoints

#### 1. Request Account Deletion OTP
* **Endpoint:** `POST /api/user/delete-account/request-otp`
* **Authentication:** `USER` required (`requireAuth`, `requireRole('USER')`)
* **Headers:** `Authorization: Bearer <user_jwt_token>` (or `auth_token` cookie)
* **Pre-conditions:**
  - User ID must come from the authenticated token session.
  - Returns `400 Bad Request` if user is already `DELETION_PENDING`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP has been sent to your registered phone number."
  }
  ```

#### 2. Verify Deletion OTP & Schedule Deletion
* **Endpoint:** `POST /api/user/delete-account/verify-otp`
* **Authentication:** `USER` required (`requireAuth`, `requireRole('USER')`)
* **Request Body:**
  ```json
  {
    "otp": "123456"
  }
  ```
* **Post-conditions:**
  - Sets `status = DELETION_PENDING`.
  - Sets `deletionRequestedAt = current timestamp`.
  - Sets `scheduledDeletionAt = current timestamp + 30 days`.
  - Clears `auth_token` cookie and invalidates current session access.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Your account is scheduled for deletion after 30 days.",
    "scheduledDeletionAt": "2026-10-14T10:30:00.000Z"
  }
  ```

---

### Grace Period & Login Cancellation Mechanics

1. **Login Within 30 Days (Cancellation)**:
   - If the user authenticates via login (`POST /api/auth/user/login/verify-otp` or `/verify-email-otp`) while `status = DELETION_PENDING` and `scheduledDeletionAt > now`:
   - Deletion request is automatically cancelled.
   - Status returns to `ACTIVE`, and timestamps are cleared (`deletionRequestedAt = null`, `scheduledDeletionAt = null`).
   - **Response (200 OK):**
     ```json
     {
       "success": true,
       "message": "Login successful. Your account deletion request has been cancelled.",
       "token": "eyJhbGci..."
     }
     ```

2. **Login After 30 Days (Finalized Deletion)**:
   - If 30 days have passed (`scheduledDeletionAt <= now`), login is rejected.
   - Account data is moved to `DeletedUser`, and original `User` record is removed.
   - **Response (400 Bad Request):**
     ```json
     {
       "success": false,
       "message": "This account has been deleted."
     }
     ```

3. **Automatic Scheduled Cleanup**:
   - An automated background worker runs periodically to process accounts where `scheduledDeletionAt <= now`.
   - Data transfer to `DeletedUser` and removal of original `User` row occur in an atomic database transaction (`$transaction`).

4. **Re-registration Policy**:
   - Once an account is permanently deleted, unique constraints on `User.email` and `User.phone` are freed up.
   - The user is allowed to register a new account in the future using the same email or phone number.

---

### Step-by-Step Postman Testing Guide

#### Step 1 — Login as Normal User
1. `POST /api/auth/user/login/send-otp` with `{ "phone": "9876543210" }`.
2. `POST /api/auth/user/login/verify-otp` with `{ "phone": "9876543210", "otp": "123456" }`.
3. Save returned `token`.

#### Step 2 — Request Account Deletion OTP
1. Send `POST /api/user/delete-account/request-otp` with header `Authorization: Bearer <user_token>`.
2. Expected response:
   ```json
   {
     "success": true,
     "message": "OTP has been sent to your registered phone number."
   }
   ```

#### Step 3 — Verify OTP & Enter Grace Period
1. Send `POST /api/user/delete-account/verify-otp` with body `{ "otp": "123456" }` and header `Authorization: Bearer <user_token>`.
2. Expected response:
   ```json
   {
     "success": true,
     "message": "Your account is scheduled for deletion after 30 days.",
     "scheduledDeletionAt": "2026-10-14T10:30:00.000Z"
   }
   ```
3. Check PostgreSQL database: `status = DELETION_PENDING`, `scheduledDeletionAt` is set 30 days in future.

#### Step 4 — Login During Grace Period (Cancel Deletion)
1. Send `POST /api/auth/user/login/send-otp` for the same phone number.
2. Send `POST /api/auth/user/login/verify-otp` with `{ "otp": "123456" }`.
3. Expected response:
   ```json
   {
     "success": true,
     "message": "Login successful. Your account deletion request has been cancelled.",
     "token": "..."
   }
   ```
4. Verify database: `status = ACTIVE`, `scheduledDeletionAt = null`.

#### Step 5 — Test Expired Deletion & Re-registration
1. Re-verify deletion OTP to enter `DELETION_PENDING`.
2. In PostgreSQL / Prisma, update `scheduledDeletionAt` to 31 days in past.
3. Attempt login or wait for background job process.
4. Verify original `User` row is removed, archive created in `DeletedUser`, and new registration with same phone/email succeeds.

---

### Automated E2E Test Suite
Run the 13-stage automated end-to-end test suite:
```bash
node scratch/test-user-account-deletion-e2e.js
```

---

## Advocate Account Deletion With OTP, Admin Review, and 30-Day Reactivation

### Overview
Logged-in Advocates can initiate an account deletion request. Upon 2-step OTP verification, the account enters a **30-day pending deletion period** (`deletionStatus = PENDING`). The account is **not permanently deleted immediately**.

During this 30-day grace period:
- The Advocate is **immediately hidden from all Normal User search, profile listing, discovery, and booking availability APIs**.
- The Advocate cannot send new team requests.
- The request appears in the Admin Panel for review (`GET /api/admin/advocates/deletion-requests`).
- **If the Advocate logs in within 30 days**, the deletion request is **automatically cancelled**, and the account is restored to normal active operation without resetting Admin approval or block status.
- **If Admin cancels the deletion**, the request is cancelled (`deletionStatus = NONE`) and account is restored.
- **If 30 days expire or Admin permanently deletes**, Advocate data is transactionally archived into `DeletedAdvocate`, foreign keys are cleaned up, and the original account is removed/disabled. Future logins are rejected.

---

### Business Flow Architecture

```text
                    ADVOCATE
                       │
                       ▼
               Request Deletion (`POST /api/advocate/delete-account/request-otp`)
                       │
                       ▼
                OTP → Registered Phone
                       │
                       ▼
                 Verify OTP (`POST /api/advocate/delete-account/verify-otp`)
                       │
                       ▼
              `PENDING_DELETION`
                       │
                       ▼
            Hidden From Normal Users & Bookings
                       │
                  30-Day Period
                       │
          ┌────────────┴────────────┐
          │                         │
   Advocate Login               No Login
   Within 30 Days              for 30 Days
          │                         │
          ▼                         ▼
 Cancel Deletion              Admin Review /
          │                   Automatic Expiry
          ▼                         │
       ACTIVE                 ┌─────┴─────┐
          │                   │           │
          ▼                CANCEL      PERMANENT
   Normal Operation       DELETION      DELETE
                              │           │
                              ▼           ▼
                           ACTIVE    DeletedAdvocate
                                          │
                                          ▼
                                  Original Account
                                  Removed/Disabled
```

---

### Database Schema Models

#### 1. `AdvocateDeletionStatus` Enum & `Advocate` Model Additions
```prisma
enum AdvocateDeletionStatus {
  NONE
  PENDING
}

model Advocate {
  // Existing fields...
  deletionStatus      AdvocateDeletionStatus @default(NONE)
  deletionRequestedAt DateTime?
  scheduledDeletionAt DateTime?
}
```

#### 2. `DeletedAdvocate` Archive Model
```prisma
model DeletedAdvocate {
  id                       String                 @id @default(uuid())
  originalAdvocateId       String                 @unique
  fullName                 String
  email                    String
  phone                    String
  barCouncilId             String
  gender                   String?
  aadhaarNumber            String?
  state                    String
  city                     String
  pincode                  String?
  experienceYears         Int?
  casesHandled             Int?
  bestPracticeArea         String?
  about                    String?
  courtPractice            String[]
  languagesSpoken          String[]
  completeAddress          String?
  videoCallChargePerMinute Decimal?
  voiceCallChargePerMinute Decimal?
  offlineVisitingFee       Decimal?
  averageRating            Decimal?
  totalReviews            Int                    @default(0)
  profileData             Json?
  approvalStatus           AdvocateApprovalStatus
  deletionRequestedAt      DateTime
  deletedAt                DateTime               @default(now())
  createdAt                DateTime               @default(now())

  @@index([originalAdvocateId])
  @@index([email])
  @@index([phone])
  @@index([barCouncilId])
}
```

---

### Advocate API Endpoints

#### 1. Request Deletion OTP
* **Endpoint:** `POST /api/advocate/delete-account/request-otp`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Headers:** `Authorization: Bearer <advocate_jwt_token>` (or `auth_token` cookie)
* **Pre-conditions:**
  - Advocate ID is obtained strictly from authenticated session token.
  - Returns `400 Bad Request` if deletion request is already `PENDING`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP has been sent to your registered phone number."
  }
  ```

#### 2. Verify Deletion OTP & Enter Pending Deletion
* **Endpoint:** `POST /api/advocate/delete-account/verify-otp`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Request Body:**
  ```json
  {
    "otp": "123456"
  }
  ```
* **Post-conditions:**
  - Sets `deletionStatus = PENDING`.
  - Sets `deletionRequestedAt = current timestamp`.
  - Sets `scheduledDeletionAt = current timestamp + 30 days`.
  - Clears `auth_token` cookie session.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Your account deletion request has been submitted for admin review.",
    "scheduledDeletionAt": "2026-10-16T14:00:00.000Z"
  }
  ```

---

### Admin API Endpoints

#### 1. Fetch Pending Advocate Deletion Requests
* **Endpoint:** `GET /api/admin/advocates/deletion-requests`
* **Authentication:** `ADMIN` required (`requireAuth`, `requireRole('ADMIN')`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "advocate-uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "9876543210",
        "barCouncilId": "BAR/123/2020",
        "approvalStatus": "APPROVED",
        "status": "ACTIVE",
        "deletionStatus": "PENDING",
        "deletionRequestedAt": "2026-09-16T14:00:00.000Z",
        "scheduledDeletionAt": "2026-10-16T14:00:00.000Z"
      }
    ]
  }
  ```

#### 2. Admin Cancel Deletion Request
* **Endpoint:** `PATCH /api/admin/advocates/:advocateId/cancel-deletion`
* **Authentication:** `ADMIN` required (`requireAuth`, `requireRole('ADMIN')`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate account deletion has been cancelled successfully."
  }
  ```

#### 3. Admin Permanent Delete Advocate Account
* **Endpoint:** `DELETE /api/admin/advocates/:advocateId/permanent`
* **Authentication:** `ADMIN` required (`requireAuth`, `requireRole('ADMIN')`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate account permanently deleted."
  }
  ```

---

### Postman Testing Guide (10 Test Cases)

#### Test 1 — Request Deletion OTP
1. Authenticate as Advocate using `POST /api/auth/advocate/login` or OTP login.
2. Send `POST /api/advocate/delete-account/request-otp` with `Authorization: Bearer <advocate_token>`.
3. Verify response:
   ```json
   {
     "success": true,
     "message": "OTP has been sent to your registered phone number."
   }
   ```

#### Test 2 — Verify OTP & Submit Request
1. Send `POST /api/advocate/delete-account/verify-otp` with body `{ "otp": "123456" }`.
2. Verify response:
   ```json
   {
     "success": true,
     "message": "Your account deletion request has been submitted for admin review."
   }
   ```
3. Check DB: `deletionStatus = PENDING`, `scheduledDeletionAt` set 30 days ahead.

#### Test 3 — Verify Hidden Profile & Availability
1. Call public Advocate APIs:
   - `GET /api/advocates` (Directory)
   - `GET /api/advocates/:id` (Public Profile)
   - `GET /api/advocates/search` (Team Search)
2. Verify pending Advocate is completely hidden (404 / excluded).

#### Test 4 — Admin View Deletion Requests
1. Authenticate as Admin (`POST /api/admin/login`).
2. Send `GET /api/admin/advocates/deletion-requests`.
3. Verify pending Advocate appears in list with deletion timestamps.

#### Test 5 — Advocate Login Within 30 Days (Auto-Reactivation)
1. Perform Advocate login (`POST /api/auth/advocate/login` or OTP login) before `scheduledDeletionAt`.
2. Verify response:
   ```json
   {
     "success": true,
     "message": "Login successful. Your account deletion request has been cancelled and your account is active again.",
     "token": "..."
   }
   ```
3. Check DB: `deletionStatus = NONE`, `deletionRequestedAt = null`, `scheduledDeletionAt = null`.
4. Verify Advocate is visible in public directory again.

#### Test 6 — Admin Cancel Deletion
1. Request deletion again for Advocate.
2. Send Admin request `PATCH /api/admin/advocates/:advocateId/cancel-deletion`.
3. Verify response:
   ```json
   {
     "success": true,
     "message": "Advocate account deletion has been cancelled successfully."
   }
   ```

#### Test 7 — Admin Permanent Delete
1. Request deletion for Advocate.
2. Send Admin request `DELETE /api/admin/advocates/:advocateId/permanent`.
3. Verify response:
   ```json
   {
     "success": true,
     "message": "Advocate account permanently deleted."
   }
   ```
4. Verify `DeletedAdvocate` record created and original `Advocate` row removed.

#### Test 8 — Login After 30 Days (Deletion Finalized & Rejected)
1. Set `scheduledDeletionAt` 31 days in past.
2. Attempt Advocate login (`POST /api/auth/advocate/login`).
3. Verify response:
   ```json
   {
     "success": false,
     "message": "This Advocate account has been deleted."
   }
   ```
4. Verify no token is issued and `DeletedAdvocate` archive exists.

#### Test 9 — Invalid OTP Handling
1. Send `POST /api/advocate/delete-account/verify-otp` with incorrect OTP (`000000`).
2. Verify deletion request is NOT created and Advocate status remains unchanged.

#### Test 10 — Unauthorized Access to Admin APIs
1. Call `GET /api/admin/advocates/deletion-requests` using a Normal User or Advocate token.
2. Verify response: `403 Forbidden` (`Access forbidden. Insufficient permissions.`).

---

## User Rights

The **User Rights** feature enables authenticated **Content Creators** to create, update, and manage legal rights information for citizens. Published User Rights are publicly visible and accessible without authentication to normal users and visitors.

This system is completely isolated from Blogs and IPC/BNS legal sections, backed by a dedicated `UserRight` database table.

---

### Initial Seed Data Categories

The database seed provides 6 initial legal rights categories:

1. **Children Rights** — Protection, education, healthcare, identity, dignity, and anti-exploitation protections.
2. **Consumer Rights** — Safety, information, choice, fair treatment, and remedies against unfair trade practices.
3. **Tenant Rights** — Legal occupation protections, notice, privacy, maintenance, and unlawful eviction safeguards.
4. **Employee Rights** — Fair employment conditions, wages, workplace safety, working hours, and anti-harassment laws.
5. **Women Rights** — Equality, dignity, safety, property inheritance, POSH protections, and anti-discrimination safeguards.
6. **Digital and Privacy Rights** — Personal data protection, communication privacy, and safeguards against unauthorized access.

#### Seeding Command
To seed or re-seed the initial categories idempotently:

```bash
npx prisma db seed
```

*Note: The seed is strictly idempotent. Running it multiple times does not create duplicate categories and never deletes custom user rights created by Content Creators.*

---

### Database Model (`UserRight`)

```prisma
model UserRight {
  id            String          @id @default(uuid())
  title         String
  description   String          @db.Text
  photo         String?
  photoPublicId String?
  createdBy     String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  creator       ContentCreator? @relation(fields: [createdBy], references: [id], onDelete: SetNull)

  @@index([createdBy])
  @@index([createdAt])
}
```

---

### Authorization & Permission Matrix

| Endpoint | Method | Public | Normal User | Advocate | Content Creator |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `/api/user-rights` | `GET` | ✅ | ✅ | ✅ | ✅ |
| `/api/user-rights/:id` | `GET` | ✅ | ✅ | ✅ | ✅ |
| `/api/content-creator/user-rights` | `POST` | ❌ | ❌ | ❌ | ✅ |
| `/api/content-creator/user-rights/:id` | `PATCH` | ❌ | ❌ | ❌ | ✅ |
| `/api/content-creator/user-rights/:id` | `DELETE` | ❌ | ❌ | ❌ | ✅ |

---

### Endpoints Reference

#### 1. Content Creator — Create User Right
- **Endpoint:** `POST /api/content-creator/user-rights`
- **Authentication:** `CONTENT_CREATOR` role required (`requireAuth`, `requireRole('CONTENT_CREATOR')`)
- **Content-Type:** `multipart/form-data` (or `application/json` if no photo is attached)
- **Request Fields:**
  - `title` *(string, required)*: Non-empty title (max 255 chars).
  - `description` *(string, required)*: Detailed explanation of the right.
  - `photo` *(file, optional)*: Image file (`JPEG`, `JPG`, `PNG`, `WEBP`, max 5MB).
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User Right created successfully",
    "data": {
      "id": "dcdd551f-2e37-408f-afb4-59d955030bff",
      "title": "Right to Equality",
      "description": "Every citizen has the right to equality before the law and equal protection of the laws.",
      "photo": "https://res.cloudinary.com/.../rights_sample.png",
      "createdAt": "2026-09-18T10:00:00.000Z",
      "updatedAt": "2026-09-18T10:00:00.000Z"
    }
  }
  ```

---

#### 2. Public — Get All User Rights
- **Endpoint:** `GET /api/user-rights`
- **Authentication:** None (Public)
- **Query Parameters:**
  - `page` *(optional, integer, default: 1)*
  - `limit` *(optional, integer, default: 10, max: 50)*
- **Ordering:** Deterministic database ordering by `createdAt DESC` (newest first).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "dcdd551f-2e37-408f-afb4-59d955030bff",
        "title": "Right to Equality",
        "description": "Every citizen has the right to equality before the law and equal protection of the laws.",
        "photo": "https://res.cloudinary.com/.../equality.png",
        "createdAt": "2026-09-18T10:00:00.000Z",
        "updatedAt": "2026-09-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalRights": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```

---

#### 3. Public — Get Single User Right
- **Endpoint:** `GET /api/user-rights/:id`
- **Authentication:** None (Public)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "dcdd551f-2e37-408f-afb4-59d955030bff",
      "title": "Right to Equality",
      "description": "Every citizen has the right to equality before the law and equal protection of the laws.",
      "photo": "https://res.cloudinary.com/.../equality.png",
      "createdAt": "2026-09-18T10:00:00.000Z",
      "updatedAt": "2026-09-18T10:00:00.000Z"
    }
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "User Right not found"
  }
  ```

---

#### 4. Content Creator — Update User Right
- **Endpoint:** `PATCH /api/content-creator/user-rights/:id`
- **Authentication:** `CONTENT_CREATOR` role required
- **Content-Type:** `multipart/form-data` or `application/json`
- **Request Fields (Optional):**
  - `title` *(string)*: Updated title.
  - `description` *(string)*: Updated description.
  - `photo` *(file)*: New image file to replace existing photo. Previous photo asset on Cloudinary is automatically deleted upon replacement.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User Right updated successfully",
    "data": {
      "id": "dcdd551f-2e37-408f-afb4-59d955030bff",
      "title": "Right to Equality & Non-Discrimination",
      "description": "Updated detailed text...",
      "photo": "https://res.cloudinary.com/.../new_photo.png",
      "createdAt": "2026-09-18T10:00:00.000Z",
      "updatedAt": "2026-09-18T10:05:00.000Z"
    }
  }
  ```

---

#### 5. Content Creator — Delete User Right
- **Endpoint:** `DELETE /api/content-creator/user-rights/:id`
- **Authentication:** `CONTENT_CREATOR` role required
- **Behavior:** Permanently removes database record and deletes associated image from Cloudinary storage if present.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User Right deleted successfully"
  }
  ```

---

### Postman Testing Guide

#### 1. Content Creator Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/content-creator/login`
- **Body (`raw JSON`):**
  ```json
  {
    "email": "creator@example.com",
    "password": "your_password"
  }
  ```
- **Save Token:** Copy `token` from response to use in `Authorization: Bearer <token>` for creator requests.

#### 2. Create User Right (with image)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/content-creator/user-rights`
- **Headers:** `Authorization: Bearer <creator_token>`
- **Body (`form-data`):**
  - `title` *(Text)*: `Right to Equality`
  - `description` *(Text)*: `Every citizen has the right to equality before the law.`
  - `photo` *(File)*: Select an image (`.png` / `.jpg` / `.webp`)

#### 3. Public List
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/user-rights?page=1&limit=10`
- **Headers:** *(None required)*

#### 4. Public Single Record
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/user-rights/<user_right_id>`
- **Headers:** *(None required)*

#### 5. Update User Right
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/content-creator/user-rights/<user_right_id>`
- **Headers:** `Authorization: Bearer <creator_token>`
- **Body (`form-data` or `raw JSON`):**
  ```json
  {
    "title": "Right to Equality (Amended)",
    "description": "Comprehensive explanation of Article 14 rights."
  }
  ```

#### 6. Delete User Right
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/content-creator/user-rights/<user_right_id>`
- **Headers:** `Authorization: Bearer <creator_token>`

---

## Guides

The **Guides** module enables authenticated **Content Creators** to create, edit, and delete comprehensive legal and procedural guides. Guides are **publicly accessible** to all visitors and normal users without requiring authentication.

---

### Database Model (`Guide`)

```prisma
model Guide {
  id          String          @id @default(uuid())
  title       String
  description String          @db.Text
  createdBy   String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  creator     ContentCreator? @relation(fields: [createdBy], references: [id], onDelete: SetNull)

  @@index([createdBy])
  @@index([createdAt])
}
```

---

### Seeded Demo Guides

The backend includes idempotent seed data for five comprehensive, production-grade legal awareness guides:

1. **How to File a Complaint:** Covers understanding grievance nature (criminal, consumer, civil, administrative), gathering evidence, identifying competent authorities, structured drafting, acknowledgement reference tracking, and legal counsel guidance.
2. **How to Send a Legal Notice:** Covers purpose, recovery/contract/tenancy/consumer notice scenarios, drafting essentials, RPAD/speed post delivery proof, recipient response possibilities, and pre-litigation significance.
3. **How to Find the Right Lawyer:** Covers practice-area specialization, Bar Council verification, court standing, transparent fee structures, consultation preparation, territorial jurisdiction, and VakeelSetu advocate discovery.
4. **How to File for Divorce:** Covers applicable personal laws (Hindu, Special Marriage, Indian Divorce, Muslim, Parsi), mutual-consent vs. contested divorce, child custody, alimony/maintenance, Stridhan protection, court jurisdiction, and counseling/mediation stages.
5. **How to Register Property:** Covers 30-year title searches, Mother Deed & Encumbrance Certificates, agreement to sell vs. sale deed, stamp duty/registration fee calculations, Sub-Registrar biometric verification, and post-registration municipal mutation.

To execute or re-run the seed idempotently:
```bash
npx prisma db seed
```
*(Running the seed multiple times safely updates the existing demo guides without wiping custom creator content or generating duplicate records).*

---

### Authorization & Permission Matrix

| Endpoint | Method | Public | Normal User | Advocate | Content Creator |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `/api/guides` | `GET` | ✅ | ✅ | ✅ | ✅ |
| `/api/guides/:id` | `GET` | ✅ | ✅ | ✅ | ✅ |
| `/api/content-creator/guides` | `POST` | ❌ | ❌ | ❌ | ✅ |
| `/api/content-creator/guides/:id` | `PATCH` | ❌ | ❌ | ❌ | ✅ |
| `/api/content-creator/guides/:id` | `DELETE` | ❌ | ❌ | ❌ | ✅ |

---

### Endpoints Reference

#### 1. Public — Get All Guides
- **Endpoint:** `GET /api/guides`
- **Authentication:** None (Public)
- **Query Parameters:**
  - `page` *(optional, integer, default: 1)*
  - `limit` *(optional, integer, default: 10, max: 50)*
- **Ordering:** Deterministic database ordering by `createdAt DESC` (newest first).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e305e94b-1422-45e5-be45-81ca04df45e9",
        "title": "How to Choose the Right Advocate in India",
        "description": "Choosing an advocate is a crucial decision that requires understanding jurisdiction, specializations, and fee agreements...",
        "createdAt": "2026-09-18T11:42:00.000Z",
        "updatedAt": "2026-09-18T11:42:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalGuides": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```

---

#### 2. Public — Get Single Guide
- **Endpoint:** `GET /api/guides/:id`
- **Authentication:** None (Public)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e305e94b-1422-45e5-be45-81ca04df45e9",
      "title": "How to Choose the Right Advocate in India",
      "description": "Detailed guide content...",
      "createdAt": "2026-09-18T11:42:00.000Z",
      "updatedAt": "2026-09-18T11:42:00.000Z"
    }
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Guide not found"
  }
  ```

---

#### 3. Content Creator — Create Guide
- **Endpoint:** `POST /api/content-creator/guides`
- **Authentication:** `CONTENT_CREATOR` role required (`requireAuth`, `requireRole('CONTENT_CREATOR')`)
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "title": "How to Find the Right Advocate",
    "description": "Detailed educational guide content explaining steps, consultation preparation, and engagement agreements."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Guide created successfully",
    "data": {
      "id": "e305e94b-1422-45e5-be45-81ca04df45e9",
      "title": "How to Find the Right Advocate",
      "description": "Detailed educational guide content...",
      "createdAt": "2026-09-18T11:42:00.000Z",
      "updatedAt": "2026-09-18T11:42:00.000Z"
    }
  }
  ```
- **Validation Errors (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Title is required and must not be empty"
  }
  ```

---

#### 4. Content Creator — Update Guide
- **Endpoint:** `PATCH /api/content-creator/guides/:id`
- **Authentication:** `CONTENT_CREATOR` role required
- **Content-Type:** `application/json`
- **Request Body (Partial updates allowed):**
  ```json
  {
    "title": "How to Find the Right Advocate (Updated)",
    "description": "Updated guide description..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Guide updated successfully",
    "data": {
      "id": "e305e94b-1422-45e5-be45-81ca04df45e9",
      "title": "How to Find the Right Advocate (Updated)",
      "description": "Updated guide description...",
      "createdAt": "2026-09-18T11:42:00.000Z",
      "updatedAt": "2026-09-18T11:45:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If guide ID does not exist.
  - `400 Bad Request`: If title or description is empty string/whitespace.

---

#### 5. Content Creator — Delete Guide
- **Endpoint:** `DELETE /api/content-creator/guides/:id`
- **Authentication:** `CONTENT_CREATOR` role required
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Guide deleted successfully"
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Guide not found"
  }
  ```

---

### Postman Testing Guide

#### 1. Content Creator Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/content-creator/login`
- **Body (`raw JSON`):**
  ```json
  {
    "email": "creator@example.com",
    "password": "your_password"
  }
  ```
- **Save Token:** Copy `token` from response to use in `Authorization: Bearer <creator_token>` header.

#### 2. Create Guide
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/content-creator/guides`
- **Headers:**
  - `Authorization: Bearer <creator_token>`
  - `Content-Type: application/json`
- **Body (`raw JSON`):**
  ```json
  {
    "title": "How to Find the Right Advocate",
    "description": "Detailed guide description..."
  }
  ```

#### 3. Public List All Guides
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/guides?page=1&limit=10`
- **Headers:** *(None required)*

#### 4. Public Get Single Guide
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/guides/<guide_id>`
- **Headers:** *(None required)*

#### 5. Update Guide
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/content-creator/guides/<guide_id>`
- **Headers:**
  - `Authorization: Bearer <creator_token>`
  - `Content-Type: application/json`
- **Body (`raw JSON`):**
  ```json
  {
    "title": "Updated Guide Title",
    "description": "Updated content..."
  }
  ```

#### 6. Delete Guide
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/content-creator/guides/<guide_id>`
- **Headers:** `Authorization: Bearer <creator_token>`

#### 7. Unauthorized / Forbidden Checks
- Attempt `POST /api/content-creator/guides` without `Authorization` header -> Verify `401 Unauthorized`.
- Attempt `POST /api/content-creator/guides` with a Normal User or Advocate token -> Verify `403 Forbidden`.
- Attempt `GET /api/guides/00000000-0000-0000-0000-000000000000` -> Verify `404 Not Found`.

---

## Updates

The **Updates** module enables authenticated **Content Creators** to post, edit, and delete platform and legal updates (showing what was previously in place with `oldDescription` and what is new with `newDescription`). Updates are **publicly accessible** to all visitors and normal users without requiring authentication.

---

### Database Model (`Update`)

```prisma
model Update {
  id             String          @id @default(uuid())
  title          String
  oldDescription String          @db.Text
  newDescription String          @db.Text
  createdBy      String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  creator        ContentCreator? @relation(fields: [createdBy], references: [id], onDelete: SetNull)

  @@index([createdBy])
  @@index([createdAt])
}
```

---

### Seeded Demo Updates

The backend includes idempotent seed data for three legally responsible, production-grade legal and regulatory updates:

1. **Important Changes in Consumer Law:**
   - **`oldDescription`:** Explains the existing Consumer Protection Act, 2019 framework, 3-tier Consumer Commissions (District, State, National), online filing mechanisms (e-Daakhil, NCH), and the baseline 2020 e-commerce rules.
   - **`newDescription`:** Explains the Consumer Protection (E-Commerce) (Amendment) Rules, 2026 (notified September 2026), focusing on transparent merchant disclosures, authentic listing descriptions, prompt grievance redressal, and practical tips on preserving transaction records for dispute resolution.

2. **New Digital Privacy Regulations:**
   - **`oldDescription`:** Details the previous statutory landscape under Section 43A of the IT Act, 2000, the 2011 SPDI rules, and the baseline principles established by the Digital Personal Data Protection Act, 2023.
   - **`newDescription`:** Details the Digital Personal Data Protection Rules, 2025 (notified November 2025), explaining operational rules for Data Fiduciaries, Data Principal rights (access, correction, erasure, nomination), the Data Protection Board of India, and phased enforcement timelines.

3. **Recent Developments in Property and Land-Record Rules:**
   - **`oldDescription`:** Explains the traditional state-level property registration framework under the Registration Act, 1908, local revenue systems (Khata/Patta mutation), Sub-Registrar offices, and the need for comprehensive title due diligence.
   - **`newDescription`:** Outlines the Digital India Land Records Modernization Programme (DILRMP) 3.0 (2026–2031) announced in September 2026, explaining GIS-enabled spatial mapping, standardisation of digital land records, and reiterating that digital records assist transparency but do not replace legal title searches under State/UT property laws.

To execute or re-run the seed idempotently:
```bash
npx prisma db seed
```
*(Running the seed multiple times safely updates the existing demo updates without wiping custom content or creating duplicates).*

---

### Authorization & Permission Matrix

| Endpoint | Method | Public | Normal User | Advocate | Content Creator |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `/api/updates` | `GET` | ✅ | ✅ | ✅ | ✅ |
| `/api/updates/:id` | `GET` | ✅ | ✅ | ✅ | ✅ |
| `/api/content-creator/updates` | `POST` | ❌ | ❌ | ❌ | ✅ |
| `/api/content-creator/updates/:id` | `PATCH` | ❌ | ❌ | ❌ | ✅ |
| `/api/content-creator/updates/:id` | `DELETE` | ❌ | ❌ | ❌ | ✅ |

Normal Users, Advocates, and unauthenticated visitors cannot create, update, or delete updates. All modification attempts without valid `CONTENT_CREATOR` role return standard `401 Unauthorized` or `403 Forbidden` responses.

---

### Endpoints Reference

#### 1. Public — Get All Updates
- **Endpoint:** `GET /api/updates`
- **Authentication:** None (Public)
- **Query Parameters:**
  - `page` *(optional, integer, default: 1)*
  - `limit` *(optional, integer, default: 10, max: 50)*
- **Ordering:** Deterministic database ordering by `createdAt DESC` (newest first).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "1cea7e26-893f-4157-a85b-8ed2a82c045f",
        "title": "Updated Legal Consultation Process",
        "oldDescription": "Previously, users had to contact advocates manually to arrange a consultation.",
        "newDescription": "Users can now view advocate profiles and book consultations directly through the platform.",
        "createdAt": "2026-09-21T05:50:00.000Z",
        "updatedAt": "2026-09-21T05:50:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalUpdates": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```

---

#### 2. Public — Get Single Update
- **Endpoint:** `GET /api/updates/:id`
- **Authentication:** None (Public)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "1cea7e26-893f-4157-a85b-8ed2a82c045f",
      "title": "Updated Legal Consultation Process",
      "oldDescription": "Previously, users had to contact advocates manually to arrange a consultation.",
      "newDescription": "Users can now view advocate profiles and book consultations directly through the platform.",
      "createdAt": "2026-09-21T05:50:00.000Z",
      "updatedAt": "2026-09-21T05:50:00.000Z"
    }
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Update not found"
  }
  ```

---

#### 3. Content Creator — Create Update
- **Endpoint:** `POST /api/content-creator/updates`
- **Authentication:** `CONTENT_CREATOR` role required (`requireAuth`, `requireRole('CONTENT_CREATOR')`)
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "title": "Updated Legal Consultation Process",
    "oldDescription": "Previously, users had to contact advocates manually to arrange a consultation.",
    "newDescription": "Users can now view advocate profiles and book consultations directly through the platform."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Update created successfully",
    "data": {
      "id": "1cea7e26-893f-4157-a85b-8ed2a82c045f",
      "title": "Updated Legal Consultation Process",
      "oldDescription": "Previously, users had to contact advocates manually to arrange a consultation.",
      "newDescription": "Users can now view advocate profiles and book consultations directly through the platform.",
      "createdAt": "2026-09-21T05:50:00.000Z",
      "updatedAt": "2026-09-21T05:50:00.000Z"
    }
  }
  ```
- **Validation Errors (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Title is required and must not be empty",
    "errors": [
      {
        "field": "title",
        "message": "Title is required and must not be empty"
      }
    ]
  }
  ```

---

#### 4. Content Creator — Update Update
- **Endpoint:** `PATCH /api/content-creator/updates/:id`
- **Authentication:** `CONTENT_CREATOR` role required
- **Content-Type:** `application/json`
- **Request Body (Partial updates supported):**
  ```json
  {
    "title": "Updated Legal Consultation Process (v2)",
    "oldDescription": "Previous manual process description",
    "newDescription": "New automated consultation and appointment booking flow"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Update updated successfully",
    "data": {
      "id": "1cea7e26-893f-4157-a85b-8ed2a82c045f",
      "title": "Updated Legal Consultation Process (v2)",
      "oldDescription": "Previous manual process description",
      "newDescription": "New automated consultation and appointment booking flow",
      "createdAt": "2026-09-21T05:50:00.000Z",
      "updatedAt": "2026-09-21T05:55:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If update ID does not exist.
  - `400 Bad Request`: If title, oldDescription, or newDescription contains only whitespace, or if empty body is supplied.

---

#### 5. Content Creator — Delete Update
- **Endpoint:** `DELETE /api/content-creator/updates/:id`
- **Authentication:** `CONTENT_CREATOR` role required
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Update deleted successfully"
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Update not found"
  }
  ```

---

### Postman Testing Guide

#### 1. Content Creator Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/content-creator/login`
- **Body (`raw JSON`):**
  ```json
  {
    "email": "creator@example.com",
    "password": "your_password"
  }
  ```
- **Save Token:** Copy `token` from response to use in `Authorization: Bearer <creator_token>` header.

#### 2. Create Update
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/content-creator/updates`
- **Headers:**
  - `Authorization: Bearer <creator_token>`
  - `Content-Type: application/json`
- **Body (`raw JSON`):**
  ```json
  {
    "title": "Updated Legal Consultation Process",
    "oldDescription": "Previously, users had to contact advocates manually to arrange a consultation.",
    "newDescription": "Users can now view advocate profiles and book consultations directly through the platform."
  }
  ```

#### 3. Public List All Updates
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/updates?page=1&limit=10`
- **Headers:** *(None required)*

#### 4. Public Get Single Update
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/updates/<update_id>`
- **Headers:** *(None required)*

#### 5. Update Update
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/content-creator/updates/<update_id>`
- **Headers:**
  - `Authorization: Bearer <creator_token>`
  - `Content-Type: application/json`
- **Body (`raw JSON`):**
  ```json
  {
    "title": "Updated Legal Consultation Process (v2)",
    "oldDescription": "Previous manual process description",
    "newDescription": "New automated consultation and appointment booking flow"
  }
  ```

#### 6. Delete Update
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/content-creator/updates/<update_id>`
- **Headers:** `Authorization: Bearer <creator_token>`

#### 7. Unauthorized / Forbidden Checks
- Attempt `POST /api/content-creator/updates` without `Authorization` header -> Verify `401 Unauthorized`.
- Attempt `POST /api/content-creator/updates` with a Normal User or Advocate token -> Verify `403 Forbidden`.
- Attempt `PATCH /api/content-creator/updates/<update_id>` as Normal User -> Verify `403 Forbidden`.
- Attempt `DELETE /api/content-creator/updates/<update_id>` as Advocate -> Verify `403 Forbidden`.
- Attempt `GET /api/updates/00000000-0000-0000-0000-000000000000` -> Verify `404 Not Found`.

---

## Advocate Online/Offline Status

The **Advocate Online/Offline Status** feature allows platform users to see in real-time whether an Advocate is actively online or offline. Rather than relying solely on explicit login and logout events (which fails if the app crashes, loses internet connectivity, or is force-closed), the backend implements a resilient **`isOnline` + `lastSeenAt` + Heartbeat Timeout** architecture.

---

### Architecture & Key Mechanisms

1. **Heartbeat & Activity Tracking:**
   - Every confirmed activity (successful login, heartbeat ping, or manual online toggle) updates:
     - `isOnline = true`
     - `lastSeenAt = current server time (UTC)`
2. **Configurable Timeout:**
   - Controlled via environment variable:
     ```env
     ADVOCATE_ONLINE_TIMEOUT_SECONDS=120
     ```
   - Defaults to **120 seconds** if not explicitly set.
3. **Dynamic Effective Online Status Calculation:**
   - When public users or clients query advocate profiles, directory lists, search results, saved lawyers, or liked lawyers, the backend computes:
     $$\text{Effective Online} = \text{isOnline} \land (\text{current time} - \text{lastSeenAt} \le \text{timeout})$$
   - If an advocate's heartbeat has lapsed beyond the configured timeout, the API dynamically returns `isOnline: false` without requiring continuous database background write jobs.
4. **Safety & Access Control:**
   - Blocked (`status: BLOCKED`), unapproved (`approvalStatus != APPROVED`), or pending-deletion (`deletionStatus: PENDING`) advocates remain excluded from user discovery regardless of their online status.

---

### Endpoints Overview

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/advocate/heartbeat` | Yes (JWT) | `ADVOCATE` | Updates advocate heartbeat (`isOnline = true`, `lastSeenAt = now`) |
| `PATCH` | `/api/advocate/online-status` | Yes (JWT) | `ADVOCATE` | Explicitly toggles online/offline status |
| `POST` | `/api/advocate/logout` | Yes (JWT) | `ADVOCATE` | Logs out advocate and sets `isOnline = false` |
| `GET` | `/api/advocates` | Optional | Any | Directory list returning effective `isOnline` & `lastSeenAt` |
| `GET` | `/api/advocates/:id` | Optional | Any | Public profile returning effective `isOnline` & `lastSeenAt` |
| `GET` | `/api/saved-lawyers` | Yes (JWT) | `USER` | User's saved lawyers with effective online status |
| `GET` | `/api/user/liked-advocates` | Yes (JWT) | `USER` | User's liked advocates with effective online status |

---

### API Details

#### 1. Advocate Heartbeat
- **URL:** `POST /api/advocate/heartbeat`
- **Authentication:** `ADVOCATE` only (`Authorization: Bearer <token>`)
- **Request Body:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate status updated",
    "data": {
      "isOnline": true,
      "lastSeenAt": "2026-09-21T10:30:00.000Z"
    }
  }
  ```

#### 2. Manual Change Online Status
- **URL:** `PATCH /api/advocate/online-status`
- **Authentication:** `ADVOCATE` only (`Authorization: Bearer <token>`)
- **Request Body (`raw JSON`):**
  ```json
  {
    "isOnline": true
  }
  ```
  *(or `"isOnline": false` to switch offline)*
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate online status updated successfully",
    "data": {
      "isOnline": true,
      "lastSeenAt": "2026-09-21T10:30:00.000Z"
    }
  }
  ```

---

### Frontend Integration & Heartbeat Strategy

1. **On Login:**
   - Advocate logs in -> backend marks `isOnline: true`, `lastSeenAt = now`.
   - Frontend starts a periodic timer (e.g., every **30–60 seconds**) to call:
     ```http
     POST /api/advocate/heartbeat
     ```
2. **On Manual Status Switch:**
   - Advocate toggles the Online/Offline UI switch:
     ```http
     PATCH /api/advocate/online-status
     { "isOnline": false }
     ```
3. **On Logout:**
   - Advocate clicks logout -> frontend calls `POST /api/advocate/logout` and stops the heartbeat timer.
4. **On Unexpected Disconnect / App Close:**
   - If the app terminates without explicit logout, after **120 seconds** (default), all public endpoints will automatically report the advocate as `isOnline: false`.

---

### Postman Testing Guide

#### Test 1 — Advocate Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/advocate/login`
- **Body (`raw JSON`):**
  ```json
  {
    "email": "advocate@example.com",
    "password": "your_password"
  }
  ```
- **Verify:** Response returns `token`, and database status is updated to `isOnline = true` and `lastSeenAt = current server time`.

#### Test 2 — Send Heartbeat
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/advocate/heartbeat`
- **Headers:** `Authorization: Bearer <advocate_token>`
- **Verify (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate status updated",
    "data": {
      "isOnline": true,
      "lastSeenAt": "..."
    }
  }
  ```

#### Test 3 — Explicit Switch Offline
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/advocate/online-status`
- **Headers:**
  - `Authorization: Bearer <advocate_token>`
  - `Content-Type: application/json`
- **Body (`raw JSON`):**
  ```json
  {
    "isOnline": false
  }
  ```
- **Verify (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate online status updated successfully",
    "data": {
      "isOnline": false,
      "lastSeenAt": "..."
    }
  }
  ```

#### Test 4 — Explicit Switch Online
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/advocate/online-status`
- **Headers:**
  - `Authorization: Bearer <advocate_token>`
  - `Content-Type: application/json`
- **Body (`raw JSON`):**
  ```json
  {
    "isOnline": true
  }
  ```
- **Verify (200 OK):** Returns `isOnline: true`.

#### Test 5 — Public Advocate Profile / Directory
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/advocates/<advocate_id>`
- **Verify:** Response contains `isOnline: true` and `lastSeenAt: "..."`.

#### Test 6 — Heartbeat Timeout (Automatic Offline Detection)
- Stop sending heartbeats for > 120 seconds.
- Call `GET /api/advocates/<advocate_id>` or `GET /api/advocates`.
- **Verify:** Response calculates and returns `"isOnline": false`.

#### Test 7 — Authorization Checks
- Attempt `POST /api/advocate/heartbeat` without a token -> Verify `401 Unauthorized`.
- Attempt `POST /api/advocate/heartbeat` with a Normal User token -> Verify `403 Forbidden`.
- Attempt `PATCH /api/advocate/online-status` with string `"true"` -> Verify `400 Bad Request` (Zod strict boolean validation).

---

## 45. Advocate Call Availability (Admin Approval Workflow)

The **Call Availability** feature allows Admins to control whether an Advocate is authorized and available to receive direct calls from users. 

### Key Principles & Business Logic
1. **Admin Controlled Only:** Advocates cannot decide or update their own `callAvailability` during registration, profile updates, or via any advocate-facing API.
2. **Default State:** When an Advocate registers and submits their profile for review, `callAvailability` defaults to `false`.
3. **Approval Flow:** During the approval process, the Admin explicitly determines whether call availability should be enabled (`true`) or disabled (`false`).
4. **Subsequent Modification:** The Admin can toggle `callAvailability` on/off at any time for an approved advocate without requiring the advocate to resubmit registration.
5. **Rejection Safety:** If an Advocate is rejected, `callAvailability` is automatically reset to `false`.
6. **Visibility vs. Call Availability:** `callAvailability` does **NOT** determine advocate directory visibility (visibility remains governed by `ACTIVE + APPROVED + not PENDING_DELETION`). An advocate with `callAvailability: false` is still discoverable if they satisfy normal visibility criteria.
7. **Independence from Online/Offline:** `callAvailability` and `isOnline` are completely independent concepts:
   - `isOnline`: Advocate is active in the application.
   - `callAvailability`: Admin has enabled this advocate to accept calls.

```text
Advocate Registration
        ↓
Profile Completed
        ↓
Profile Submitted (callAvailability = false)
        ↓
Admin Receives Profile
        ↓
Admin Reviews Profile
        ↓
Admin Approves / Rejects:
  - If Approved: Admin sets callAvailability = true OR false
  - If Rejected: callAvailability = false
        ↓
Admin Can Change Availability Later (callAvailability = true/false)
```

---

### Matrix of Online vs Call Availability

| isOnline | callAvailability | Meaning                                           |
| :--- | :--- | :--- |
| `true` | `true` | Online and available for calls |
| `true` | `false` | Online but not accepting calls |
| `false` | `true` | Configured to accept calls, but currently offline |
| `false` | `false` | Offline and not accepting calls |

---

### Admin Endpoints

#### 1. Admin Approves Advocate (With Call Availability)
- **Method:** `PATCH`
- **URL:** `/api/admin/advocates/:advocateId/approve`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "approvalStatus": "APPROVED",
    "callAvailability": true
  }
  ```
  *(or `"callAvailability": false`)*
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate approved successfully",
    "data": {
      "id": "cm1234...",
      "name": "Demo Advocate",
      "email": "advocate@example.com",
      "approvalStatus": "APPROVED",
      "callAvailability": true
    }
  }
  ```

#### 2. Admin Toggles Call Availability (Dedicated Endpoint)
- **Method:** `PATCH`
- **URL:** `/api/admin/advocates/:advocateId/call-availability`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "callAvailability": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Advocate call availability updated successfully",
    "data": {
      "id": "cm1234...",
      "name": "Demo Advocate",
      "callAvailability": true
    }
  }
  ```

#### 3. Admin Updates Advocate Status & Availability
- **Method:** `PATCH`
- **URL:** `/api/admin/advocates/:advocateId/status`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "callAvailability": false
  }
  ```

#### 4. Admin View Advocate / Pending List
- **Method:** `GET`
- **URL:** `/api/admin/advocates/pending` or `/api/admin/advocates` or `/api/admin/advocates/:advocateId`
- **Response includes `callAvailability`:**
  ```json
  {
    "id": "cm1234...",
    "name": "Demo Advocate",
    "email": "advocate@example.com",
    "barCouncilId": "BC/123/2020",
    "approvalStatus": "PENDING",
    "callAvailability": false
  }
  ```

---

### Public & Discovery APIs Exposing `callAvailability`

The `callAvailability` field is automatically included in all public advocate discovery and user-facing endpoints:
- `GET /api/advocates` (Advocate Listing & Search)
- `GET /api/advocates/:id` (Advocate Public Profile Details)
- `GET /api/saved-lawyers` (Saved Advocates)
- `GET /api/user/liked-advocates` (Liked Advocates)
- `GET /api/advocates/team-mates` (Team Mates Listing)
- `GET /api/advocate/profile` (Advocate Own Profile)
- `GET /api/auth/me` (Auth Profile Verification)

Example response snippet:
```json
{
  "id": "cm1234...",
  "name": "Advocate John Doe",
  "approvalStatus": "APPROVED",
  "isOnline": true,
  "callAvailability": true
}
```

---

### Postman Testing Guide

#### Test 1 — Advocate Registration
1. Register a new Advocate and complete profile submission.
2. Call `GET /api/admin/advocates/pending` with an Admin token.
3. **Verify:**
   - `"approvalStatus": "PENDING"`
   - `"callAvailability": false`

#### Test 2 — Admin Approves With Calls Enabled
1. Admin sends `PATCH /api/admin/advocates/<advocate_id>/approve` with:
   ```json
   {
     "approvalStatus": "APPROVED",
     "callAvailability": true
   }
   ```
2. **Verify (200 OK):**
   - Response returns `"approvalStatus": "APPROVED"` and `"callAvailability": true`.

#### Test 3 — Admin Approves With Calls Disabled
1. Admin approves another Advocate via `PATCH /api/admin/advocates/<advocate_id>/approve`:
   ```json
   {
     "approvalStatus": "APPROVED",
     "callAvailability": false
   }
   ```
2. **Verify (200 OK):**
   - Response returns `"approvalStatus": "APPROVED"` and `"callAvailability": false`.

#### Test 4 — Public Advocate API Verification
1. Call `GET /api/advocates/<advocate_id>` or `GET /api/advocates`.
2. **Verify:**
   - `callAvailability` is returned in the JSON payload alongside `isOnline`.
   - The advocate is visible regardless of whether `callAvailability` is `true` or `false` (as long as `approvalStatus: "APPROVED"`).

#### Test 5 — Admin Modifies Availability for Approved Advocate
1. Admin sends `PATCH /api/admin/advocates/<advocate_id>/call-availability`:
   ```json
   {
     "callAvailability": false
   }
   ```
2. Call public profile `GET /api/advocates/<advocate_id>` and verify `callAvailability: false`.
3. Admin sends `PATCH /api/admin/advocates/<advocate_id>/call-availability`:
   ```json
   {
     "callAvailability": true
   }
   ```
4. Call public profile `GET /api/advocates/<advocate_id>` and verify `callAvailability: true`.

#### Test 6 — Authorization & Security Checks
1. Attempt `PATCH /api/admin/advocates/<advocate_id>/call-availability` with a Normal User token -> **Verify `403 Forbidden`**.
2. Attempt `PATCH /api/admin/advocates/<advocate_id>/call-availability` with an Advocate token -> **Verify `403 Forbidden`**.
3. Attempt `PUT /api/advocate/profile` as an Advocate with body `{ "callAvailability": true }` -> **Verify `400 Bad Request`** (Advocate cannot alter this field).
4. Attempt `PATCH /api/admin/advocates/<advocate_id>/call-availability` with `"callAvailability": "true"` (string) -> **Verify `400 Bad Request`** (Zod strict boolean validation).

---

# Consultancy Request API

The **Consultancy Request** feature allows authenticated **Normal Users** to book a fixed-duration legal consultation call with Admin-managed support. The backend securely determines package pricing and manages requests in a FIFO (`createdAt ASC, id ASC`) queue for Administrators.

---

## 1. Consultancy Packages & Fixed Pricing

The platform supports four fixed consultation packages. The backend strictly determines the price based on `callType` + `duration`. Clients cannot specify or manipulate pricing.

| Call Type | Duration | Price (INR) | Description |
| :--- | :---: | :---: | :--- |
| `CALL` | 15 minutes | **₹199** | Standard voice consultation (15 mins) |
| `CALL` | 30 minutes | **₹499** | Standard voice consultation (30 mins) |
| `VIDEO_CALL` | 15 minutes | **₹499** | Video consultation call (15 mins) |
| `VIDEO_CALL` | 30 minutes | **₹899** | Comprehensive video consultation call (30 mins) |

> **Pricing Rule:**
> - `CALL` + `15` = ₹199
> - `CALL` + `30` = ₹499
> - `VIDEO_CALL` + `15` = ₹499
> - `VIDEO_CALL` + `30` = ₹899
> 
> Any client-supplied `price`, `userId`, or `status` in the request body is rejected with `400 Bad Request`.

---

## 2. Authentication & Authorization Matrix

| Endpoint | Method | Role Required | Description |
| :--- | :---: | :---: | :--- |
| `/api/user/consultancy` | `POST` | `USER` | Submit a new consultancy request |
| `/api/user/consultancy` | `GET` | `USER` | Get logged-in user's consultancy history |
| `/api/user/consultancy/:id` | `GET` | `USER` | Get single consultancy request details |
| `/api/admin/consultancy` | `GET` | `ADMIN` | List all consultancy requests with FIFO ordering |
| `/api/admin/consultancy/:id/status` | `PATCH` | `ADMIN` | Mark a consultancy request as `COMPLETED` |

- **Unauthenticated** users receive `401 Unauthorized`.
- **Advocates** and **Content Creators** attempting to access User/Admin consultancy endpoints receive `403 Forbidden`.
- **Normal Users** attempting to access Admin endpoints receive `403 Forbidden`.
- Users cannot access requests belonging to other users (`404 Not Found`).

---

## 3. Status Lifecycle

```text
       [ User Submits Request ]
                  │
                  ▼
              ┌─────────┐
              │ PENDING │ ◄── (completedAt: null)
              └────┬────┘
                   │
         [ Admin Marks Completed ]
                   │
                   ▼
             ┌───────────┐
             │ COMPLETED │ ◄── (completedAt: Current Server Timestamp)
             └───────────┘
```

- Requests start as `PENDING` with `completedAt: null`.
- Admins can transition requests from `PENDING` -> `COMPLETED`.
- `COMPLETED` requests cannot be reverted to `PENDING`.

---

## 4. User API Specifications

### 4.1. Submit Consultancy Request

Create a new consultation request.

- **Endpoint:** `POST /api/user/consultancy`
- **Authentication:** `USER` (Bearer Token or `auth_token` Cookie)
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "callType": "CALL",
  "duration": 15,
  "phoneNumber": "9876543210",
  "email": "user@example.com"
}
```

#### Fields
| Field | Type | Required | Allowed Values / Validation |
| :--- | :---: | :---: | :--- |
| `callType` | `String` | Yes | `"CALL"` or `"VIDEO_CALL"` |
| `duration` | `Number` | Yes | `15` or `30` |
| `phoneNumber` | `String` | Yes | Exactly 10 digits (`^\d{10}$`) |
| `email` | `String` | Yes | Valid email format |

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Consultancy request submitted successfully",
  "data": {
    "id": "76495d46-a496-4144-8844-4860d5b4e315",
    "userId": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
    "callType": "CALL",
    "duration": 15,
    "price": 199,
    "phoneNumber": "9876543210",
    "email": "user@example.com",
    "status": "PENDING",
    "completedAt": null,
    "createdAt": "2026-09-23T10:45:00.000Z",
    "updatedAt": "2026-09-23T10:45:00.000Z"
  }
}
```

---

### 4.2. Get User Consultancy History

Retrieve the authenticated user's own consultation requests.

- **Endpoint:** `GET /api/user/consultancy`
- **Authentication:** `USER`
- **Query Parameters:**
  - `page` (optional, default `1`): Page number.
  - `limit` (optional, default `10`): Items per page.

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "76495d46-a496-4144-8844-4860d5b4e315",
      "userId": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
      "callType": "CALL",
      "duration": 15,
      "price": 199,
      "phoneNumber": "9876543210",
      "email": "user@example.com",
      "status": "PENDING",
      "completedAt": null,
      "createdAt": "2026-09-23T10:45:00.000Z",
      "updatedAt": "2026-09-23T10:45:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 4.3. Get Single Consultancy Request

Fetch full details of a specific request owned by the authenticated user.

- **Endpoint:** `GET /api/user/consultancy/:id`
- **Authentication:** `USER`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "76495d46-a496-4144-8844-4860d5b4e315",
    "userId": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
    "callType": "CALL",
    "duration": 15,
    "price": 199,
    "phoneNumber": "9876543210",
    "email": "user@example.com",
    "status": "PENDING",
    "completedAt": null,
    "createdAt": "2026-09-23T10:45:00.000Z",
    "updatedAt": "2026-09-23T10:45:00.000Z"
  }
}
```

---

## 5. Admin API Specifications

### 5.1. List Consultancy Requests (FIFO Queue)

View all consultancy requests in the order received (**oldest first: `createdAt ASC, id ASC`**).

- **Endpoint:** `GET /api/admin/consultancy`
- **Authentication:** `ADMIN`
- **Query Parameters:**
  - `status` (optional): Filter by `"PENDING"` or `"COMPLETED"`.
  - `page` (optional, default `1`): Page number.
  - `limit` (optional, default `10`): Items per page.

#### Example Request
```http
GET /api/admin/consultancy?status=PENDING&page=1&limit=10
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "76495d46-a496-4144-8844-4860d5b4e315",
      "userId": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
      "callType": "CALL",
      "duration": 15,
      "price": 199,
      "phoneNumber": "9876543210",
      "email": "user@example.com",
      "status": "PENDING",
      "completedAt": null,
      "createdAt": "2026-09-23T10:45:00.000Z",
      "updatedAt": "2026-09-23T10:45:00.000Z",
      "user": {
        "id": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
        "fullName": "Shivam Singh",
        "email": "user@example.com",
        "phone": "9876543210"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 5.2. Mark Request as COMPLETED

Mark a pending consultation as completed once the call/consultation is finished.

- **Endpoint:** `PATCH /api/admin/consultancy/:id/status`
- **Authentication:** `ADMIN`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "status": "COMPLETED"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Consultancy request marked as COMPLETED successfully",
  "data": {
    "id": "76495d46-a496-4144-8844-4860d5b4e315",
    "userId": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
    "callType": "CALL",
    "duration": 15,
    "price": 199,
    "phoneNumber": "9876543210",
    "email": "user@example.com",
    "status": "COMPLETED",
    "completedAt": "2026-09-23T11:00:00.000Z",
    "createdAt": "2026-09-23T10:45:00.000Z",
    "updatedAt": "2026-09-23T11:00:00.000Z",
    "user": {
      "id": "3e9b11e2-b062-4318-97e3-36c538cb1b21",
      "fullName": "Shivam Singh",
      "email": "user@example.com",
      "phone": "9876543210"
    }
  }
}
```

---

## 6. Error Handling

| Scenario | HTTP Status | Response Example |
| :--- | :---: | :--- |
| **Invalid Call Type** | `400 Bad Request` | `{"success": false, "message": "Call type must be either 'CALL' or 'VIDEO_CALL'."}` |
| **Invalid Duration** | `400 Bad Request` | `{"success": false, "message": "Duration must be either 15 or 30 minutes."}` |
| **Client Injected Price / UserId** | `400 Bad Request` | `{"success": false, "message": "Unrecognized key(s) in object"}` |
| **Invalid Email** | `400 Bad Request` | `{"success": false, "message": "Please enter a valid email address."}` |
| **Invalid Phone Number** | `400 Bad Request` | `{"success": false, "message": "Phone number must be exactly 10 digits."}` |
| **Invalid Admin Status Filter** | `400 Bad Request` | `{"success": false, "message": "Status filter must be either 'PENDING' or 'COMPLETED'."}` |
| **Reverting Status to PENDING** | `400 Bad Request` | `{"success": false, "message": "Status must be 'COMPLETED'."}` |
| **Request Not Found** | `404 Not Found` | `{"success": false, "message": "Consultancy request not found."}` |
| **Cross-User Request Access** | `404 Not Found` | `{"success": false, "message": "Consultancy request not found."}` |
| **Missing Authentication** | `401 Unauthorized` | `{"success": false, "message": "Authentication required. Please login."}` |
| **Forbidden Role Access** | `403 Forbidden` | `{"success": false, "message": "Access forbidden. Insufficient permissions."}` |

---

## 7. Postman Testing Guide

### Flow 1: User Experience
1. **Login as Normal User:**
   - Authenticate via `POST /api/auth/user/login/verify-otp` or `POST /api/auth/user/login/verify-email-otp`.
   - Store the user `token`.
2. **Book 15-Minute Normal Call:**
   - `POST /api/user/consultancy` with `{"callType": "CALL", "duration": 15, "phoneNumber": "9876543210", "email": "user@example.com"}`.
   - Verify `201 Created` with `"price": 199` and `"status": "PENDING"`.
3. **Book 30-Minute Normal Call:**
   - `POST /api/user/consultancy` with `{"callType": "CALL", "duration": 30, ...}`.
   - Verify `201 Created` with `"price": 499"`.
4. **Book 15-Minute Video Call:**
   - `POST /api/user/consultancy` with `{"callType": "VIDEO_CALL", "duration": 15, ...}`.
   - Verify `201 Created` with `"price": 499"`.
5. **Book 30-Minute Video Call:**
   - `POST /api/user/consultancy` with `{"callType": "VIDEO_CALL", "duration": 30, ...}`.
   - Verify `201 Created` with `"price": 899"`.
6. **View Consultation History:**
   - `GET /api/user/consultancy?page=1&limit=10`.
   - Verify list of requests created for this user.
7. **View Single Request Details:**
   - `GET /api/user/consultancy/<id>`.
   - Verify matching request object.

### Flow 2: Admin Queue & Completion
8. **Login as Admin:**
   - Authenticate via `POST /api/admin/login` (`email: "it2@techvunex.in"`, `password: "123456"`).
   - Store the admin `token`.
9. **View Pending Queue (FIFO):**
   - `GET /api/admin/consultancy?status=PENDING`.
   - Verify oldest pending request appears first in the list.
10. **Mark Request as Completed:**
    - `PATCH /api/admin/consultancy/<id>/status` with `{"status": "COMPLETED"}`.
    - Verify `200 OK`, `"status": "COMPLETED"`, and `"completedAt"` is populated with an ISO timestamp.
11. **View Completed Requests:**
    - `GET /api/admin/consultancy?status=COMPLETED`.
    - Verify request now appears under completed filter.

### Flow 3: Security & Validation Tests
12. **Price Injection Attempt:**
    - `POST /api/user/consultancy` with `{"callType": "CALL", "duration": 15, "phoneNumber": "9876543210", "email": "user@example.com", "price": 50}`.
    - Verify `400 Bad Request`.
13. **Unauthenticated Access:**
    - Send `POST /api/user/consultancy` without auth header/cookie -> Verify `401 Unauthorized`.
14. **Cross-User Access:**
    - Attempt `GET /api/user/consultancy/<other-user-request-id>` -> Verify `404 Not Found`.
15. **User Access to Admin APIs:**
    - Attempt `GET /api/admin/consultancy` with User token -> Verify `403 Forbidden`.
16. **Advocate Access to User APIs:**
    - Attempt `POST /api/user/consultancy` with Advocate token -> Verify `403 Forbidden`.

---

# Bearer Acts Legal-Content API

## 1. Overview & Hierarchy Architecture
The Bearer Acts module provides a structured, three-level legal hierarchy specifically designed for the **Content Creator** role to manage, and for the general public to read:

```text
BearerAct (Top-level Legal Category)
        ↓ (1 to many)
Act (Individual Law / Act)
        ↓ (1 to many)
ActSection (Sections & Chapters)
```

- **Content Creator Write Operations**: Single unified endpoint (`POST /api/content-creator/bearer-acts`) to create and update all levels of the hierarchy.
- **Public Read Access**: Full public access to read categories, acts, and sections without authentication.

---

## 2. Predefined Legal Categories
The module comes pre-seeded with 13 official legal categories:
1. Constitutional and Political
2. Civil and Property
3. Criminal
4. Commercial and Business
5. Taxation, Labour & Consumer Protection
6. Personal
7. Environment and Land
8. Economic, Trade, & Market Regulatory
9. Arbitration & Alternative Dispute Resolution (ADR)
10. Insolvency, Banking, & Debt Recovery
11. Foreign Exchange, Trade & Economic
12. Intellectual Property Rights (IPR)
13. Tech, Data & Cyber Laws

Pre-seeded Acts under `Criminal`:
- **The Bharatiya Nyaya Sanhita, 2023 (BNS)**: Seeded under `Criminal → The Bharatiya Nyaya Sanhita, 2023` (Chapters I to XX, Sections 1 to 358).
- **The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**: Seeded under `Criminal → The Bharatiya Nagarik Suraksha Sanhita, 2023` (Chapters I to XXXIX, Sections 1 to 531).
- **The Bharatiya Sakshya Adhiniyam, 2023 (BSA)**: Seeded under `Criminal → The Bharatiya Sakshya Adhiniyam, 2023` (Chapters I to XII, Sections 1 to 170).
- **THE INDIAN PENAL CODE (IPC)**: Seeded under `Criminal → THE INDIAN PENAL CODE` (Chapters I to XXIII, Sections 1 to 511 + alphanumeric additions, total 576 sections).
- **THE INDIAN EVIDENCE ACT, 1872**: Seeded under `Criminal → THE INDIAN EVIDENCE ACT, 1872` (Chapters I to XI, Sections 1 to 167 + amendments, total 185 sections).
- **THE PREVENTION OF MONEY-LAUNDERING ACT, 2002**: Seeded under `Criminal → THE PREVENTION OF MONEY-LAUNDERING ACT, 2002` (Chapters I to X, Sections 1 to 75 + alphanumeric insertions 11A, 12A, 12AA, 58A, 58B, 72A and the complete Schedule, total 81 sections).
- **THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013**: Seeded under `Criminal → THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013` (Chapters I to VIII, Sections 1 to 30, total 30 sections).
- **THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985**: Seeded under `Criminal → THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985` (Chapters I to VI including IIA and VA, Sections 1 to 83 + alphanumeric insertions 7A, 7B, 8A, 9A, 25A, 27A, 27B, 31A, 32A, 32B, 36A-36D, 50A, 52A, 53A, 57A, 64A, 68A-68Z, 74A and THE SCHEDULE, total 129 sections).
- **THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967**: Seeded under `Criminal → THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967` (Chapters I to IV, Sections 1 to 21 + alphanumeric insertion 2A, total 22 sections).
- **THE DOWRY PROHIBITION ACT, 1961**: Seeded under `Criminal → THE DOWRY PROHIBITION ACT, 1961` (Sections 1 to 10 + alphanumeric insertions 4A, 8A, 8B, total 13 sections).
- **THE ARMS ACT, 1959**: Seeded under `Criminal → THE ARMS ACT, 1959` (Chapters I to VI, Sections 1 to 46 + alphanumeric insertions 24A, 24B, total 48 sections).
- **THE ARMS (AMENDMENT) ACT, 2019**: Seeded under `Criminal → THE ARMS (AMENDMENT) ACT, 2019` (Sections 1 to 11, total 11 sections).
- **THE PREVENTION OF CORRUPTION ACT, 1988**: Seeded under `Criminal → THE PREVENTION OF CORRUPTION ACT, 1988` (Chapters I to V including IVA, Sections 1 to 31 + alphanumeric insertions 7A, 17A, 18A, 29A, total 35 sections).
- **THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018**: Seeded under `Criminal → THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018` (Sections 1 to 19, total 19 sections).
- **THE CODE OF CRIMINAL PROCEDURE, 1973**: Seeded under `Criminal → THE CODE OF CRIMINAL PROCEDURE, 1973` (Chapters I to XXXVII including VIIA and XXIA, Sections 1 to 484 + alphanumeric insertions 25A, 41A-41D, 50A, 53A, 54A, 55A, 60A, 105A-105L, 164A, 166A-166B, 195A, 198A-198B, 265A-265L, 291A, 311A, 357A-357C, 433A, 436A, 437A, 441A, 446A, total 534 sections).
- **THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012**: Seeded under `Criminal → THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012` (Chapters I to IX, Sections 1 to 46 + alphanumeric insertion 42A and THE SCHEDULE, total 47 sections).
- **THE NEGOTIABLE INSTRUMENTS ACT, 1881**: Seeded under `Criminal → THE NEGOTIABLE INSTRUMENTS ACT, 1881` (Chapters I to XVII, Sections 1 to 148 + alphanumeric insertions 45A, 75A, 85A, 104A, 131A, 142A, 143A and THE SCHEDULE, total 155 sections).

Pre-seeded Acts under `Tech, Data & Cyber Laws`:
- **THE INFORMATION TECHNOLOGY ACT, 2000**: Seeded under `Tech, Data & Cyber Laws → THE INFORMATION TECHNOLOGY ACT, 2000` (Chapters I to XIII including XIIA, Sections 1 to 94 + alphanumeric insertions 3A, 6A, 7A, 10A, 40A, 43A, 52A, 52B, 52C, 52D, 66A, 66B, 66C, 66D, 66E, 66F, 67A, 67B, 67C, 69A, 69B, 70A, 70B, 72A, 77A, 77B, 79A, 81A, 84A, 84B, 84C and THE FIRST & SECOND SCHEDULES, total 125 sections).
- **THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023**: Seeded under `Tech, Data & Cyber Laws → THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023` (Chapters I to IX, Sections 1 to 44 and THE SCHEDULE, total 44 sections).

---

## 3. Content Creator Single Write API
### Endpoint
`POST /api/content-creator/bearer-acts`

### Headers
| Header | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <creator_token>` | JWT token from Content Creator login |
| `Content-Type` | `application/json` | JSON payload |

### Authorization
- **Allowed Role**: `CONTENT_CREATOR`
- **Rejected**: Unauthenticated (`401`), `USER` (`403`), `ADVOCATE` (`403`), `ADMIN` (`403`).

### Request Structure
```json
{
  "type": "BEARER_ACT" | "ACT" | "SECTION",
  "operation": "CREATE" | "UPDATE",
  "data": { ... }
}
```

### Operation Payloads & Examples

#### 1. Create Bearer Act Category
```json
{
  "type": "BEARER_ACT",
  "operation": "CREATE",
  "data": {
    "name": "Criminal"
  }
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Bearer Act category created successfully",
  "data": {
    "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "name": "Criminal",
    "createdAt": "2026-09-23T18:30:00.000Z",
    "updatedAt": "2026-09-23T18:30:00.000Z"
  }
}
```

#### 2. Update Bearer Act Category
```json
{
  "type": "BEARER_ACT",
  "operation": "UPDATE",
  "data": {
    "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "name": "Criminal Law & Procedure"
  }
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bearer Act category updated successfully",
  "data": {
    "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "name": "Criminal Law & Procedure",
    "createdAt": "2026-09-23T18:30:00.000Z",
    "updatedAt": "2026-09-23T18:35:00.000Z"
  }
}
```

#### 3. Create Act under Bearer Act Category
```json
{
  "type": "ACT",
  "operation": "CREATE",
  "data": {
    "bearerActId": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "heading": "Indian Penal Code",
    "act": "Indian Penal Code",
    "year": 1860
  }
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Act created successfully",
  "data": {
    "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
    "bearerActId": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "heading": "Indian Penal Code",
    "act": "Indian Penal Code",
    "year": 1860,
    "createdAt": "2026-09-23T18:32:00.000Z",
    "updatedAt": "2026-09-23T18:32:00.000Z"
  }
}
```

#### 4. Update Act
```json
{
  "type": "ACT",
  "operation": "UPDATE",
  "data": {
    "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
    "heading": "Indian Penal Code (IPC)",
    "year": 1860
  }
}
```

#### 5. Create Section / Chapter under Act
```json
{
  "type": "SECTION",
  "operation": "CREATE",
  "data": {
    "actId": "27b7de9c-d477-4b71-9257-2e1d71057c72",
    "section": "Section 1",
    "chapterNo": 1,
    "chapterName": "Introduction",
    "title": "Title and extent of operation of the Code",
    "description": "This Act shall be called the Indian Penal Code, and shall take effect throughout India.",
    "metaData": "Chapter I Preliminary",
    "metaDescription": "Indian Penal Code Section 1 title and jurisdiction details.",
    "metaTitle": "Section 1 - Indian Penal Code"
  }
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Act section created successfully",
  "data": {
    "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
    "actId": "27b7de9c-d477-4b71-9257-2e1d71057c72",
    "section": "Section 1",
    "chapterNo": 1,
    "chapterName": "Introduction",
    "title": "Title and extent of operation of the Code",
    "description": "This Act shall be called the Indian Penal Code, and shall take effect throughout India.",
    "metaData": "Chapter I Preliminary",
    "metaDescription": "Indian Penal Code Section 1 title and jurisdiction details.",
    "metaTitle": "Section 1 - Indian Penal Code",
    "createdAt": "2026-09-23T18:33:00.000Z",
    "updatedAt": "2026-09-23T18:33:00.000Z"
  }
}
```

#### 6. Update Section / Chapter
```json
{
  "type": "SECTION",
  "operation": "UPDATE",
  "data": {
    "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
    "title": "Updated Section Title",
    "description": "Updated legal description content"
  }
}
```

---

## 4. Public Read APIs
Public APIs require **no authentication token** and are accessible to anyone.

### 1. Get All Bearer Act Categories
```http
GET /api/bearer-acts?page=1&limit=20
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
      "name": "Criminal",
      "createdAt": "2026-09-23T18:30:00.000Z",
      "updatedAt": "2026-09-23T18:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 13,
    "totalPages": 1
  }
}
```

### 2. Get Single Bearer Act Category (with Related Acts)
```http
GET /api/bearer-acts/:id
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "name": "Criminal",
    "createdAt": "2026-09-23T18:30:00.000Z",
    "updatedAt": "2026-09-23T18:30:00.000Z",
    "acts": [
      {
        "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
        "heading": "Indian Penal Code",
        "act": "Indian Penal Code",
        "year": 1860
      }
    ]
  }
}
```

### 3. Get Acts Under a Bearer Act Category
```http
GET /api/bearer-acts/:id/acts?page=1&limit=20
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
      "bearerActId": "18f9d638-4f24-4ba2-985e-6351829e0da1",
      "heading": "Indian Penal Code",
      "act": "Indian Penal Code",
      "year": 1860,
      "createdAt": "2026-09-23T18:32:00.000Z",
      "updatedAt": "2026-09-23T18:32:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4. Get Single Act (with Sections)
```http
GET /api/acts/:id
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
    "bearerActId": "18f9d638-4f24-4ba2-985e-6351829e0da1",
    "heading": "Indian Penal Code",
    "act": "Indian Penal Code",
    "year": 1860,
    "sections": [
      {
        "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
        "section": "Section 1",
        "chapterNo": 1,
        "chapterName": "Introduction",
        "title": "Title and extent of operation of the Code",
        "description": "This Act shall be called the Indian Penal Code...",
        "metaData": "Chapter I Preliminary",
        "metaDescription": "Indian Penal Code Section 1 title and jurisdiction details.",
        "metaTitle": "Section 1 - Indian Penal Code"
      }
    ]
  }
}
```

### 5. Get Sections Under an Act
```http
GET /api/acts/:id/sections?page=1&limit=20
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
      "actId": "27b7de9c-d477-4b71-9257-2e1d71057c72",
      "section": "Section 1",
      "chapterNo": 1,
      "chapterName": "Introduction",
      "title": "Title and extent of operation of the Code",
      "description": "This Act shall be called the Indian Penal Code...",
      "metaData": "Chapter I Preliminary",
      "metaDescription": "Indian Penal Code Section 1 title and jurisdiction details.",
      "metaTitle": "Section 1 - Indian Penal Code",
      "createdAt": "2026-09-23T18:33:00.000Z",
      "updatedAt": "2026-09-23T18:33:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 6. Get Single Section
```http
GET /api/sections/:id
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
    "actId": "27b7de9c-d477-4b71-9257-2e1d71057c72",
    "section": "Section 1",
    "chapterNo": 1,
    "chapterName": "Introduction",
    "title": "Title and extent of operation of the Code",
    "description": "This Act shall be called the Indian Penal Code...",
    "metaData": "Chapter I Preliminary",
    "metaDescription": "Indian Penal Code Section 1 title and jurisdiction details.",
    "metaTitle": "Section 1 - Indian Penal Code",
    "createdAt": "2026-09-23T18:33:00.000Z",
    "updatedAt": "2026-09-23T18:33:00.000Z"
  }
}
```

---

## 5. Bearer Acts Search API

The Bearer Acts module provides **two public search modes** allowing citizens, advocates, and content creators to search legal content across the hierarchy without requiring authentication:

```text
1. Global Search      → Searches across all Bearer Acts, Acts, and Sections/Chapters
2. Act-Specific Search → Searches strictly inside the Sections/Chapters of one selected Act
```

### Key Search Capabilities
- **Public Access**: Completely open and read-only. No JWT token or login required.
- **Database-Level Execution**: Parameterized Prisma / PostgreSQL queries with zero in-memory dumping.
- **Case-Insensitive Matching**: Matches uppercase, lowercase, and mixed-case queries identically (`criminal` = `Criminal` = `CRIMINAL`).
- **Partial Term Search**: Substring matching (`crimin` matches `Criminal`, `proper` matches `property`).
- **Hierarchy Preservation**: Every search result returns its parent chain (`BearerAct` → `Act` → `Section`) so the client immediately knows where the result belongs.
- **Deterministic Result Prioritization**:
  1. `BEARER_ACT` matches (by `name`)
  2. `ACT` matches (by `heading`, `act`, `year`)
  3. `SECTION` matches (by `section`, `chapterName`, `title`, `description`, `metaData`, `metaDescription`, `metaTitle`)
- **Pagination**: Database-level `page` and `limit` support with complete pagination metadata (`page`, `limit`, `total`, `totalPages`).
- **Validation**: Minimum 2 characters required; empty and whitespace-only queries are rejected with HTTP 400.

---

### 1. Global Bearer Act Search
Searches across the entire Bearer Act legal database (Categories, Acts, and Sections).

```http
GET /api/bearer-acts/search?q=<query>&page=1&limit=20
```

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | **Yes** | — | Search term (min 2 non-whitespace characters) |
| `page` | `integer` | No | `1` | Page number (min 1) |
| `limit` | `integer` | No | `20` | Items per page (min 1, max 100) |

#### Search Scope & Fields
- **BearerAct**: `name`
- **Act**: `heading`, `act`, `year`
- **ActSection**: `section`, `chapterNo`, `chapterName`, `title`, `description`, `metaData`, `metaDescription`, `metaTitle`

#### Example Request
```http
GET /api/bearer-acts/search?q=criminal&page=1&limit=20
```

#### Example Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "type": "BEARER_ACT",
      "bearerAct": {
        "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
        "name": "Criminal",
        "createdAt": "2026-09-23T18:30:00.000Z",
        "updatedAt": "2026-09-23T18:30:00.000Z"
      }
    },
    {
      "type": "ACT",
      "bearerAct": {
        "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
        "name": "Criminal"
      },
      "act": {
        "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
        "bearerActId": "18f9d638-4f24-4ba2-985e-6351829e0da1",
        "heading": "Indian Penal Code",
        "act": "Indian Penal Code",
        "year": 1860,
        "createdAt": "2026-09-23T18:32:00.000Z",
        "updatedAt": "2026-09-23T18:32:00.000Z"
      }
    },
    {
      "type": "SECTION",
      "bearerAct": {
        "id": "18f9d638-4f24-4ba2-985e-6351829e0da1",
        "name": "Criminal"
      },
      "act": {
        "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
        "bearerActId": "18f9d638-4f24-4ba2-985e-6351829e0da1",
        "heading": "Indian Penal Code",
        "act": "Indian Penal Code",
        "year": 1860
      },
      "section": {
        "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
        "actId": "27b7de9c-d477-4b71-9257-2e1d71057c72",
        "section": "Section 1",
        "chapterNo": 1,
        "chapterName": "Introduction",
        "title": "Title and extent of operation of the Code",
        "description": "This Act shall be called the Indian Penal Code, and shall take effect throughout India.",
        "metaData": "Chapter I Preliminary",
        "metaDescription": "Indian Penal Code Section 1 title and jurisdiction details.",
        "metaTitle": "Section 1 - Indian Penal Code",
        "createdAt": "2026-09-23T18:33:00.000Z",
        "updatedAt": "2026-09-23T18:33:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 2. Act-Specific Search
Searches strictly within the Sections and Chapters belonging to one specified Act (`WHERE ActSection.actId = :actId`). It never leaks or returns sections from other Acts.

```http
GET /api/acts/:actId/search?q=<query>&page=1&limit=20
```

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `actId` | `string` (UUID) | **Yes** | ID of the target Act |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | **Yes** | — | Search term (min 2 non-whitespace characters) |
| `page` | `integer` | No | `1` | Page number (min 1) |
| `limit` | `integer` | No | `20` | Items per page (min 1, max 100) |

#### Search Scope & Fields
Searches ONLY within `ActSection` records where `actId = :actId`:
- `section`
- `chapterNo`
- `chapterName`
- `title`
- `description`
- `metaData`
- `metaDescription`
- `metaTitle`

#### Example Request
```http
GET /api/acts/27b7de9c-d477-4b71-9257-2e1d71057c72/search?q=property&page=1&limit=20
```

#### Example Response (200 OK)
```json
{
  "success": true,
  "data": {
    "act": {
      "id": "27b7de9c-d477-4b71-9257-2e1d71057c72",
      "heading": "Indian Penal Code",
      "act": "Indian Penal Code",
      "year": 1860
    },
    "results": [
      {
        "id": "94e82b71-79e5-4f40-a35f-3dcb295ad602",
        "actId": "27b7de9c-d477-4b71-9257-2e1d71057c72",
        "section": "Section 420",
        "chapterNo": 17,
        "chapterName": "Offences Against Property",
        "title": "Cheating and dishonestly inducing delivery of property",
        "description": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property...",
        "metaData": "property fraud cheating",
        "metaDescription": "Punishment for cheating under IPC",
        "metaTitle": "Section 420 IPC",
        "createdAt": "2026-09-23T18:33:00.000Z",
        "updatedAt": "2026-09-23T18:33:00.000Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3. Error Responses

#### Missing or Empty Query (`400 Bad Request`)
```http
GET /api/bearer-acts/search?q=
```
```json
{
  "success": false,
  "message": "Search query is required",
  "errors": [
    {
      "field": "q",
      "message": "Search query is required"
    }
  ]
}
```

#### Query Too Short (`400 Bad Request`)
```http
GET /api/bearer-acts/search?q=a
```
```json
{
  "success": false,
  "message": "Search query must be at least 2 characters",
  "errors": [
    {
      "field": "q",
      "message": "Search query must be at least 2 characters"
    }
  ]
}
```

#### Non-Existent Act ID on Act-Specific Search (`404 Not Found`)
```http
GET /api/acts/00000000-0000-0000-0000-000000000000/search?q=property
```
```json
{
  "success": false,
  "message": "Act not found"
}
```

---

## 6. Postman Testing Guide

### Content Creator Write Tests
1. **Login as Content Creator:**
   - `POST /api/content-creator/login` or `POST /api/auth/blog/login` with `{"email": "trainee6@techvunex.in", "password": "1234"}`.
   - Save the returned `token`.
2. **Create Bearer Act Category:**
   - `POST /api/content-creator/bearer-acts` with `type: "BEARER_ACT", operation: "CREATE", data: { "name": "Custom Law Category" }`.
   - Verify `201 Created`.
3. **Create Act under Bearer Act:**
   - `POST /api/content-creator/bearer-acts` with `type: "ACT", operation: "CREATE", data: { "bearerActId": "<id>", "heading": "Custom Act 2026", "act": "Custom Act", "year": 2026 }`.
   - Verify `201 Created`.
4. **Create Section under Act:**
   - `POST /api/content-creator/bearer-acts` with `type: "SECTION", operation: "CREATE", data: { "actId": "<actId>", "section": "Section 1", "chapterNo": 1, "chapterName": "Intro", "title": "Overview", "description": "Legal text" }`.
   - Verify `201 Created`.
5. **Update Bearer Act Category:**
   - `POST /api/content-creator/bearer-acts` with `type: "BEARER_ACT", operation: "UPDATE", data: { "id": "<id>", "name": "Updated Custom Law Category" }`.
   - Verify `200 OK`.
6. **Update Act:**
   - `POST /api/content-creator/bearer-acts` with `type: "ACT", operation: "UPDATE", data: { "id": "<actId>", "heading": "Updated Act Heading" }`.
   - Verify `200 OK`.
7. **Update Section:**
   - `POST /api/content-creator/bearer-acts` with `type: "SECTION", operation: "UPDATE", data: { "id": "<sectionId>", "title": "Updated Section Title" }`.
   - Verify `200 OK`.
8. **Try Invalid Parent IDs:**
   - Create Act with invalid `bearerActId` (`"00000000-0000-0000-0000-000000000000"`) -> Verify `404 Not Found`.
   - Create Section with invalid `actId` (`"00000000-0000-0000-0000-000000000000"`) -> Verify `404 Not Found`.
9. **Try Invalid Entity Types:**
   - `POST /api/content-creator/bearer-acts` with `type: "INVALID_TYPE"` -> Verify `400 Bad Request`.
10. **Try Invalid Operations:**
    - `POST /api/content-creator/bearer-acts` with `operation: "DELETE"` -> Verify `400 Bad Request`.
11. **Verify Validation Errors:**
    - Omit required `name`, negative `year`, missing required fields -> Verify `400 Bad Request`.

### Public Read Tests (Without Authentication)
12. **Get all Bearer Acts:**
    - `GET /api/bearer-acts` -> Verify `200 OK` without `Authorization` header.
13. **Get single Bearer Act:**
    - `GET /api/bearer-acts/:id` -> Verify `200 OK` and related `acts` array.
14. **Get Acts under Bearer Act:**
    - `GET /api/bearer-acts/:id/acts` -> Verify `200 OK` and paginated acts.
15. **Get single Act:**
    - `GET /api/acts/:id` -> Verify `200 OK` and related `sections` array.
16. **Get Sections under Act:**
    - `GET /api/acts/:id/sections` -> Verify `200 OK` and paginated sections.
17. **Get single Section:**
    - `GET /api/sections/:id` -> Verify `200 OK`.

### Global Search Tests
18. **Search by Bearer Act name:**
    - `GET /api/bearer-acts/search?q=Criminal` -> Returns matching Bearer Act entity with `type: "BEARER_ACT"`.
19. **Search by partial Bearer Act name:**
    - `GET /api/bearer-acts/search?q=crimin` -> Matches `Criminal` category.
20. **Search by Act heading / name / year:**
    - `GET /api/bearer-acts/search?q=Penal` -> Returns matching Act with `type: "ACT"` and parent `bearerAct`.
    - `GET /api/bearer-acts/search?q=1860` -> Returns matching Act by year.
21. **Search by Section number / chapter / title / description / metadata:**
    - `GET /api/bearer-acts/search?q=Section%201` -> Matches Section with `type: "SECTION"` and full parent chain.
    - `GET /api/bearer-acts/search?q=Introduction` -> Matches Chapter name.
    - `GET /api/bearer-acts/search?q=extent` -> Matches Section title.
    - `GET /api/bearer-acts/search?q=throughout` -> Matches Section description.
22. **Verify Case-Insensitivity & Pagination:**
    - `GET /api/bearer-acts/search?q=CRIMINAL` returns identical results to `q=criminal`.
    - `GET /api/bearer-acts/search?q=criminal&page=1&limit=2` returns paginated slice with `totalPages`.
23. **Verify Empty and Short Query Rejections:**
    - `GET /api/bearer-acts/search?q=` -> Returns `400 Bad Request` (`Search query is required`).
    - `GET /api/bearer-acts/search?q=a` -> Returns `400 Bad Request` (`Search query must be at least 2 characters`).

### Act-Specific Search Tests
24. **Search Sections inside specific Act & verify Act isolation:**
    - `GET /api/acts/:actId/search?q=property` -> Returns only sections belonging to `:actId`.
    - Confirm sections from other Acts are never returned.
    - `GET /api/acts/00000000-0000-0000-0000-000000000000/search?q=property` -> Returns `404 Not Found` (`Act not found`).

### Authorization Verification
25. **Public Access Verification:**
    - Perform both global search `GET /api/bearer-acts/search?q=...` and act-specific search `GET /api/acts/:actId/search?q=...` without any `Authorization` header.
    - Confirm both endpoints execute publicly and return HTTP 200 responses.

