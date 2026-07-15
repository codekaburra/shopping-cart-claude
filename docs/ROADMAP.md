# Roadmap

Planned work, in rough priority order. Nothing here is committed to a date.

## 1. Payment layer (next up — after current production test round)

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

## 2. Checkout auth revamp (backlog)

Replace the invite-code gate at checkout. Options discussed, undecided:

- **A. Guest checkout** — no login; contact fields only. Simplest, but no
  "my orders" page.
- **B. Phone (with country code) + password** — account keyed by phone.
- **C. Member ID + password** — closest to the current invite-code model.

Decision needed before design. Payment work does not block on this.

## 3. Smaller items (backlog)

- Rate-limit `/api/auth/invite` and `/api/admin/auth` (currently unlimited
  brute-force attempts; nginx `limit_req` is the cheap fix)
- Decide whether orders should decrement `ProductVariant.stock`
  (currently display-only — overselling is possible)
- Split the three inline views in `admin/(dashboard)/orders/page.tsx`
  (556 lines) into separate components
- Admin UI is zh-only while the shop is bilingual — decide if that is final
- Fix default branch on GitHub to `main` (needs repo admin)
