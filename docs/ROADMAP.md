# Roadmap

Planned work, in rough priority order. Nothing here is committed to a date.

## 1. Security & correctness (before taking payments)

From the code review of 2026-07-28. These are ordered by severity, and the
first one should land before the payment layer — payment adds amounts and
payment status to the same order records that are currently exposed.

### 1.1 Order page has no access control (critical)

`src/app/(shop)/order/[id]/page.tsx` loads an order with `findUnique` and
renders it with **no session check and no ownership check**. `src/proxy.ts`
only gates `/checkout`, so the page is fully public: anyone holding an order
ID — logged in or not — sees the customer's name, phone, delivery address,
items, and total.

Order IDs are cuids so they aren't guessable, but they travel in URLs, browser
history, and chat messages. Textbook IDOR exposing PII.

Fix: verify the session's `userId` matches `order.userId`, otherwise
`notFound()`. Decide separately whether an unauthenticated "order confirmed"
view is needed right after checkout — if so, gate it with a short-lived signed
token rather than the raw ID.

### 1.2 Admin order edit can modify other orders' items

In `src/app/api/admin/orders/[id]/route.ts`, the `items` loop updates and
deletes by item ID alone:

```ts
await prisma.orderItem.update({ where: { id: item.id } , ... })
```

`removeItems` a few lines above correctly scopes with `orderId: id`. Same
route, two conventions — the unscoped one lets a stale or buggy client edit a
different order's items. Admin-only, so this is data integrity rather than
privilege escalation.

### 1.3 No input validation on admin order edit

Same route: `fulfillment` accepts any string (Prisma then throws on an invalid
enum, surfacing as a 500), `DELIVERY` is accepted with no address, and
`quantity` is never checked for being a positive integer. The public
`/api/orders` validates all three — the admin path should not be weaker.

### 1.4 No error handling in any API route

None of the six routes has a `try`/`catch`. `/api/orders` and
`/api/auth/invite` at least guard `request.json()` with `.catch(() => null)`;
the four admin routes don't, so a malformed body is an unhandled throw.

### 1.5 Order edit is not atomic

The order update, `deleteMany`, and per-item updates are separate writes. A
failure part-way leaves the order half-edited. Wrap in `prisma.$transaction`.

### 1.6 Rate-limit the login endpoints

`/api/auth/invite` and `/api/admin/auth` accept unlimited attempts — invite
codes and the admin password can both be brute-forced. Cheapest fix is nginx
`limit_req` in `deploy/nginx.conf`.

### 1.7 Dashboard revenue reads the whole OrderItem table

`src/app/admin/(dashboard)/page.tsx` pulls every order item into memory twice
to sum revenue. Fine at current volume, linear growth from here. Also worth
confirming: revenue currently counts `PENDING_PAYMENT` orders, i.e. money not
yet received.

### 1.8 `picked` is never reset

Changing an item's quantity, or moving an order back a status, leaves items
flagged as picked. Picking data silently goes stale.

## 2. Payment layer (after the security fixes above)

Accept online payment at checkout instead of manual payment verification.

```
Payment Layer
├── Stripe
│    ├── Visa
│    ├── Mastercard
│    ├── Apple Pay
│    └── Google Pay
└── LINE Pay
```

### Architecture sketch

- **Stripe Checkout (hosted page)** for cards + Apple Pay + Google Pay.
  Server creates a Checkout Session from the order, redirects the customer,
  and a webhook (`checkout.session.completed`) marks the order paid. Apple
  Pay / Google Pay appear automatically on the hosted page — no extra code.
- **LINE Pay v3 API** (Request → user approves in LINE app → Confirm).
  Server-side `Request` call returns a payment URL; after approval LINE
  redirects back with a transaction id that the server must `Confirm`.
- New DB fields on `Order`: payment provider, provider transaction id,
  paid-at timestamp. Status flow gains an automated
  `PENDING_PAYMENT → PENDING_VERIFICATION`(or straight to
  `PENDING_SHIPMENT`) transition driven by webhook/confirm instead of the
  admin clicking.
- Refunds stay manual in provider dashboards for v1.

### Order of work

1. Schema: payment fields + migration
2. Stripe Checkout happy path (test mode) + webhook
3. LINE Pay sandbox flow
4. Admin: show payment status/provider on order detail
5. Switch both to live keys after end-to-end test

### Non-coding prerequisites (owner to prepare)

| Item | Needed for | Notes |
|---|---|---|
| Business registration (商業登記) | Stripe + LINE Pay onboarding | Sole proprietorship is fine; both providers verify it |
| Bank account for payouts | Both | Where settled funds land |
| Stripe account | Stripe | stripe.com — needs business info, bank account, ID |
| **HTTPS + a real domain** | Both (hard requirement) | Apple Pay refuses non-HTTPS; webhooks need a stable URL. Domain + Let's Encrypt (already documented in README) |
| Apple Pay domain verification | Apple Pay | One click in Stripe dashboard once domain is live |
| LINE Pay merchant application | LINE Pay | pay.line.me merchant signup; approval can take days–weeks, apply early |
| Decide currency & prices | Both | Current `formatPrice` shows raw `$` — confirm TWD/HKD and update display |
| Refund / cancellation policy text | Both | Providers ask for it; also needed on the site footer |

## 3. Checkout auth revamp (backlog)

Replace the invite-code gate at checkout. Options discussed, undecided:

- **A. Guest checkout** — no login; contact fields only. Simplest, but no
  "my orders" page.
- **B. Phone (with country code) + password** — account keyed by phone.
- **C. Member ID + password** — closest to the current invite-code model.

Decision needed before design. Payment work does not block on this.

## 4. Smaller items (backlog)

- Decide whether orders should decrement `ProductVariant.stock`
  (currently display-only — overselling is possible)
- Split the three inline views in `admin/(dashboard)/orders/page.tsx`
  (556 lines) into separate components
- Admin UI is zh-only while the shop is bilingual — decide if that is final
- Fix default branch on GitHub to `main` (needs repo admin)
- Prune merged remote branches (~20 stale ones)
