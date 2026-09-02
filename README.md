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

## 5. Google OAuth Callback Integration

### Registration callbacks
Frontend redirects browser to:
- **User:** `http://localhost:5000/api/auth/user/google/register`
- **Advocate:** `http://localhost:5000/api/auth/advocate/google/register`

Upon successful authentication, Google returns session tokens back to the server, which redirects the client browser back to:
- **User callback:** `/register/user?step=4&registrationId=uuid-string`
- **Advocate callback:** `/register/advocate?step=1&registrationId=uuid-string` (email is verified; they fill photo and gender and resume).

### Login callbacks
Frontend redirects browser to:
- **User:** `http://localhost:5000/api/auth/user/google/login`
- **Advocate:** `http://localhost:5000/api/auth/advocate/google/login`

Callback will set the JWT cookie and automatically redirect back to `/dashboard`.

---

## 6. Login APIs

### User Phone OTP Login
- **Send OTP:** `POST /api/auth/user/login/send-otp` (Body: `{ "phone": "9876543210" }`)
- **Verify OTP:** `POST /api/auth/user/login/verify-otp` (Body: `{ "phone": "9876543210", "otp": "123456" }`)

### User Email OTP Login
- **Send OTP:** `POST /api/auth/user/login/send-email-otp` (Body: `{ "email": "user@gmail.com" }`)
- **Verify OTP:** `POST /api/auth/user/login/verify-email-otp` (Body: `{ "email": "user@gmail.com", "otp": "123456" }`)

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

### Advocate Google Registration Flow
To register using Google OAuth without losing existing registration wizard inputs (like Name, Gender, or Avatar):
1. **Pass Registration ID:** When redirecting to `GET /api/auth/advocate/google/register`, append the query parameter `?registrationId=ABC123`.
2. **Passport State Mapping:** The backend will map this ID into Passport's OAuth `state` parameter dynamically.
3. **Google Authentication & Callback:** After successful authentication, Google returns the state parameters as `req.query.state` in the callback URL.
4. **Session Retrieval & Email Verification:** The backend callback checks the session, marks the Google email as verified, updates `emailVerified = true`, and dynamically calculates the next incomplete wizard step.
5. **Wizard Step Routing:** It redirects back to the client: `/register/advocate?step=3&registrationId=ABC123` (routing the Advocate directly to Step 3 for phone verification, preserving the same `registrationId`).

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
      "casesWon": 120,
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
    "casesWon": 120,
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
    "casesWon": 120,
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
      "casesWon": 120,
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
2. **Cases Won (`casesWon`):** Integer >= 0 and <= 100,000.
3. **Practice Areas (`practiceAreas`):** Array of non-empty strings (maximum 20 areas).
4. **Best Practice Area & Top Court Practised:** Strings, max length 100 characters.
5. **Biography (`about`):** String, must not exceed 50 words (custom split-word refinement validation).
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
  - `sort`: `rating` (sort by rating descending), `experience` (sort by experience descending), `casesWon` (sort by cases won descending). Ignored for proximity sorting when `pincode` is supplied or when an authenticated user location is available and the default sort option is selected.
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
        "casesWon": 145,
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
      "casesWon": 145,
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
        "casesWon": 245,
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

### 13.5 Postman & Role Authorization Matrix

| Endpoint | Unauthenticated | Normal User | Advocate | Content Creator | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /api/admin/login` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| `POST /api/admin/content-creators` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 201 |
| `GET /api/admin/content-creators` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `GET /api/admin/advocates` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `PATCH /api/admin/advocates/:id/status` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |

---

## 14. USER-LAWYER CONNECTION REQUEST WORKFLOW

This section details the workflow where a Normal User submits a case connection request to a selected lawyer, routed through the **Admin as the intermediary gatekeeper**.

```text
NORMAL USER
     │
     │ Submit Request (Note + Case Description + Images)
     ▼
Connection Request (Status: PENDING)
     │
     ├── Selected Lawyer receives NO access while PENDING or REJECTED
     │
     ▼
   ADMIN
     │
     ├── Review Request
     │
     ├───────────────┐
     │               │
   Reject          Connect
     │               │
     ▼               ▼
  REJECTED        CONNECTED (Creates CaseConnection)
     │               │
  User sees       Lawyer + User
  Rejected        Connected
