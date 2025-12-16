# Offer and Subscription UI Context

This document provides context for the UI implementation of "Offers" and "Subscriptions" management (Admin Side).

## Overview

The backend separates "Offers" and "Subscriptions" logic, although they share the same database table `subcriptionOffers`.

- **Offers**: One-time purchase of Tokens.
- **Subscriptions**: Recurring or time-based access to Prime features (tiers).

## Data Models

### Common Fields
- `id`: string (CUID)
- `title`: string
- `price`: number (Selling Price)
- `markedPrice`: number (Original Price - for showing discount)
- `discount`: number (Percentage)
- `offerActive`: string[] (List of included features)
- `offerInActive`: string[] (List of excluded features)
- `btncolor`: string (Optional hex code for UI button)
- `created_at`: DateTime

### 1. Offer (Token Pack)
Represents a bundle of tokens users can buy.

- **Type**: `TOKEN`
- **Specific Fields**:
  - `token`: number (Amount of tokens given)

**TypeScript Interface**:
```typescript
interface Offer {
  id: string;
  title: string;
  price: number;
  markedPrice: number;
  discount: number;
  token: number; // Required
  offerActive: string[];
  offerInActive: string[];
  btncolor?: string;
  type: "TOKEN";
}
```

### 2. Subscription (Prime Plan)
Represents a membership plan.

- **Type**: `SUBSCRIPTION`
- **Specific Fields**:
  - `time`: string (Duration e.g., "1 Month", "1 Year")
  - `tierId`: string (Optional, link to Tier)
  - `plan`: Enum (BASIC, STANDARD, PREMIUM, PLATINUM) - *Note: This maps to `OfferPlan` enum in Prisma but `primeStatus` is often used for tiers.*
  
**TypeScript Interface**:
```typescript
interface Subscription {
  id: string;
  title: string;
  price: number;
  markedPrice: number;
  discount: number;
  time: string; // Required
  tierId?: string;
  offerActive: string[];
  offerInActive: string[];
  btncolor?: string;
  type: "SUBSCRIPTION";
}
```

## API Endpoints

Base URL: `/api/v1/admin`

**Authentication**: Requires Admin Bearer Token.

### Offers
| Method | Endpoint | Body | Description |
| :--- | :--- | :--- | :--- |
| POST | `/offer` | `{ title, price, markedPrice, discount, token, btncolor, offerActive, offerInActive }` | Create new Token Offer |
| GET | `/offer` | - | Get all Token Offers |
| GET | `/offer/:id` | - | Get specific Offer |
| PUT | `/offer/:id` | `{ ...partial updates }` | Update Offer |
| DELETE | `/offer/:id` | - | Delete Offer |

### Subscriptions
| Method | Endpoint | Body | Description |
| :--- | :--- | :--- | :--- |
| POST | `/subscription` | `{ title, price, markedPrice, discount, time, tierId, btncolor, offerActive, offerInActive }` | Create new Subscription Plan |
| GET | `/subscription` | - | Get all Subscriptions |
| GET | `/subscription/:id` | - | Get specific Subscription |
| PUT | `/subscription/:id` | `{ ...partial updates }` | Update Subscription |
| DELETE | `/subscription/:id` | - | Delete Subscription |

## Enums
**PurchaseType**:
- `TOKEN`
- `SUBSCRIPTION`

**PrimeStatus** (Often used for naming plans):
- `Bronze`
- `Silver`
- `Gold`
