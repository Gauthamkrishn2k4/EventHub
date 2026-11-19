# EventHub - Full Stack Event Booking & Management Platform

React + Vite client, Node/Express API, MongoDB/Mongoose. JWT auth with Admin / Customer roles.

## Run it

```bash
# 1. API
cd server && cp .env.example .env      # set MONGODB_URI and JWT_SECRET
npm install
npm run seed:demo                      # creates the admin (from .env) + 6 sample events
npm run dev                            # http://localhost:5000

# 2. Client
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api to :5000)
```
Admin login = `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`. Customers sign up from the UI.

## Architecture

```
server/src
  config/       env (zod-validated), db, constants (roles, statuses, transitions)
  routes/       URL + middleware wiring only
  controllers/  HTTP in/out only (no business rules)
  services/     ALL business logic: auth, events, bookings, dashboard
  validators/   zod schemas for body / query / params
  middleware/   authenticate, authorize, validate, rate limit, centralised error handler
  models/       Mongoose schemas + indexes
  utils/        ApiError, asyncHandler, pagination, booking reference, jwt, money
  scripts/      seed (controlled admin creation)
client/src
  api/ (axios + one module per resource) · context/ (auth) · hooks/ · components/ (reusable UI)
  pages/ (customer) · pages/admin/ · utils/ (format, validation)
```
Request flow: `route -> validate -> authenticate -> authorize -> controller -> service -> model`. Errors from any layer
reach one `errorHandler` that emits `{ success:false, message, details? }`.

## Security
- bcrypt-hashed passwords (`select:false`), JWT bearer tokens, role loaded from the DB on every request.
- `role` is not part of the register schema, so public registration can only create Customers; admins come from the seed.
- Every admin route is guarded server-side with `authorize('Admin')`; the React route guards are UX only.
- helmet, CORS allow-list, 10 kb body limit, login/register rate limiting, regex-escaped search, ObjectId validation.

## Concurrency: how overbooking is prevented
Booking uses a single **atomic conditional update**, not read-then-write:
```js
Event.findOneAndUpdate(
  { _id, status: 'Published', eventDate: { $gt: now }, availableTickets: { $gte: quantity } },
  { $inc: { availableTickets: -quantity } })
```
MongoDB applies this atomically per document, so of N simultaneous requests for the last tickets only those that fit
succeed; the rest match nothing and get a precise 409. After reserving, the booking is inserted; if the insert fails the
reservation is released (compensation). Cancellation flips `Confirmed -> Cancelled` with a conditional update and only the
request that performed the flip restores tickets, so repeated cancels never restore twice.

**Why not transactions?** They need a replica set, which many dev setups lack. The conditional update works on a
standalone server and is faster.

**Limitations (be ready to discuss):**
1. Reserve + insert are two writes, not one transaction. A process crash between them can leak a reservation
   (tickets reduced, no booking). A transaction (`session.withTransaction`) or a periodic reconciliation job
   (`totalTickets - sum(confirmed quantity)`) closes this gap.
2. Same for cancel: if the process dies after flipping the booking but before restoring tickets, tickets stay held.
3. Cancelling an event while a booking is mid-flight could leave one confirmed booking on a cancelled event; with a
   replica set, run the cascade and booking in transactions.
4. Hot events serialise on one document; at very high write rates use sharded counters or a queue.

## Business decisions
- **Event time:** `eventDate` stores the start instant (UTC); the form combines date + start time in the browser's
  timezone. `startTime`/`endTime` are display strings. Cancellation/booking cut-off is `eventDate`.
- **Event deletion:** blocked (409) once any booking exists. Cancelling an event instead cancels all its confirmed bookings
  (simulated refund) and releases tickets.
- **Status transitions:** Draft <-> Published, either -> Cancelled (terminal). Past events cannot be published.
- **Capacity edits:** `availableTickets` is adjusted by the capacity change; capacity cannot drop below tickets sold.
- **Dashboard value:** sum of `totalAmount` of *Confirmed* bookings only.
- **Customer listing** hides events that already started; admins see everything (with an optional status filter).
- Max 10 tickets per booking (`MAX_TICKETS_PER_BOOKING`).

## API
Auth: `POST /api/auth/register|login`, `GET /api/auth/me`
Events: `GET /api/events` (`search, category, from, to, sort=date_asc|date_desc|price_asc|price_desc, page, limit`; admin also `status`),
`GET /api/events/categories`, `GET|PUT|DELETE /api/events/:id`, `POST /api/events`, `PATCH /api/events/:id/status`
Bookings: `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings` (admin: `reference, eventId, status`),
`GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel`
Dashboard (admin): `GET /api/dashboard/stats`, `GET /api/dashboard/recent-bookings?limit=`
Lists return `{ success, data, meta:{ page, limit, total, totalPages } }`.