```

> [!IMPORTANT]
> **Core Gatekeeper Privacy Rule**:
> The selected Lawyer does NOT receive access to the User's case request, note, description, uploaded documents, or user contact information until the Admin explicitly approves and connects the request (`PATCH /api/admin/case-requests/:requestId/connect`).

---

### 14.1 User Create Connection Request
* **Endpoint:** `POST /api/lawyers/:advocateId/connect`
* **Authentication:** `USER` required (`requireAuth`, `requireRole('USER')`)
* **Content-Type:** `multipart/form-data`
* **Request Fields:**
  - `note` *(string, required, max 500 chars)*: Short note explaining the assistance needed.
  - `description` *(string, required, max 5000 chars)*: Detailed case background.
  - `images` / `images[]` *(files, optional, max 5 files, 5MB per file, formats: JPG, JPEG, PNG, WEBP, PDF)*: Supporting documents/images.
* **Pre-conditions & Validation**:
  - Advocate must exist and have `status = ACTIVE`. If `BLOCKED`, returns `400 Bad Request` (`"This lawyer is currently unavailable."`).
  - User cannot submit multiple active `PENDING` requests for the same lawyer (returns `409 Conflict`).
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Connection request submitted successfully",
    "data": {
      "id": "request-uuid",
      "status": "PENDING",
      "advocateId": "advocate-uuid",
      "advocateName": "Adv. Rajesh Sharma",
      "createdAt": "2026-09-01T11:11:37.909Z",
      "attachmentsCount": 2
    }
  }
  ```

---

### 14.2 User Track Requests
#### 1. List User Requests
* **Endpoint:** `GET /api/user/case-requests`
* **Authentication:** `USER` required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "requests": [
      {
        "id": "request-uuid",
        "advocate": {
          "id": "advocate-uuid",
          "name": "Adv. Rajesh Sharma",
          "profilePhotoUrl": "https://...",
          "bestPracticeArea": "Property Law"
        },
        "note": "Need assistance with property dispute.",
        "description": "My family has received a notice regarding property division...",
        "status": "PENDING",
        "attachments": [],
        "connectionId": null,
        "createdAt": "2026-09-01T11:11:37.909Z"
      }
    ]
  }
  ```

#### 2. Get User Request Detail
* **Endpoint:** `GET /api/user/case-requests/:requestId`
* **Authentication:** `USER` required (Owner only)

---

### 14.3 Admin Review & Connection APIs

#### 1. Admin List Case Requests
* **Endpoint:** `GET /api/admin/case-requests`
* **Authentication:** `ADMIN` required
* **Query Parameters:** `?status=PENDING` (or `CONNECTED` / `REJECTED`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "requests": [
      {
        "id": "request-uuid",
        "user": {
          "id": "user-uuid",
          "name": "Rahul Verma",
          "email": "user@example.com",
          "phone": "9876543210"
        },
        "advocate": {
          "id": "advocate-uuid",
          "name": "Adv. Rajesh Sharma",
          "email": "adv.rajesh@example.com",
          "phone": "9876543211",
          "status": "ACTIVE"
        },
        "note": "Need assistance with property dispute.",
        "description": "My family has received a notice...",
        "status": "PENDING",
        "attachments": [],
        "createdAt": "2026-09-01T11:11:37.909Z"
      }
    ]
  }
  ```

#### 2. Admin Get Request Detail
* **Endpoint:** `GET /api/admin/case-requests/:requestId`
* **Authentication:** `ADMIN` required

#### 3. Admin Connect Request
* **Endpoint:** `PATCH /api/admin/case-requests/:requestId/connect`
* **Authentication:** `ADMIN` required
* **Description:** Transition status from `PENDING` -> `CONNECTED` and create `CaseConnection` record.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Case connection request connected successfully",
    "data": {
      "id": "request-uuid",
      "status": "CONNECTED",
      "connectionId": "connection-uuid",
      "connectedAt": "2026-09-01T11:11:50.337Z"
    }
  }
  ```

#### 4. Admin Reject Request
* **Endpoint:** `PATCH /api/admin/case-requests/:requestId/reject`
* **Authentication:** `ADMIN` required
* **Description:** Transition status from `PENDING` -> `REJECTED`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Case connection request rejected successfully",
    "data": {
      "id": "request-uuid",
      "status": "REJECTED"
    }
  }
  ```

---

### 14.4 Advocate Case Connection APIs

