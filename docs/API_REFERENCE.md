# REST API Reference & Endpoint Specifications

All API endpoints are located under `/api/` (except the high-speed `/r/[slug]` redirect router). Standard requests and responses use `application/json` unless otherwise noted.

---

## 1. Redirection & Edge Routing

### `GET /r/{slug}`
Public dynamic redirect entry point for NFC taps and QR code scans.

- **Query Parameters**:
  - `source` *(optional)*: `nfc` | `qr` | `direct`
- **Response**:
  - `302 Found`: Redirects immediately to the destination URL.
  - `307 Temporary Redirect`: Redirects to `/r/unactivated?card={slug}`, `/r/inactive`, or `/r/invalid` depending on card state.

---

## 2. Card Management APIs

### `GET /api/cards`
Retrieve cards with optional filtering.

- **Query Parameters**:
  - `business_id` *(optional)*: Filter by business UUID.
  - `status` *(optional)*: `active` | `unactivated` | `inactive`
  - `batch_id` *(optional)*: Filter by batch identifier.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c7a8b9d0-1234-5678-90ab-cdef12345678",
        "slug": "GR001",
        "business_id": "b1a2c3d4-...",
        "name": "Front Desk Standee",
        "destination_type": "google_review",
        "destination_url": "https://search.google.com/local/writereview?placeid=ChIJ...",
        "status": "active",
        "batch_id": "BATCH-2026-001",
        "activation_code": "49K2-X8L1",
        "total_scans": 142,
        "nfc_scans": 98,
        "qr_scans": 44,
        "iphone_scans": 82,
        "android_scans": 60,
        "created_at": "2026-10-01T10:00:00Z"
      }
    ]
  }
  ```

### `POST /api/cards`
Create a new card entry.

- **Request Body**:
  ```json
  {
    "slug": "GR002",
    "name": "Billing Counter Card",
    "business_id": "b1a2c3d4-...",
    "destination_type": "google_review",
    "destination_url": "https://search.google.com/local/writereview?placeid=...",
    "status": "active"
  }
  ```

### `GET /api/cards/{id}`
Retrieve a single card by ID or Slug.

### `PATCH /api/cards/{id}`
Update card details or destination URL.

- **Request Body**:
  ```json
  {
    "destination_type": "whatsapp",
    "destination_url": "https://wa.me/919876543210?text=Hello",
    "status": "active"
  }
  ```

### `DELETE /api/cards/{id}`
Delete a card.

### `GET /api/cards/{id}/export`
Directly download high-resolution print artwork for a single card.

- **Query Parameters**:
  - `format`: `png` *(300 DPI)* | `svg` *(Vector)* | `pdf` *(CR80 single sheet)*
  - `bleed` *(optional)*: Bleed in mm (default `2.0`).
  - `template_id` *(optional)*: `google-review-v1`.
- **Response**: Direct binary stream with `Content-Disposition: attachment`.

---

## 3. Business Tenant APIs

### `GET /api/businesses`
List all registered business tenants.

### `POST /api/businesses`
Create a new business tenant profile.

- **Request Body**:
  ```json
  {
    "name": "Cafe Mocha Roasters",
    "category": "Cafe & Restaurant",
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "google_review_url": "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    "whatsapp_number": "919876543210",
    "instagram_handle": "cafemocha_in",
    "primary_destination": "google_review",
    "address": "MG Road, Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "phone": "+91 98765 43210"
  }
  ```

### `GET /api/businesses/{id}`
Retrieve business details and linked cards.

### `PATCH /api/businesses/{id}`
Update business contact details, locations, and default links.

### `DELETE /api/businesses/{id}`
Delete a business and cascade delete its linked cards.

---

## 4. Activation & Owner Self-Service APIs

### `POST /api/activation/verify`
Verify card existence and check if it is ready for claiming.

- **Request Body**: `{ "cardId": "GR001" }`
- **Response (200 OK)**:
  ```json
  {
    "valid": true,
    "already_activated": false,
    "card": { "slug": "GR001", "name": "Warehouse Card #1" }
  }
  ```

### `POST /api/activation/activate`
Claim and activate an unactivated physical card using its Secret Activation Code.

- **Request Body**:
  ```json
  {
    "cardId": "GR001",
    "activationCode": "49K2-X8L1",
    "businessName": "Spicy Treat Restaurant",
    "googleReviewUrl": "https://search.google.com/local/writereview?placeid=...",
    "category": "Restaurant",
    "city": "Mumbai",
    "phone": "+91 98200 12345"
  }
  ```

### `POST /api/manage/verify`
Authenticate a business owner for self-service card management using Dual-Token credentials.

- **Request Body**:
  ```json
  {
    "cardId": "GR001",
    "activationCode": "49K2-X8L1"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "valid": true,
    "card": { "slug": "GR001", "destination_type": "google_review", "destination_url": "..." },
    "business": { "name": "Spicy Treat Restaurant" },
    "scanCount": 142,
    "nfcCount": 98,
    "qrCount": 44,
    "iphoneCount": 82,
    "androidCount": 60,
    "recentEvents": [...]
  }
  ```

### `POST /api/manage/update`
Update a card's redirect target from the owner self-service portal.

- **Request Body**:
  ```json
  {
    "cardId": "GR001",
    "activationCode": "49K2-X8L1",
    "destinationType": "whatsapp",
    "destinationUrl": "https://wa.me/919820012345?text=Hello"
  }
  ```

---

## 5. Analytics & Telemetry APIs

### `GET /api/analytics`
Retrieve aggregated system-wide or per-business analytics.

- **Query Parameters**:
  - `business_id` *(optional)*
  - `card_id` *(optional)*
  - `days` *(optional)*: Default `14` (up to `60`).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "total_scans": 2450,
      "nfc_scans": 1820,
      "qr_scans": 630,
      "unique_devices": 1940
    },
    "timeline": [
      { "date": "2026-10-09", "total": 184, "nfc": 140, "qr": 44 }
    ],
    "devices": { "ios": 1280, "android": 1100, "other": 70 }
  }
  ```

### `GET /api/cron/cleanup-telemetry`
Automated maintenance job that aggregates raw tap logs older than 60 days into `card_daily_analytics` daily rollups and purges raw rows.

- **Headers**:
  - `Authorization: Bearer {CRON_SECRET}` *(optional in development)*
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "purged_events": 1420,
    "created_rollups": 38,
    "message": "Telemetry retention cleanup completed successfully."
  }
  ```

---

## 6. Print Jobs & Batch Production APIs

### `GET /api/print-jobs`
List all batch print jobs.

### `POST /api/print-jobs`
Create and process a commercial print run (PDF sheet imposition + 300 DPI PNG ZIP + QR ZIP + CSV Manifest).

- **Request Body**:
  ```json
  {
    "job_name": "October Batch #1",
    "template_id": "google-review-v1",
    "card_data": [
      { "cardId": "GR001", "activationCode": "49K2-X8L1", "businessName": "Store 1" }
    ],
    "sheet_config": {
      "sheetSize": "A4",
      "includeCutMarks": true,
      "includeBleed": true,
      "bleedAmount": 2.0
    },
    "export_options": {
      "generatePdf": true,
      "generateCardsZip": true,
      "generateQrZip": true,
      "generateManifest": true
    }
  }
  ```

### `GET /api/print-jobs/{id}/download`
Download the generated print artifacts.

- **Query Parameters**:
  - `type`: `pdf` | `cards_zip` | `qr_zip` | `manifest`
- **Response**: Binary stream of the requested `.pdf`, `.zip`, or `.csv` asset.
