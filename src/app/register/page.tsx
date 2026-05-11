import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F1E37] via-[#15243d] to-[#1A3A5C] p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden bg-white shadow-2xl">
        {/* Lato sinistro */}
        <div className="hidden lg:flex relative flex-col justify-between p-10 bg-gradient-to-br from-[#0F1E37] to-[#1A3A5C] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-white p-1.5 shadow-lg mb-12">
              <img src="/logo.jpg" alt="FA Petroli" className="w-full h-full object-contain rounded-md" />
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight mb-3">
              Diventa cliente
            </h1>
            <p className="text-sm uppercase tracking-[3px] text-white/60 mb-12">
              Registrazione gratuita
            </p>
            <div className="space-y-4">
              {[
                "Registrazione in 2 minuti",
                "Approvazione rapida (entro 24h)",
                "Nessun vincolo né abbonamento",
                "Listino prezzi sempre aggiornato",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-white/85">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 text-xs text-white/40">
            © {new Date().getFullYear()} FA Petroli srl
          </div>
        </div>

        {/* Lato destro */}
        <div className="p-8 sm:p-10 max-h-[95vh] overflow-y-auto">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white p-1 ring-1 ring-border">
              <img src="/logo.jpg" alt="FA Petroli" className="w-full h-full object-contain rounded-md" />
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-brand-blue leading-none">FA Petroli</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Portale Clienti</div>
            </div>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-brand-blue mb-2">
            Compila i tuoi dati
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Ti contatteremo entro 24 ore lavorative per confermare l'attivazione.
          </p>

          <RegisterForm />

          <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link href="/login" className="font-semibold text-brand-orange hover:underline">
              Accedi →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
