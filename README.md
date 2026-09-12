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
5. **Biography (`about`):** String, must not exceed 150 words and minimum of 50 words (custom split-word refinement validation).
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

#### Test 12 — Booking/Connection
1. As Normal User, call `POST /api/case-requests` for the approved Advocate.
2. Verify the booking/connection request succeeds.

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
*Note: Searches exclusively within the `IPCSection` database table.*

---

### 5. Public BNS Endpoints (No Auth Required)

#### List BNS Sections
```http
GET /api/bns?page=1&limit=15
```

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
*Note: Searches exclusively within the `BNSSection` database table.*

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
    "casesWon": 45,
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





