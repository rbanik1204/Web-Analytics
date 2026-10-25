# Causal Funnel Analytics

A full-stack web analytics project for collecting browser events, storing them in MongoDB, and inspecting session activity through a React dashboard.

**Project links**
- **Frontend:** https://causal-funnel-analytics-eta.vercel.app/
- **Backend:** https://causal-funnel-analytics-1-wxnm.onrender.com/
- **Repository:** https://github.com/rbanik1204/Causal-Funnel-Analytics

## Overview

A browser-side JavaScript tracker sends event payloads to an Express API. The backend validates incoming events and persists them through Mongoose to MongoDB Atlas. The frontend requests session summaries and session-specific events and displays them in a React dashboard.

The current known scope includes event ingestion, MongoDB persistence, session listing, session-event retrieval, a heatmap/page-click route, and a health-check route. This README does not assume that advanced funnel conversion calculations or a complete heatmap visualization are already implemented.

## Features

- Browser-side event collection.
- Event ingestion through Express.
- Validation middleware before event storage.
- MongoDB persistence using Mongoose.
- Session listing and retrieval of events for a selected session.
- A route for heatmap/page-click data.
- Health-check endpoint.
- Separate frontend and backend deployments.

## Architecture

```text
Website / browser
      |
      | tracker sends event payload
      v
Express API (Render)
      |
      | validation + Mongoose
      v
MongoDB Atlas
      ^
      | query session/event data
      |
Express API <------ React dashboard (Vite, deployed on Vercel)
```

Because the frontend and backend use different origins in production, the frontend must call the deployed API URL and the backend must allow the frontend origin through CORS.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, Vite, JSX/JavaScript, CSS | Dashboard UI |
| Backend | Node.js, Express.js | HTTP routes and request handling |
| Data access | Mongoose | MongoDB models and persistence |
| Database | MongoDB Atlas | Event storage |
| Tracker | Browser JavaScript, Fetch API | Sends event payloads |
| Hosting | Vercel, Render | Frontend and backend hosting |
| Source control | Git, GitHub | Version control |

## Repository layout

```text
Causal-Funnel-Analytics/
├── backend/     # Express API, routes/controllers, validation, DB connection and models
├── frontend/    # React + Vite dashboard
├── tracker/     # Browser-side tracking script
└── README.md
```

This is a high-level layout; see the repository for the exact current file names.

## How the data flows

1. A website loads the tracker.
2. The tracker prepares an event payload.
3. The tracker sends the payload to the backend.
4. Validation middleware checks the request.
5. The backend stores the event through Mongoose in MongoDB.
6. The dashboard requests session data.
7. When a session is selected, the dashboard requests and displays its events.

For meaningful page context, test the tracker on the website being measured, not by browsing directly to the API endpoint.

## Prerequisites

- Node.js (a current LTS version is recommended)
- npm
- Git
- A MongoDB Atlas cluster or another reachable MongoDB instance

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/rbanik1204/Causal-Funnel-Analytics.git
cd Causal-Funnel-Analytics
```

### 2. Install and configure the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Use your own MongoDB connection string. The environment-variable name must exactly match the one read by the backend connection code; `MONGODB_URI` is the expected name based on the project's setup history. Never commit `.env` or expose database credentials in frontend code.

Start the backend using the script defined in `backend/package.json`. If it defines a `start` script:

```bash
npm start
```

Use the development script from `package.json` if one is defined. Check the terminal for the database connection result and the port the server binds to.

### 3. Install and configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` if the frontend reads the Vite API-base variable:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend using the script in `frontend/package.json`. For a standard Vite project, this is usually:

```bash
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

**Security note:** Vite variables prefixed with `VITE_` are exposed to browser code. Never put database passwords or server secrets in them.

### 4. Run the tracker

Follow the integration pattern in `tracker/` to include the script on a test page. Confirm that its endpoint matches the backend route and router mount prefix. Trigger a few test events, then check the browser Network tab, backend logs, and dashboard.

### 5. Verify the health endpoint

The backend defines `GET /health`. If the router is mounted at `/api`, test:

```text
http://localhost:3000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "CausalFunnel API is running"
}
```

The `/api` prefix depends on how the router is mounted in the server entry point.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | Backend | MongoDB connection string; must match the code |
| `FRONTEND_URL` | Backend, if used by CORS config | Allowed frontend origin |
| `PORT` | Backend | Port to bind; hosting may provide it automatically |
| `VITE_API_BASE_URL` | Frontend | Base URL for browser API requests |

Use placeholder values in documentation. Keep real credentials in local environment files or hosting-provider environment settings.

## API reference

The supplied router declares the following paths. They are relative to the router; the full URL depends on the prefix used when mounting it.

| Method | Router path | Handler / purpose |
|---|---|---|
| `GET` | `/` | `handleHomePage` |
| `GET` | `/events` | Renders the `index` view |
| `GET` | `/sessions/:session_id/events` | `handleViewSessionEvents` |
| `GET` | `/heatmap` | `handleGetPageClicks` — page-click/heatmap data |
| `GET` | `/sessions` | `handleViewSessionsCount` — session data/count |
| `POST` | `/events` | `handleValidateEvent` middleware, then `handleStoreEvent` |
| `GET` | `/health` | Returns HTTP 200 with a health-check response |

Render logs show requests such as `GET /api/sessions`. If the router is mounted at `/api`, the full paths are:

| Method | Full path, assuming `/api` mount |
|---|---|
| `GET` | `/api/` |
| `GET` | `/api/events` |
| `GET` | `/api/sessions/:session_id/events` |
| `GET` | `/api/heatmap` |
| `GET` | `/api/sessions` |
| `POST` | `/api/events` |
| `GET` | `/api/health` |

The health response is:

```json
{
  "success": true,
  "message": "CausalFunnel API is running"
}
```

`GET /events` is declared as a view-rendering route. It is distinct from `POST /events`, which handles event ingestion.

## Tracker integration checklist

Before using the tracker on a real site, confirm:

- The endpoint points to the intended backend URL.
- The payload matches backend validation requirements.
- Session identifiers are generated and reused according to the intended session model.
- Recorded page URLs refer to the page being measured.
- Failed requests do not break the host website.
- Unnecessary personal or sensitive information is not collected.

The exact payload schema should be documented from the tracker and validation middleware so integrations do not have to guess field names.

## Deployment

### Frontend — Vercel

Typical Vite settings:

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL=https://causal-funnel-analytics-1-wxnm.onrender.com`

