import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
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
            Diventa cliente
            <br />
            <em>FA Petroli.</em>
          </h1>
          <p className="auth-sub">
            Registra la tua azienda al portale B2B. Una volta verificati i
            dati, FA Petroli attiverà il tuo account e riceverai una email di
            conferma per iniziare a ordinare.
          </p>
          <div className="auth-bullets">
            <div className="auth-bullet">Registrazione gratuita in 2 minuti</div>
            <div className="auth-bullet">
              Approvazione manuale per garantire qualità del servizio
            </div>
            <div className="auth-bullet">Nessun vincolo, nessun abbonamento</div>
          </div>
        </div>
        <div className="auth-right">
          <h2 className="auth-form-title">Richiedi attivazione</h2>
          <p className="auth-form-sub">
            Compila i dati: ti contatteremo entro 24h
          </p>
          <RegisterForm />
          <p className="auth-footer">
            Hai già un account? <a href="/login">Accedi →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
