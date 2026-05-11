import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import Link from "next/link";

function todayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function ListinoClientPage() {
  const session = await auth();
  const today = todayUTC();

  let prices = await prisma.dailyPrice.findMany({
    where: { date: today },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });

  let effectiveDate = today;
  if (prices.length === 0) {
    const latest = await prisma.dailyPrice.findFirst({
      where: { date: { lte: today } },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    if (latest) {
      effectiveDate = latest.date;
      prices = await prisma.dailyPrice.findMany({
        where: { date: latest.date },
        include: { product: true },
        orderBy: { product: { name: "asc" } },
      });
    }
  }

  const isToday =
    effectiveDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);

  return (
    <>
      <Topbar title="Listino prezzi" userName={session!.user.name ?? "Cliente"} />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Listino prezzi del giorno 💶</h2>
            <p>
              Prezzi €/litro aggiornati da FA Petroli. Il totale della tua
              richiesta verrà calcolato sulla quantità che indicherai.
            </p>
          </div>
          <Link href="/client/nuovo-ordine" className="btn-orange">
            ➕ Invia una richiesta
          </Link>
        </div>

        {prices.length === 0 ? (
          <div className="card">
            <div style={{ padding: 40 }}>
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>Nessun listino disponibile.</p>
                <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 8 }}>
                  FA Petroli pubblicherà a breve i prezzi aggiornati.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              className={"alert " + (isToday ? "alert-success" : "alert-info")}
              style={{ marginBottom: 20 }}
            >
              {isToday ? "✅" : "ℹ️"}{" "}
              {isToday
                ? "Listino aggiornato a oggi: "
                : "Ultimo listino disponibile: "}
              <strong>
                {effectiveDate.toLocaleDateString("it-IT", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>

            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {prices.map((p) => (
                <div key={p.id} className="kpi-card blue">
                  <div className="kpi-icon">{p.product.icon ?? "⛽"}</div>
                  <div className="kpi-label">{p.product.name}</div>
                  <div className="kpi-value">€ {p.price.toFixed(3)}</div>
                  <div className="kpi-sub">al litro</div>
                  {p.notes && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "var(--gray-500)",
                        fontStyle: "italic",
                      }}
                    >
                      {p.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">📋 Riepilogo prezzi (€/L)</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Prodotto</th>
                      <th>Prezzo unitario</th>
                      <th>Esempio 1.000 L</th>
                      <th>Esempio 5.000 L</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p) => (
                      <tr key={p.id}>
                        <td className="td-bold">
                          {p.product.icon ?? "⛽"} {p.product.name}
                        </td>
                        <td style={{ color: "var(--orange)", fontWeight: 700 }}>
                          € {p.price.toFixed(3)}
                        </td>
                        <td>€ {(p.price * 1000).toFixed(2)}</td>
                        <td>€ {(p.price * 5000).toFixed(2)}</td>
                        <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                          {p.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
