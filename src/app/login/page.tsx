import LoginForm from "./LoginForm";
import { BorderBeam } from "@/components/ui/border-beam";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F1E37] via-[#15243d] to-[#1A3A5C] p-4 sm:p-6 font-sans">
      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden bg-white shadow-2xl">
        <BorderBeam size={260} duration={12} colorFrom="#F07E10" colorTo="#1A3A5C" />

        {/* Lato sinistro: brand */}
        <div className="hidden lg:flex relative flex-col justify-between p-10 bg-gradient-to-br from-[#0F1E37] to-[#1A3A5C] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-brand-orange/20 blur-3xl" />
          <div className="absolute top-10 -left-16 w-72 h-72 rounded-full bg-brand-orange/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 shadow-lg">
                <img src="/logo.jpg" alt="FA Petroli" className="w-full h-full object-contain rounded-md" />
              </div>
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight mb-3">
              FA Petroli
            </h1>
            <p className="text-sm uppercase tracking-[3px] text-white/60 mb-12">
              Portale Clienti B2B
            </p>

            <div className="space-y-4">
              {[
                "Ordina carburanti 24/7",
                "Monitora le consegne in tempo reale",
                "Storico ordini sempre disponibile",
                "Gestisci il profilo aziendale",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-white/85">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/40">
            © {new Date().getFullYear()} FA Petroli srl · Tutti i diritti riservati
          </div>
        </div>

        {/* Lato destro: form */}
        <div className="relative p-8 sm:p-12 flex flex-col justify-center">
          {/* Brand mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white p-1 ring-1 ring-border">
              <img src="/logo.jpg" alt="FA Petroli" className="w-full h-full object-contain rounded-md" />
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-brand-blue leading-none">FA Petroli</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Portale Clienti</div>
            </div>
          </div>

          <h2 className="font-display text-4xl font-extrabold text-brand-blue mb-2">
            Bentornato
          </h2>
          <p className="text-muted-foreground mb-8">
            Accedi al tuo account aziendale per inviare richieste e consultare il listino.
          </p>

          <LoginForm />

          <div className="mt-8 pt-6 border-t border-border space-y-3 text-sm">
            <p className="text-muted-foreground">
              Non sei ancora cliente?{" "}
              <Link href="/register" className="font-semibold text-brand-orange hover:underline inline-flex items-center gap-1">
                Richiedi l'attivazione <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 flex-wrap">
              Problemi di accesso? Contatta FA Petroli{" "}
              <a href="tel:0968453815" className="font-semibold text-brand-blue hover:text-brand-orange inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                0968-453815
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
