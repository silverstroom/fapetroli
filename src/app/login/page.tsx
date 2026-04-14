import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-grid">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-icon">FA</div>
            <div className="auth-brand-name">
              FA Petroli <small>Portale Clienti B2B</small>
            </div>
          </div>
          <h1 className="auth-headline">
            Il tuo ordine,
            <br />
            <em>in pochi click.</em>
          </h1>
          <p className="auth-sub">
            Accedi al portale riservato ai clienti B2B di FA Petroli: ordina
            carburanti, monitora le consegne e gestisci il tuo profilo
            aziendale in totale autonomia.
          </p>
          <div className="auth-bullets">
            <div className="auth-bullet">
              Ordina gasolio, benzina e lubrificanti 24 ore su 24
            </div>
            <div className="auth-bullet">
              Seleziona tra i tuoi punti di consegna abilitati
            </div>
            <div className="auth-bullet">
              Conferma via email immediata dopo ogni ordine
            </div>
            <div className="auth-bullet">
              Storico ordini sempre disponibile e filtrabile
            </div>
          </div>
        </div>
        <div className="auth-right">
          <h2 className="auth-form-title">Accedi all'area riservata</h2>
          <p className="auth-form-sub">
            Inserisci le credenziali fornite da FA Petroli
          </p>
          <LoginForm />
          <p className="auth-footer">
            Non sei ancora cliente?{" "}
            <a href="/register">Richiedi l'attivazione →</a>
            <br />
            <br />
            Problemi di accesso? Contatta FA Petroli
            <br />
            📞 <a href="tel:0968453815">0968-453815</a>
          </p>
        </div>
      </div>
    </div>
  );
}
