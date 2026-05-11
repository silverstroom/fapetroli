import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import ProfileForm from "./ProfileForm";
import { initials } from "@/lib/utils";

export default async function ProfiloPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: {
      company: { include: { deliveryPoints: true } },
    },
  });
  if (!user || !user.company) return null;

  return (
    <>
      <Topbar title="Profilo & impostazioni" userName={user.name} />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Profilo & impostazioni ⚙️</h2>
            <p>
              Gestisci i tuoi dati personali, l'azienda, i punti di consegna e
              la sicurezza dell'account
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-header-card">
            <div className="profile-avatar-big">
              {initials(user.company.ragioneSociale)}
            </div>
            <div>
              <div className="profile-name">{user.company.ragioneSociale}</div>
              <div className="profile-since">
                Cliente FA Petroli dal{" "}
                {user.company.createdAt.getFullYear()}
                {user.company.citta ? ` · ${user.company.citta}` : ""}
              </div>
            </div>
            <div className="profile-piva">P.IVA {user.company.partitaIva}</div>
          </div>

          <ProfileForm
            user={{
              id: user.id,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            }}
            company={{
              id: user.company.id,
              ragioneSociale: user.company.ragioneSociale,
              partitaIva: user.company.partitaIva,
              pec: user.company.pec,
              indirizzo: user.company.indirizzo,
              citta: user.company.citta,
            }}
          />

          <div className="profile-card">
            <div className="card-header">
              <span className="card-title">📍 Punti di consegna</span>
            </div>
            <div className="profile-card-body">
              {user.company.deliveryPoints.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📍</div>
                  Nessun punto di consegna configurato.
                  <br />
                  <small>
                    Contatta FA Petroli per aggiungere il tuo primo punto di
                    consegna.
                  </small>
                </div>
              )}
              {user.company.deliveryPoints.map((dp) => (
                <div
                  key={dp.id}
                  style={{
                    padding: 14,
                    borderBottom: "1px solid var(--gray-100)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {dp.icon ?? "📍"} {dp.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--gray-500)",
                        marginTop: 2,
                      }}
                    >
                      {dp.address}
                    </div>
                  </div>
                  {dp.isPrimary && (
                    <span className="badge badge-processing">Principale</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
