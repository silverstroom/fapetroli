"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    ragioneSociale: "",
    partitaIva: "",
    pec: "",
    indirizzo: "",
    citta: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Errore durante la registrazione.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-3 mb-2 text-emerald-700 font-bold">
          <CheckCircle2 className="h-6 w-6" /> Richiesta inviata!
        </div>
        <p className="text-sm text-emerald-900/80 leading-relaxed">
          La tua richiesta è stata ricevuta. FA Petroli verificherà i dati e
          attiverà il tuo account entro 24 ore lavorative. Riceverai una email
          di conferma all'indirizzo <strong>{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono *</Label>
          <Input
            id="phone"
            type="tel"
            required
            placeholder="333 1234567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email aziendale *</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password (min 8 caratteri) *</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </div>

      <div className="pt-3 mt-3 border-t border-border">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Dati aziendali
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="space-y-2">
            <Label htmlFor="ragioneSociale">Ragione sociale *</Label>
            <Input
              id="ragioneSociale"
              required
              value={form.ragioneSociale}
              onChange={(e) => update("ragioneSociale", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partitaIva">Partita IVA *</Label>
            <Input
              id="partitaIva"
              required
              value={form.partitaIva}
              onChange={(e) => update("partitaIva", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2 mb-5">
          <Label htmlFor="pec">PEC</Label>
          <Input
            id="pec"
            type="email"
            value={form.pec}
            onChange={(e) => update("pec", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="indirizzo">Indirizzo</Label>
            <Input
              id="indirizzo"
              value={form.indirizzo}
              onChange={(e) => update("indirizzo", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="citta">Città</Label>
            <Input
              id="citta"
              value={form.citta}
              onChange={(e) => update("citta", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={loading} className="w-full">
        {loading ? "Invio in corso…" : "Richiedi attivazione"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
