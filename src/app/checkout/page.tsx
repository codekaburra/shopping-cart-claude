"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import { t, formatPrice } from "@/i18n/zh-Hant";

type Fulfillment = "PICKUP" | "DELIVERY";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();

  const [fulfillment, setFulfillment] = useState<Fulfillment>("PICKUP");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">{t("cartEmpty")}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!contactName.trim()) return setError(t("errorNameRequired"));
    if (!contactPhone.trim()) return setError(t("errorPhoneRequired"));
    if (fulfillment === "DELIVERY" && !address.trim())
      return setError(t("errorAddressRequired"));

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          contactName,
          contactPhone,
          note,
          fulfillment,
          address,
        }),
      });
      if (!response.ok) {
        setError(t("errorOrderFailed"));
        return;
      }
      const { id } = (await response.json()) as { id: string };
      clear();
      router.replace(`/order/${id}`);
    } catch {
      setError(t("errorOrderFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("checkoutTitle")}</h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {/* Fulfillment method */}
        <fieldset className="rounded-xl border border-neutral-200 bg-white p-4">
          <legend className="px-1 text-sm font-medium">
            {t("fulfillmentLabel")}
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <FulfillmentOption
              label={t("fulfillmentPickup")}
              active={fulfillment === "PICKUP"}
              onClick={() => setFulfillment("PICKUP")}
            />
            <FulfillmentOption
              label={t("fulfillmentDelivery")}
              active={fulfillment === "DELIVERY"}
              onClick={() => setFulfillment("DELIVERY")}
            />
          </div>
        </fieldset>

        {/* Contact info */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
          <Field label={t("contactName")}>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t("contactPhone")}>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="input"
            />
          </Field>
          {fulfillment === "DELIVERY" && (
            <Field label={t("address")}>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
                rows={2}
                className="input"
              />
            </Field>
          )}
          <Field label={t("note")}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              rows={2}
              className="input"
            />
          </Field>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-medium">{t("orderSummary")}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between">
                <span className="text-neutral-600">
                  {item.productName}（{item.size}） × {item.quantity}
                </span>
                <span>{formatPrice(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 font-semibold">
            <span>{t("total")}</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("cashNotice")}
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {submitting ? t("placingOrder") : t("placeOrder")}
        </button>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d4d4d4;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          outline: none;
        }
        .input:focus { border-color: #171717; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function FulfillmentOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          : "rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
      }
    >
      {label}
    </button>
  );
}
