# User & Authentication API Documentation

**Base URL**: `/api/v1/user`

## Public Endpoints (Authentication Not Required)

### 1. User Signup
Registers a new user.
*   **URL**: `/signup`
*   **Method**: `POST`
*   **Body**: JSON object with user details (check `UserSignupZodSchema`).
*   **Response**: Success message and token? (TBC)

### 2. User Signin
Logs in an existing user.
*   **URL**: `/signin`
*   **Method**: `POST`
*   **Body**: JSON object with credentials (check `UserSigninZodSchema`).
*   **Response**: Success message and token? (TBC)

### 3. Email Validation
Generates an email validation token.
*   **URL**: `/validate/email`
*   **Method**: `POST`
*   **Body**: `{ "email": "user@example.com" }`
*   **Response**: Success message.

### 4. Email Verification
Verifies the email validation token.
*   **URL**: `/verify/email`
*   **Method**: `POST`
*   **Body**: `{ "email": "...", "otp": "..." }`
*   **Response**: Success message.

### 5. Forgot Password
Generates a password reset token.
*   **URL**: `/forgotpassword`
*   **Method**: `POST`
*   **Body**: `{ "email": "..." }`
*   **Response**: Success message.

### 6. Verify Forgot Password
Verifies the password reset token and resets password?
*   **URL**: `/forgotpassword/verify`
*   **Method**: `POST`
*   **Body**: `{ "email": "...", "otp": "...", "newPassword": "..." }` (TBC)
*   **Response**: Success message.

## Authenticated Endpoints (Requires Login)
**Middleware**: `userauthenticate` (for `userRouter`)

### 7. Auth Check
Checks if the user is authenticated and returns user details.
*   **URL**: `/auth`
*   **Method**: `GET`
*   **Response**: User object.

### 8. Get WebSocket Token
Generates a short-lived token for WebSocket connection.
*   **URL**: `/ws-token`
*   **Method**: `GET`
*   **Response**: `{ "wsToken": "...", "success": true }`

### 9. Logout
Logs out the user (clears cookies).
*   **URL**: `/logout`
*   **Method**: `GET`
*   **Response**: Success message.

### 10. Telegram Validation
Generates a Telegram validation token.
*   **URL**: `/validate/telegramid`
*   **Method**: `POST`
*   **Body**: `{ "telegramId": "..." }` (TBC)

### 11. Verify Telegram
Verifies the Telegram validation token.
*   **URL**: `/verify/telegramid`
*   **Method**: `POST`
*   **Body**: `{ "otp": "..." }` (TBC)

### 12. User Purchases
Gets user's purchase history.
*   **URL**: `/purchases`
*   **Method**: `GET`
*   **Response**: HTML invoice? or JSON data?

### 13. User Timeline
Gets user's timeline/activity.
*   **URL**: `/timeline`
*   **Method**: `GET`

### 14. Subscription Tiers
Gets available subscription tiers?
*   **URL**: `/subscription/tiers`
*   **Method**: `GET`

### 15. User Rewards
Gets user's rewards.
*   **URL**: `/rewards`
*   **Method**: `GET`

### 16. Get All Note Subjects
Gets all note subjects.
*   **URL**: `/notes/allsubject`
*   **Method**: `GET`

### 17. Get Exam Categories
Gets all exam categories.
*   **URL**: `/exam/categorys/get`
*   **Method**: `GET`

<!-- Note: Activity and Profile sub-routes are documented separately or inline if small -->
