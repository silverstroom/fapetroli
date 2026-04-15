import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="login-v2-wrapper">
      <div className="login-v2-card">
        {/* Left side - Branded panel */}
        <div className="login-v2-left">
          <div className="login-v2-dots" />
          <div className="login-v2-left-content">
            <div className="login-v2-logo">
              <div className="login-v2-logo-icon">FA</div>
            </div>
            <h2 className="login-v2-brand-title">FA Petroli</h2>
            <p className="login-v2-brand-sub">Portale Clienti B2B</p>
            <div className="login-v2-features">
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Registrazione gratuita in 2 minuti
              </div>
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Approvazione rapida e garantita
              </div>
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Nessun vincolo, nessun abbonamento
              </div>
            </div>
          </div>
          <div className="login-v2-circle login-v2-circle-1" />
          <div className="login-v2-circle login-v2-circle-2" />
          <div className="login-v2-circle login-v2-circle-3" />
        </div>

        {/* Right side - Form */}
        <div className="login-v2-right login-v2-right-scroll">
          <div className="login-v2-mobile-brand">
            <div className="login-v2-logo-icon-sm">FA</div>
            <div>
              <div className="login-v2-mobile-title">FA Petroli</div>
              <div className="login-v2-mobile-sub">Portale Clienti B2B</div>
            </div>
          </div>
          <h1 className="login-v2-title">Diventa cliente</h1>
          <p className="login-v2-subtitle">Compila i dati: ti contatteremo entro 24h</p>
          <RegisterForm />
          <div className="login-v2-footer">
            <p>
              Hai già un account? <a href="/login">Accedi →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
