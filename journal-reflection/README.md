# Production Security & Threat Modeling Studio for Cloud Run

A production-grade, secure, and resilient web application engineered to adhere strictly to Google Cloud Production Directives, OWASP Top 10 (Web & LLM), zero-hardcoded secret hygiene, and resilient Gemini multi-model fallback execution.

## Features & Architecture

- **Agentic Threat Modeling**: Multi-zone analysis across the 5 Threat Zones (Input Surfaces, Planning & Reasoning, Tool Execution, Memory & State, Inter-System Communication) with automated Threat Summary Table generation.
- **OWASP & LLM Security Reviewer**: Data flow mapping from untrusted entry points to execution sinks with severity-ranked vulnerability triage and remediation code diffs.
- **Resilient Gemini Fallback Ladder**: Dynamic error recovery across `gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest` ➔ `gemini-3.7-flash` handling `503`, `429`, `404`, and `500` status codes.
- **Zero-Crash Payload Hygiene**: Strict top-level request deserialization, null-safe destructuring, and recursive undefined-stripping.
- **Owner-Bound Firestore Security**: Zero insecure defaults, isolated path matching `request.auth.uid == userId`, and role-based access control.

---

## 1. Environment & Prerequisites

Ensure the Google Cloud SDK (`gcloud`) and Firebase CLI are installed and configured:

```bash
# Set your Google Cloud Project ID
export PROJECT_ID="YOUR_PROJECT_ID"
export REGION="asia-southeast1" # or us-central1
gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup (Zero Hardcoding)

In compliance with Production Directive #4, credentials and API keys are stored in Google Cloud Secret Manager and accessed dynamically at runtime.

```bash
# 1. Create the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your secret version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Obtain project number for default compute service account
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# 4. Grant Secret Accessor role to Cloud Run service account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

Provision Cloud Firestore in native mode and enforce owner-bound security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Owner-bound isolation for user interactions and threat models
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/threat_models/{modelId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/security_reviews/{reviewId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Explicitly deny all other paths by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy the rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Cloud Run Deployment Flow & Verification Binding

Deploy the containerized service to Cloud Run with Secret Manager environment bindings and the mandatory campaign challenge label:

```bash
# Deploy to Cloud Run mounting the GEMINI_API_KEY secret
gcloud run deploy threat-modeling-studio \
  --source=. \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --update-labels=dev-tutorial=cloud-run-ai-challenge

# Alternatively, update an existing service with the challenge label
gcloud run services update threat-modeling-studio \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=$REGION
```

---

## 5. Local Development

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express + Vite) on port 3000
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
