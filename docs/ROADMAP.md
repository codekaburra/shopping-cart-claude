# Roadmap

Planned work, in rough priority order. Nothing here is committed to a date.

## 1. Security & correctness (before taking payments)

From the code review of 2026-07-28. These are ordered by severity, and the
first one should land before the payment layer — payment adds amounts and
payment status to the same order records that are currently exposed.

### 1.1 Order page has no access control (critical) — FIXED

`src/app/(shop)/order/[id]/page.tsx` loaded an order with `findUnique` and no
session or ownership check, so anyone holding an order ID could read the
customer's name, phone and delivery address.

Fixed: the page now requires a session (redirecting to `/login?next=…`
otherwise) and scopes the lookup with `findFirst({ where: { id, userId } })`,
so another customer's order is simply not found.

### 1.2–1.5 Admin order API hardening — FIXED

The admin order routes could edit another order's items (`orderItem.update`
scoped by item id alone, while `removeItems` right above it correctly scoped
by `orderId`), accepted an arbitrary `fulfillment` string, allowed `DELIVERY`
with no address, never checked `quantity` was an integer, had no `try`/`catch`
anywhere, and applied their writes without a transaction.

Fixed: every item write is now scoped by `orderId`, the patch is validated
against the *resulting* order state (so a delivery order still needs an address
when only one of the two fields is sent), all four admin routes guard
`request.json()` and map failures to typed error codes, and the edit runs in
`prisma.$transaction`.

Note for future work in this file: the transaction rolls back only when the
callback **throws**. Returning an error value commits the writes made so far —
this was caught in testing and is why the route throws a `PatchError`.

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