#### 1. Advocate List Connected Cases
* **Endpoint:** `GET /api/advocate/case-connections`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Description:** Returns ONLY cases assigned to the authenticated advocate where `status = CONNECTED`. `PENDING` or `REJECTED` requests are never returned.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "connections": [
      {
        "connectionId": "connection-uuid",
        "requestId": "request-uuid",
        "user": {
          "id": "user-uuid",
          "name": "Rahul Verma",
          "email": "user@example.com",
          "phone": "9876543210",
          "city": "New Delhi",
          "state": "Delhi"
        },
        "note": "Need assistance with property dispute.",
        "description": "My family has received a notice...",
        "attachments": [],
        "connectedAt": "2026-09-01T11:11:50.337Z"
      }
    ]
  }
  ```

#### 2. Advocate Get Specific Connected Case Detail
* **Endpoint:** `GET /api/advocate/case-connections/:connectionId`
* **Authentication:** `ADVOCATE` required (Assigned advocate only)
* **Security:** If the connection belongs to another advocate, returns `403 Forbidden`.

---

### 14.5 Secure Attachment Viewing Endpoint
* **Endpoint:** `GET /api/case-requests/:requestId/attachments/:attachmentId`
* **Authentication:** Authenticated user required
* **Authorization:** Accessible ONLY to the submitting `USER`, `ADMIN`, or assigned `ADVOCATE` (after `CONNECTED`). Returns `403 Forbidden` for unauthorized requests.

---

### 14.6 Complete Permission Matrix

| Feature | User | Advocate | Content Creator | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Submit Connection Request | ✅ | ❌ | ❌ | ❌ |
| View Own Connection Requests | ✅ (Own) | ❌ | ❌ | ❌ |
| View All Connection Requests | ❌ | ❌ | ❌ | ✅ |
| View Pending Request Details | ✅ (Own) | ❌ | ❌ | ✅ |
| Connect Request (Approve) | ❌ | ❌ | ❌ | ✅ |
| Reject Request | ❌ | ❌ | ❌ | ✅ |
| View Connected Case | ✅ (Own) | ✅ (Assigned Only) | ❌ | ✅ |
| View Case Attachments | ✅ (Own) | ✅ (Assigned Only) | ❌ | ✅ |

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
        "casesWon": 150,
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
All Advocate listing and public profile endpoints (`GET /api/advocates`, `GET /api/advocates/:id`, `GET /api/lawyers`) return:
* `likeCount`: Total number of likes for the Advocate (computed via database relation count).
* `isLiked`: `true` if the requesting client is an authenticated `USER` who has liked the Advocate; `false` for unauthenticated requests or users who have not liked the Advocate.

---

### 15.5 Complete Postman Testing Flow

1. **Login as Normal User (User A)**
   - `POST /api/auth/user/login/verify-otp` (or login endpoint).
   - Save session cookie or JWT token.
2. **Find an ACTIVE Advocate**
   - `GET /api/advocates`
   - Select an Advocate ID with `status: ACTIVE`.
3. **Like Advocate**
   - `POST /api/advocates/:advocateId/like`
   - Verify `liked: true` and `likeCount` increases by 1.
4. **Attempt Duplicate Like**
   - `POST /api/advocates/:advocateId/like`
   - Verify `409 Conflict` (`You have already liked this advocate.`). No duplicate DB record created.
5. **Get Advocate Profile**
   - `GET /api/advocates/:advocateId` as User A $\rightarrow$ Verify `likeCount` and `isLiked: true`.
   - `GET /api/advocates/:advocateId` without token $\rightarrow$ Verify `likeCount` and `isLiked: false`.
6. **Get User's Liked Advocates**
   - `GET /api/user/liked-advocates` as User A
   - Verify array contains the liked Advocate with `isLiked: true`.
7. **Unlike Advocate**
   - `DELETE /api/advocates/:advocateId/like`
   - Verify `liked: false` and `likeCount` decreases by 1.
8. **Attempt Unlike Again**
   - `DELETE /api/advocates/:advocateId/like`
   - Verify `404 Not Found` (`You have not liked this advocate.`).
9. **Multiple Users Testing (User B)**
   - Login as User B.
   - `POST /api/advocates/:advocateId/like` $\rightarrow$ `likeCount: 1`.
   - Login as User A and like $\rightarrow$ `likeCount: 2`.
   - User A unlikes $\rightarrow$ User B still likes (`likeCount: 1`).
10. **Blocked Advocate Rule**
    - Admin changes Advocate status to `BLOCKED`.
    - User A attempts `POST /api/advocates/:advocateId/like` $\rightarrow$ Rejection (`400 Bad Request`: `This lawyer is currently unavailable.`).
11. **Permission Check**
    - Unauthenticated, Advocate, Content Creator, or Admin attempts `POST /api/advocates/:advocateId/like` $\rightarrow$ `401 Unauthorized` / `403 Forbidden`.

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

An authenticated **ADVOCATE** (Advocate A) can search for another advocate (Advocate B) using their **BAR ID**, send a team member request, and verify it via a 6-digit OTP sent to Advocate B's registered mobile number. Once verified, a mutual team mate relationship is established.

### Overview & Security Rules
* **Role Authorization:** `ADVOCATE` only (`requireAuth`, `requireRole('ADVOCATE')`). Normal Users, Content Creators, and Admins cannot initiate or verify team requests.
* **BAR ID Search:** Case-insensitive search on `barCouncilId`. Exposes only safe public profile data.
* **Self-Add Protection:** An advocate cannot add themselves as a team mate (`400 Bad Request`).
* **ACTIVE/BLOCKED Enforcement:** Target advocate must exist and be `ACTIVE`. Rejects requests to `BLOCKED` advocates (`403 Forbidden`).
* **OTP Delivery:** 6-digit cryptographically secure OTP is hashed with `bcrypt` and sent to **Advocate B's registered mobile number** via SMS. Valid for 5 minutes.
* **OTP Verification:** Only the requesting Advocate (Advocate A) can submit the OTP to complete the team connection. Limited to 5 attempts.
* **Mutual Team Relationship:** Once verified, a single canonical DB record `(min(A,B), max(A,B))` establishes a mutual relationship (`A ↔ B`) visible in both advocates' team lists.

---

### 16.1 Search Advocate by BAR ID
* **Method:** `GET`
* **Endpoint:** `/api/advocates/search?barId=<BAR_ID>`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Query Parameters:** `barId` (string, required)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "advocate": {
      "id": "advocate-b-uuid",
      "name": "Advocate Full Name",
      "fullName": "Advocate Full Name",
      "barId": "DL/10002/2026",
      "barCouncilId": "DL/10002/2026",
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
  }
  ```
