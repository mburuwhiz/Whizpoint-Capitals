

---

## WHIZPOINT CAPITALS

### Project Overview

Build an ultra-modern, secure fintech web platform named **Whizpoint Capitals**, operating under **Whizpoint Solutions**.
The platform enables users to trade, deposit, withdraw, and transfer funds internally, with strict security, verification, and traffic monitoring.
Tech stack is **Node.js**, **Express**, **EJS**, **MongoDB or PostgreSQL**, REST APIs, and external payment integrations including **Daraja (M-Pesa)** via a dedicated server.

All branding, emails, company name, support contacts, fee values, API URLs, and keys must be injected via **environment variables**. No hard-coded secrets.

---

## Global Platform Rules

* Currency is user-selectable at signup. Examples: USD, KES, UGX.
* All balances are stored internally with clear currency mapping.
* Admin can manually correct balances after user dispute and evidence review.
* Platform must log all admin balance changes.
* Platform must strictly prevent unusual or abusive traffic.
* All sensitive actions are server-validated. No trust in client logic.

---

## Email Notification System

### User Control

* User can toggle **ANY email notification ON or OFF**, including:

  * Login alerts.
  * Withdrawal alerts.
  * Transfer alerts.
  * Verification emails.
  * Marketing emails.

### System Rule

* Emails respect user preferences.
* Backend must still enforce **security actions** even if emails are disabled.
* Password reset emails always allowed if user initiates the request.

Email preferences available at:
`/profile → notification settings`

---

## Verification & Anti-Fraud System

### Verification Fee

* A **USD 1 verification fee** is required for:

  * First withdrawal.
  * First internal transfer.
* Fee is payable to **Whizpoint Solutions**.
* Fee is **refunded immediately** after successful verification.
* Fee applies once per account.
* Fee transactions are logged permanently.

### Verification Flow

1. User initiates withdrawal or transfer.
2. System checks verification status.
3. If unverified:

   * Prompt verification.
   * Require USD 1 fee.
4. User completes KYC.
5. Fee is refunded to wallet.
6. User becomes verified.

Verification status values:

* Unverified
* Pending
* Verified
* Rejected

---

## Internal Transfers

### Transfer Rules

* User enters recipient account number or ID.
* Amount and currency required.
* Verification check enforced.
* Anti-abuse limits applied.
* Transfers logged for audit.

---

## Admin Capabilities

### Admin Panel `/admin`

Admin can:

* View all users.
* View balances per currency.
* Review disputes.
* Manually adjust balances after evidence submission.
* Convert balances correctly to user-selected currency.
* Approve or reject verification.
* Freeze or restrict accounts.
* View logs and risk scores.

### Admin Balance Adjustment

* Requires reason and evidence reference.
* Old balance, new balance, and currency logged.
* Visible in audit logs.

---

## Payment Integration – Daraja (M-Pesa)

### Architecture

* Daraja handled by a **dedicated external server**.
* Main platform communicates via secured REST API.
* Daraja credentials stored only on Daraja server.
* Callback validation required.
* IP whitelisting enforced.

### Supported Actions

* Deposits.
* Withdrawal confirmations.
* Status polling.

---

## Traffic & Security Controls

* Rate limiting.
* CAPTCHA on sensitive actions.
* Device fingerprinting.
* IP reputation checks.
* Geo-fencing.
* Velocity monitoring.
* Risk scoring per user.

Automated actions:

* Temporary lock.
* Forced re-verification.
* Manual admin review.

---

## Pages Structure

### Public Pages

* Home
* About Us
* Products
* How It Works
* Fees
* Security
* Compliance
* Testimonials
* Insights / Blog
* Contact Us
* Legal pages:

  * Terms
  * Privacy
  * Risk Disclosure
  * Refund Policy
  * Cookie Policy

### Authentication Pages

* Register
* Login
* Email Verification
* Forgot Password
* Reset Password

### User Dashboard Pages

* Dashboard Overview
* Wallets
* Deposit
* Withdraw
* Transfer
* Trade
* Transactions
* Verification
* Profile Settings
* Notification Settings
* Security Settings
* Support Center
* API Access
* Notifications

### Admin Pages

* Admin Dashboard
* Users
* Transactions
* Verification Review
* Balance Adjustments
* Risk Monitoring
* Content Management
* Email Templates
* System Logs

---

## Homepage Design Requirements

* Ultra-modern fintech UI.
* Dark and light mode.
* Clear value proposition.
* Strong trust indicators.
* Compliance badges.
* Testimonials with metrics.
* Clear CTA.
* Detailed footer with policies.

---

## Testimonials Section

* Multiple testimonials.
* Include:

  * Name.
  * Country.
  * User type.
  * Volume or usage metric.
* Mix retail and institutional users.

---

## Backend Requirements

* Token-based auth.
* Secure sessions.
* CSRF protection.
* Input validation.
* Centralized error handling.
* Full audit logging.

---

## Database Requirements

### User

* Email
* Password hash
* Preferred currency
* Verification status
* Email preferences
* Risk score

### Wallet

* User ID
* Currency
* Balance
* Locked balance

### Transaction

* Type
* Amount
* Currency
* Status
* Fee
* Reference IDs

### Admin Logs

* Admin ID
* Action
* Old value
* New value
* Timestamp

---

## Environment Variables

All configurable via ENV:

* Company name
* Business legal name
* Support email
* No-reply email
* Fee values
* Daraja API URL
* API keys
* JWT secrets
* Rate limits

---

## Final Output Expectation

The final system must feel:

* Regulated.
* Secure.
* Transparent.
* Scalable.
* Abuse-resistant.
* Fintech-grade.

No demo shortcuts. No placeholder logic.
The applicationmust be build using node js, create a folder with daraja detais and codes too

---

