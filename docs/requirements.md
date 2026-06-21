# Secure Anonymous Message Platform

Build a system consisting of two independent services.

## Service 1: Web Platform

A web application that supports multiple users.

### Authentication

Users can:

- Register
- Login using email/password or OTP
- Access their dashboard

---

### Link Creation

Authenticated users can create anonymous message links.

When creating a link:

- Link password (required)

Example:

https://domain.com/l/abc123xyz

---

### Visitor Flow

A visitor who receives the link:

1. Opens the link
2. Enters the link password
3. Enters a message
4. Submits

Requirements:

- Mobile-friendly page
- Maximum message length: 2000 characters

After a successful submission:

- The submission count is updated
- The link becomes permanently invalid (single-use)
- The owner can view the submission in their dashboard

---

### Dashboard

Users can view:

### Link Statistics

- Total links created
- Total link visits
- Total submissions

### Submissions

For each submission:

- Submission timestamp
- Submitted message

---

## Service 2: Telegram Bot

A completely separate application.

The bot communicates only with the Web Platform API.

The bot must never access the database directly.

---

### Link Creation

Users can create links using:

/link

The bot requests a link from the Web Platform API and returns the generated URL.

---

### Notifications

When a visitor opens the link:

Owner receives:

🔔 Someone opened your anonymous message link

---

When a visitor submits a message:

Owner receives:

📩 New anonymous message

With:

- Submitted message

---

### Service Communication

Architecture:

Telegram Bot

↓

API

↓

Web Platform

↓

Database

Service-to-service requests must implement basic authentication and authorization.

---

## Technical Requirements

- Separate services
- Security measures
- Docker support
- Database migrations
- REST API documentation
- Setup instructions
- Simple architecture diagram

---

## Evaluation Criteria

- Security
- Architecture
- API design
- Code quality
- Reliability
- Scalability
- Documentation

## Project Decisions

- OTP authentication is not implemented.
- Email/password authentication only.
- Three services in a monorepo:
  - api
  - web
  - telegram-bot
- Three database tables only:
  - users
  - links
  - submissions
- Web and Telegram users are treated as separate accounts.
- No account linking.
- No queues.
- No notification persistence.
- No extra analytics tables.
- Link passwords are hashed before storage.
- Anonymous links are single-use.
- Cloudflare Workers + D1 + Hono + Drizzle.
