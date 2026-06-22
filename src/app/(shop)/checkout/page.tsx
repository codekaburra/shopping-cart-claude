"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/i18n";
import { useT } from "@/i18n/locale-context";

type Fulfillment = "PICKUP" | "DELIVERY";

export default function CheckoutPage() {
  const t = useT();
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
        <fieldset className="card p-4">
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
        <div className="card space-y-4 p-4">
          <Field label={t("contactName")}>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="field"
            />
          </Field>
          <Field label={t("contactPhone")}>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="field"
            />
          </Field>
          {fulfillment === "DELIVERY" && (
            <Field label={t("address")}>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
                rows={2}
                className="field"
              />
            </Field>
          )}
          <Field label={t("note")}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              rows={2}
              className="field"
            />
          </Field>
        </div>

        {/* Order summary */}
        <div className="card p-4">
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

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? t("placingOrder") : t("placeOrder")}
        </button>
      </form>

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
          ? "rounded-xl border-2 border-brand-600 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700"
          : "rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100"
      }
    >
      {label}
    </button>
  );
}