* **Not Found Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Advocate not found with the provided BAR ID."
  }
  ```

---

### 16.2 Send Team Request / Initiate OTP
* **Method:** `POST`
* **Endpoint:** `/api/advocates/:advocateId/team-request`
* **Authentication:** `ADVOCATE` required (`requireAuth`, `requireRole('ADVOCATE')`)
* **Path Parameters:** `advocateId` (ID of Advocate B)
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
        "name": "Advocate Beta",
        "fullName": "Advocate Beta",
        "barId": "DL/10002/2026",
        "barCouncilId": "DL/10002/2026",
        "profileImage": "https://res.cloudinary.com/...",
        "profilePhotoUrl": "https://res.cloudinary.com/...",
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
1. Register/Login Advocate A  --> Obtain token A
        ↓
2. Register/Login Advocate B  --> Obtain token B
        ↓
3. Advocate A searches Advocate B by BAR ID:
   GET /api/advocates/search?barId=DL/10002/2026
        ↓
4. Advocate A sends Team Request to Advocate B:
   POST /api/advocates/:advocateBId/team-request
   --> Returns requestId & sends SMS OTP to Advocate B's phone
        ↓
5. Obtain 6-digit OTP from SMS (or server log in dev mode)
        ↓
6. Advocate A verifies OTP:
   POST /api/advocates/team-request/:requestId/verify
   Body: { "otp": "123456" }
        ↓
7. Both advocates view team mates:
   GET /api/advocates/team-mates  (as Advocate A) -> Advocate B appears
   GET /api/advocates/team-mates  (as Advocate B) -> Advocate A appears
        ↓
8. Advocate A removes Advocate B:
   DELETE /api/advocates/team-mates/:advocateBId
```

#### Negative Tests Checklist:
* **Test 1 — Self Add:** Advocate A calls `POST /api/advocates/:advocateAId/team-request` $\rightarrow$ `400 Bad Request`.
* **Test 2 — Non-existent BAR ID:** `GET /api/advocates/search?barId=INVALID` $\rightarrow$ `404 Not Found`.
* **Test 3 — Blocked Advocate:** Admin sets Advocate B status to `BLOCKED`. Advocate A sends request $\rightarrow$ `403 Forbidden`.
* **Test 4 — Duplicate Request:** Send team request while active pending request exists $\rightarrow$ `409 Conflict`.
* **Test 5 — Invalid OTP:** Submit `"000000"` to verify endpoint $\rightarrow$ `400 Bad Request`.
* **Test 6 — Role Authorization:** Normal `USER` or `CONTENT_CREATOR` calls `GET /api/advocates/search?barId=...` $\rightarrow$ `403 Forbidden`.

---

### 16.7 Complete Permission Matrix

| Feature | User | Advocate | Content Creator | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Search Advocate by BAR ID | ❌ | ✅ | ❌ | ❌ |
| Initiate Team Request (Send OTP) | ❌ | ✅ | ❌ | ❌ |
| Verify Team Request OTP | ❌ | ✅ (Requester Only) | ❌ | ❌ |
| View Own Team Mates | ❌ | ✅ | ❌ | ❌ |
| Remove Team Mate | ❌ | ✅ | ❌ | ❌ |
| Like Advocate | ✅ | ❌ | ❌ | ❌ |
| Submit Case Connection Request | ✅ | ❌ | ❌ | ❌ |
| Connect / Approve Case Request | ❌ | ❌ | ❌ | ✅ |
| Block / Activate Advocate | ❌ | ❌ | ❌ | ✅ |




