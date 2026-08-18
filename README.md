# Frontend Integration Guide & API Reference

This document serves as a complete integration guide for frontend developers to connect their React/Vite (or any frontend client) application to the backend authentication services. 

It covers both the **User** and the upgraded **Advocate** registration and login flows, including API specifications, validation requirements, and frontend integration code snippets.

---

## 1. Tech Stack & Connection Defaults
- **Backend Base URL:** `http://localhost:5000`
- **Prefix:** `/api` (All routes are prefixed, e.g. `http://localhost:5000/api/auth/me`)
- **Session Mechanism:** JSON Web Tokens (JWT) signed and set as an HTTP-only secure cookie named `auth_token`.
- **Axios Configuration requirement:** You **MUST** configure your Axios client or Fetch wrapper to send credentials. Otherwise, the session cookie will not be stored or sent back.

### Client Configuration Example
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // MANDATORY for HTTP-only cookie synchronization
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

## 3. User Registration Flow (Simplified)
The User registration is a 3-step wizard.

```text
Step 1: Name + Email Start ──> Email OTP / Google ──> Step 2: Profile Complete (Location, Phone) ──> Step 3: Verify Phone OTP (Auto-Creates Account)
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
      "phone": "",
      "phoneVerified": false,
      "accountType": "USER"
    }
  }
  ```

#### Step 2: Complete Profile Details
- **Endpoint:** `POST /api/auth/user/profile`
- **Request Body:**
  ```json
  {
    "registrationId": "uuid-string",
    "city": "Ghaziabad",
    "state": "Uttar Pradesh",
    "pincode": "201014",
    "phone": "9876543210"
  }
  ```
- **Response:**
  ```json
  { "success": true, "message": "Profile completed successfully." }
  ```

#### Step 3 (Part A): Send Phone OTP
- **Endpoint:** `POST /api/auth/user/send-phone-otp`
- **Request Body:**
  ```json
  { "registrationId": "uuid-string" }
  ```
- **Response:**
  ```json
  { "success": true, "message": "OTP sent successfully" }
  ```

#### Step 3 (Part B): Verify Phone OTP & Finalize
- **Endpoint:** `POST /api/auth/user/verify-phone`
- **Request Body:**
  ```json
  { "registrationId": "uuid-string", "otp": "123456" }
  ```
- **Response:**
  ```json
  { "success": true, "message": "Registration successful. Please login..." }
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
    "pincode": "201001"
  }
  ```

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
    "message": "Login successful"
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
- **Requires:** `auth_token` HTTP-only Cookie

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
     "response": "We have resolved the login issue. Please try now.",
     "status": "RESOLVED"
   }
   ```
4. Send and verify it successfully updates the database.
5. Re-run step 2 (Public Status Lookup) and verify `status` is now `RESOLVED` and `response` contains the admin reply text.## Lawyer Directory & Reviews API

All endpoints are prefixed with `{{BASE_URL}}/api`.

### 1. Get Lawyers Directory
- **Method:** `GET`
- **Endpoint:** `/api/advocates`
- **Authentication:** None (Public)
- **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `limit`: Number of advocates per page (default: `12`)
  - `search`: Case-insensitive search on Name, Top Court Practised, City, State, and exact match on Practice Areas.
  - `sort`: `rating` (sort by rating descending), `experience` (sort by experience descending), `casesWon` (sort by cases won descending).
  - `practiceArea`: Filter by practice area name string.
  - `topCourtPractised`: Filter by top court practised name string.
  - `state`: Filter by state.
  - `city`: Filter by city.
  - `rating`: Filter by minimum average rating (e.g. `4.5`).
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
        "rating": 4.5,
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
      "averageRating": 4.5,
      "totalReviews": 1,
      "distribution": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 1,
        "5": 0
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
    "rating": 4.5,
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
      "rating": 4.5,
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