Use the actual scripts in `frontend/package.json`. Vite variables are embedded at build time, so redeploy after changing them. If a URL shows an SSO/authentication page, check deployment protection separately from application code.

### Backend — Render

Backend URL: https://causal-funnel-analytics-1-wxnm.onrender.com

For a monorepo where the repository root is the Render service root, the previously used command pattern was:

- **Build:** `cd backend && npm ci`
- **Start:** `cd backend && npm start`

If Render's **Root Directory** is set to `backend`, use commands relative to that directory instead. Do not mix the two configurations.

Configure the MongoDB URI and CORS-related variables in Render settings. Use `process.env.PORT` for the assigned production port. Keep database credentials server-side.

### CORS

The browser enforces cross-origin rules. The backend must allow the exact origin used by the frontend. Preview and production deployments may have different hostnames and access policies.

## Design decisions and trade-offs

### Separate frontend and backend

**Why:** the React frontend and Express API can be deployed independently.

**Benefits**
- Each layer can be changed and deployed separately.
- The frontend can use static hosting/CDN delivery.
- Database credentials remain on the server.

**Trade-offs**
- Cross-origin requests require CORS configuration.
- The frontend API URL must be configured correctly.
- Preview and production URLs may have different access policies.

### MongoDB with Mongoose

**Why:** event records are naturally document-shaped, and Mongoose provides model-based persistence.

**Benefits**
- Event documents can evolve as new fields are added.
- Model schemas can provide validation where configured.

**Trade-offs**
- Indexes and query design matter as the collection grows.
- Flexible documents still require schema discipline.
- Large analytics workloads may eventually need aggregation optimization, retention policies, or a specialized analytics store.

### Browser-side tracking

**Why:** the browser can report client-side activity that a backend alone may not observe.

**Benefits**
- Can be integrated into an existing website.
- Captures client-side page/event context.

**Trade-offs**
- Ad blockers, extensions, network failures, consent choices, and JavaScript errors may prevent collection.
- Client-supplied payloads are untrusted and must be validated.
- Delivery should not be assumed to be exactly once unless retries and deduplication are implemented.

### Session-oriented API

**Why:** list sessions separately from retrieving one session's events.

**Benefits**
- The dashboard can load summaries first and details on selection.
- Avoids returning all event records in one response.

**Trade-offs**
- Requires additional requests.
- Pagination and limits may be necessary as data grows.
- Session grouping rules must be consistent between tracker and backend.

## Assumptions and limitations

- Full API paths shown with `/api` assume the router is mounted at that prefix. Confirm this in the server entry point.
- The exact event payload schema is not included here; the tracker and validation middleware are the source of truth.
- `MONGODB_URI` is shown as the expected database variable based on setup history; verify the exact name in the connection module.
- The supplied code establishes a heatmap route and handler, but not its complete response schema or the status of a finished heatmap UI.
- This README does not claim that configurable funnels, conversion/drop-off calculations, authentication, pagination, exports, or automated test coverage are implemented.
- Browser event delivery is best-effort unless retries, deduplication, and idempotency are explicitly implemented.
- URLs and event metadata can contain personal information. Minimize collection and define appropriate retention practices.

## Troubleshooting

### Frontend cannot reach the API
1. Confirm `VITE_API_BASE_URL` points to the intended backend.
2. Confirm the backend service is live.
3. Confirm the exact frontend origin is allowed by CORS.
4. Rebuild/redeploy after changing Vite variables.

### Session list is empty
1. Confirm the tracker runs on a real test page.
2. Check the browser Network tab for the event POST request and response.
3. Check Render logs for event-ingestion requests and errors.
4. Verify the Atlas cluster, database, and collection being inspected.
5. Confirm session identifiers are present and consistent.

### Health endpoint works but dashboard does not
A working health route does not prove the frontend deployment, API base URL, CORS configuration, or browser request flow is correct.

### Vercel displays an SSO/authentication page
Check whether deployment protection is enabled and whether the URL is a protected preview deployment or the intended public production deployment.

## Possible next steps

- Document the actual tracker payload schema with a request example.
- Add tests for validation, event ingestion, sessions, and session events.
- Add pagination and date filters for event/session queries.
- Add indexes based on real query patterns.
- Define funnel steps and conversion/drop-off calculations if required by the product scope.
- Document the heatmap response and complete the visualization if intended.
- Add privacy, retention, and consent controls.

## Contributing

1. Create a branch for your change.
2. Keep secrets out of commits.
3. Test frontend and backend independently.
4. Verify tracker payloads against backend validation.
5. Update this README when routes, environment variables, or setup steps change.

## License

No license was confirmed while this README was drafted. Add a `LICENSE` file and update this section before presenting the project as open source.
