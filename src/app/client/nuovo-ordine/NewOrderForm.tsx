"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  icon: string | null;
}
interface DeliveryPoint {
  id: string;
  name: string;
  address: string;
  icon: string | null;
  isPrimary: boolean;
}

const QTY_PRESETS = [500, 1000, 2000, 5000, 10000, 20000];

function formatEur(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function NewOrderForm({
  products,
  deliveryPoints,
  priceMap,
  priceDate,
  hasPriceList,
}: {
  products: Product[];
  deliveryPoints: DeliveryPoint[];
  priceMap: Record<string, number>;
  priceDate: string;
  hasPriceList: boolean;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const [qtyMode, setQtyMode] = useState<"preset" | "custom">("preset");
  const [qty, setQty] = useState<number | "">("");
  const [customQty, setCustomQty] = useState<string>("");
  const [dpId, setDpId] = useState<string | null>(
    deliveryPoints[0]?.id ?? null
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);
  const selectedDp = deliveryPoints.find((d) => d.id === dpId);
  const effectiveQty = qtyMode === "preset" ? qty : Number(customQty) || 0;
  const unitPrice = productId ? priceMap[productId] : undefined;
  const total =
    unitPrice && effectiveQty ? unitPrice * Number(effectiveQty) : 0;

  async function submitOrder() {
    setError(null);
    if (!productId) {
      setError("Seleziona il prodotto da ordinare.");
      return;
    }
    if (!effectiveQty || effectiveQty < 100) {
      setError("Specifica una quantità valida (minimo 100 litri).");
      return;
    }
    if (!dpId) {
      setError("Seleziona un punto di consegna.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: effectiveQty,
        deliveryPointId: dpId,
        notes,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Errore durante l'invio della richiesta.");
      return;
    }
    const data = await res.json();
    setSuccessCode(data.code);
    router.refresh();
  }

  function reset() {
    setProductId(null);
    setQty("");
    setCustomQty("");
    setNotes("");
    setSuccessCode(null);
    setError(null);
  }

  if (successCode) {
    return (
      <div className="success-screen">
        <div className="success-icon">📤</div>
        <h2 className="success-title">Richiesta inviata con successo!</h2>
        <p className="success-msg">
          La tua richiesta è stata trasmessa a FA Petroli. Riceverai una
          conferma via email e verrai contattato per i dettagli della consegna.
        </p>
        <div className="success-code">N° {successCode}</div>
        <div className="success-actions">
          <button className="btn-orange" onClick={reset}>
            ➕ Invia un'altra richiesta
          </button>
          <Link href="/client/storico" className="btn-ghost" style={{ background: "#fff" }}>
            Vedi le mie richieste →
          </Link>
        </div>
      </div>
    );
  }

  if (deliveryPoints.length === 0) {
    return (
      <div className="alert alert-info">
        ℹ️ Nessun punto di consegna configurato. Contatta FA Petroli per
        aggiungere il tuo primo punto di consegna prima di procedere con una
        richiesta.
      </div>
    );
  }

  return (
    <div className="order-form-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {!hasPriceList && (
          <div className="alert alert-info">
            ℹ️ Nessun listino ancora pubblicato. Puoi comunque inviare la
            richiesta: FA Petroli ti comunicherà il prezzo.
          </div>
        )}

        <div className="order-card">
          <h3>1. Seleziona il prodotto</h3>
          <div className="products-grid">
            {products.map((p) => {
              const price = priceMap[p.id];
              return (
                <button
                  key={p.id}
                  className={"prod-tile" + (productId === p.id ? " selected" : "")}
                  onClick={() => setProductId(p.id)}
                  type="button"
                >
                  <span className="prod-tile-icon">{p.icon ?? "⛽"}</span>
                  <span className="prod-tile-name">{p.name}</span>
                  {price != null && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--orange)",
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      € {price.toFixed(3)}/L
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="order-card">
          <h3>2. Specifica la quantità</h3>
          <div className="qty-mode-tabs">
            <div
              className={"qty-tab" + (qtyMode === "preset" ? " active" : "")}
              onClick={() => setQtyMode("preset")}
            >
              Quantità predefinita
            </div>
            <div
              className={"qty-tab" + (qtyMode === "custom" ? " active" : "")}
              onClick={() => setQtyMode("custom")}
            >
              Inserimento libero
            </div>
          </div>
          {qtyMode === "preset" ? (
            <div className="qty-presets">
              {QTY_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={"qty-preset" + (qty === v ? " selected" : "")}
                  onClick={() => setQty(v)}
                >
                  {v.toLocaleString("it-IT")} L
                </button>
              ))}
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Quantità in litri</label>
              <input
                type="number"
                min={100}
                step={100}
                placeholder="es. 7500"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="order-card">
          <h3>3. Punto di consegna</h3>
          <div className="delivery-points">
            {deliveryPoints.map((dp) => (
              <div
                key={dp.id}
                className={"dp-option" + (dpId === dp.id ? " selected" : "")}
                onClick={() => setDpId(dp.id)}
              >
                <div className="dp-radio"></div>
                <div>
                  <div className="dp-name">
                    {dp.icon ?? "📍"} {dp.name}
                  </div>
                  <div className="dp-addr">{dp.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-card">
          <h3>4. Note per la consegna</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Istruzioni speciali (opzionale)</label>
            <textarea
              placeholder="es. Consegnare entro le ore 10:00 · Referente in loco: Sig. Bianchi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="order-summary-card">
          <h3>📋 Riepilogo richiesta</h3>
          <div className="summary-row">
            <span className="summary-label">Prodotto</span>
            <span
              className="summary-value"
              style={{
                color: selectedProduct ? "#fff" : "rgba(255,255,255,.4)",
              }}
            >
              {selectedProduct?.name ?? "— seleziona"}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Quantità</span>
            <span
              className="summary-value"
              style={{ color: effectiveQty ? "#fff" : "rgba(255,255,255,.4)" }}
            >
              {effectiveQty
                ? effectiveQty.toLocaleString("it-IT") + " L"
                : "— seleziona"}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Prezzo unit.</span>
            <span
              className="summary-value"
              style={{ color: unitPrice ? "#fff" : "rgba(255,255,255,.4)" }}
            >
              {unitPrice ? `€ ${unitPrice.toFixed(3)}/L` : "— da definire"}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Consegna</span>
            <span className="summary-value">
              {selectedDp?.name ?? "— seleziona"}
            </span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row" style={{ marginTop: 4 }}>
            <span
              className="summary-label"
              style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}
            >
              Totale stimato
            </span>
            <span
              className="summary-value"
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: total ? "var(--orange)" : "rgba(255,255,255,.4)",
              }}
            >
              {total ? formatEur(total) : "—"}
            </span>
          </div>
          {hasPriceList && unitPrice != null && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.45)",
                marginTop: 4,
                textAlign: "right",
              }}
            >
              Listino del{" "}
              {new Date(priceDate + "T00:00:00").toLocaleDateString("it-IT")}
            </div>
          )}
          <div className="summary-divider"></div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.45)",
              lineHeight: 1.7,
            }}
          >
            📧 Conferma via email immediata
            <br />
            📞 FA Petroli ti contatterà per i dettagli consegna
            <br />
            ❌ Puoi annullare la richiesta in qualsiasi momento prima
            dell'evasione
          </div>
          <button
            className="btn-submit"
            onClick={submitOrder}
            disabled={loading}
          >
            {loading ? "Invio..." : "Invia richiesta a FA Petroli →"}
          </button>
        </div>
      </div>
    </div>
  );
}
