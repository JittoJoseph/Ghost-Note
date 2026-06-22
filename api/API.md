# GhostNote REST API Documentation

This document outlines the REST endpoints exposed by the GhostNote `api` service.

## Authentication

The API uses two primary methods of authentication depending on the route:

- **JWT Session Cookies**: Used for dashboard and user endpoints (`/user`, `/links` (creation), `/dashboard`). Cookies must be passed securely.
- **Internal Service Secret**: Used for machine-to-machine endpoints (e.g., requests originating from the `telegram-bot` service). Passed via the `x-internal-service-secret` header.

---

## User Routes

### `GET /user/me`

Fetches the currently authenticated user's profile.

- **Auth Required**: Yes (JWT)
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "provider": "github",
      "createdAt": "timestamp"
    }
  }
  ```

---

## Link Routes

### `POST /links`

Generates a new anonymous, single-use link for the authenticated user.

- **Auth Required**: Yes (JWT)
- **Payload**:
  ```json
  {
    "password": "my-secret-password"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "uuid",
    "slug": "abcdef12",
    "url": "https://ghostnote.app/l/abcdef12",
    "createdAt": "timestamp"
  }
  ```

### `GET /links/:slug`

Validates if an anonymous link exists and is unused. Registers a visit count and triggers an owner notification (if applicable).

- **Auth Required**: No (Public)
- **Response (200 OK)**:
  ```json
  {
    "valid": true
  }
  ```
- **Error (404 Not Found)**:
  ```json
  {
    "error": "Link is invalid or has already been used"
  }
  ```

### `POST /links/:slug/submit`

Submits an anonymous message to a valid link. Validates the password, encrypts the message at rest, consumes the link (making it single-use), and triggers an owner notification.

- **Auth Required**: No (Public)
- **Payload**:
  ```json
  {
    "password": "my-secret-password",
    "message": "The contents of the anonymous message (max 2000 chars)."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Submission successful"
  }
  ```

---

## Dashboard Routes

### `GET /dashboard/stats`

Fetches high-level aggregate statistics for the user's dashboard.

- **Auth Required**: Yes (JWT)
- **Response (200 OK)**:
  ```json
  {
    "totalLinks": 15,
    "totalVisits": 42,
    "totalSubmissions": 10
  }
  ```

### `GET /dashboard/submissions`

Fetches all decrypted message submissions belonging to the user.

- **Auth Required**: Yes (JWT)
- **Response (200 OK)**:
  ```json
  {
    "submissions": [
      {
        "id": "uuid",
        "message": "Decrypted message text",
        "createdAt": "timestamp",
        "link": {
          "slug": "abcdef12"
        }
      }
    ]
  }
  ```

### `GET /dashboard/links`

Fetches a list of all links created by the user, including the decrypted payload if the link has been used.

- **Auth Required**: Yes (JWT)
- **Response (200 OK)**:
  ```json
  {
    "links": [
      {
        "id": "uuid",
        "slug": "abcdef12",
        "createdAt": "timestamp",
        "isUsed": true,
        "visitCount": 3,
        "submission": {
          "id": "uuid",
          "message": "Decrypted message text",
          "createdAt": "timestamp"
        }
      }
    ]
  }
  ```

---

## Internal Routes

### `POST /internal/telegram/link`

Registers a Telegram user (or fetches existing) and generates a new link on their behalf. Used exclusively by the `telegram-bot` service.

- **Auth Required**: Yes (Internal Header)
- **Headers**: `x-internal-service-secret: <SECRET>`
- **Payload**:
  ```json
  {
    "telegramChatId": "123456789",
    "password": "my-secret-password"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "uuid",
    "slug": "abcdef12",
    "url": "https://ghostnote.app/l/abcdef12",
    "createdAt": "timestamp"
  }
  ```
