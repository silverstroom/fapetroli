import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="login-v2-wrapper">
      <div className="login-v2-card">
        {/* Left side - Branded panel */}
        <div className="login-v2-left">
          <div className="login-v2-dots" />
          <div className="login-v2-left-content">
            <div className="login-v2-logo">
              <div className="login-v2-logo-icon has-logo">
                <img src="/logo.jpg" alt="FA Petroli" />
              </div>
            </div>
            <h2 className="login-v2-brand-title">FA Petroli</h2>
            <p className="login-v2-brand-sub">Portale Clienti B2B</p>
            <div className="login-v2-features">
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Ordina carburanti 24/7
              </div>
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Monitora le consegne in tempo reale
              </div>
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Storico ordini sempre disponibile
              </div>
              <div className="login-v2-feature">
                <span className="login-v2-feature-dot" />
                Gestisci il profilo aziendale
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="login-v2-circle login-v2-circle-1" />
          <div className="login-v2-circle login-v2-circle-2" />
          <div className="login-v2-circle login-v2-circle-3" />
        </div>

        {/* Right side - Form */}
        <div className="login-v2-right">
          <div className="login-v2-mobile-brand">
            <div className="login-v2-logo-icon-sm has-logo">
              <img src="/logo.jpg" alt="FA Petroli" />
            </div>
            <div>
              <div className="login-v2-mobile-title">FA Petroli</div>
              <div className="login-v2-mobile-sub">Portale Clienti B2B</div>
            </div>
          </div>
          <h1 className="login-v2-title">Bentornato</h1>
          <p className="login-v2-subtitle">Accedi al tuo account aziendale</p>
          <LoginForm />
          <div className="login-v2-footer">
            <p>
              Non sei ancora cliente?{" "}
              <a href="/register">Richiedi l&apos;attivazione →</a>
            </p>
            <p className="login-v2-contact">
              Problemi di accesso? Contatta FA Petroli
              <br />
              📞 <a href="tel:0968453815">0968-453815</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
