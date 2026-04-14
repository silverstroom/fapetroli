# FA Petroli — Portale Clienti B2B

Portale ordini B2B per FA Petroli. Next.js + Prisma + Vercel Postgres.

---

## 🚀 Deploy: GitHub → Vercel (3 step)

### STEP 1 — Carica su GitHub

1. Vai su [github.com/new](https://github.com/new)
2. Nome repo: `fapetroli-portal`, privato, **non** aggiungere README/gitignore
3. Clicca **Create repository**
4. Nella pagina del repo vuoto, clicca **"uploading an existing file"**
5. Trascina dentro **tutti i file** della cartella `fapetroli-portal/` (non la cartella stessa, ma il contenuto)
6. Commit message: `Initial commit` → clicca **Commit changes**

> **Alternativa con Git CLI** (se lo hai installato):
> ```bash
> cd fapetroli-portal
> git init
> git add .
> git commit -m "Initial commit"
> git remote add origin https://github.com/TUO-USER/fapetroli-portal.git
> git branch -M main
> git push -u origin main
> ```

### STEP 2 — Crea progetto Vercel + Database

1. Vai su [vercel.com](https://vercel.com) e accedi con GitHub
2. Clicca **"Add New Project"** → importa `fapetroli-portal`
3. **Prima di cliccare Deploy**, aggiungi le **Environment Variables**:

   | Nome | Valore |
   |------|--------|
   | `AUTH_SECRET` | Una stringa random lunga (genera con `openssl rand -base64 32`) |
   | `ADMIN_EMAIL` | `admin@fapetroli.it` |
   | `ADMIN_PASSWORD` | La password che vuoi per l'admin |
   | `ADMIN_NAME` | `Amministratore FA Petroli` |

4. Clicca **Deploy** (il primo build fallirà perché manca il DB — è normale)

5. Ora aggiungi il database:
   - Dalla dashboard del progetto vai su **Storage** → **Create Database**
   - Scegli **Postgres** → **Create**
   - Vercel crea automaticamente le variabili `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLED`, ecc.
   - Torna su **Settings → Environment Variables** per verificare che ci siano

6. Clicca **Deployments** → sul deploy fallito clicca **⋯** → **Redeploy**

### STEP 3 — Inizializza il database

Il database è vuoto: devi creare le tabelle e l'utente admin.
Dalla [Vercel CLI](https://vercel.com/docs/cli) o da locale:

```bash
# Installa la CLI di Vercel (una volta sola)
npm i -g vercel

# Collegati al progetto
vercel link

# Scarica le env vars di produzione in locale
vercel env pull .env.local

# Installa dipendenze
npm install

# Crea le tabelle nel database
npx prisma db push

# Crea l'admin e il catalogo prodotti
npm run db:seed
```

**Fatto!** Vai sul tuo sito `https://fapetroli-portal.vercel.app` e accedi con le credenziali admin.

---

## ✨ Funzionalità

### Area Cliente
- 🔐 Login con email + password
- 📝 Registrazione self-service (account resta `PENDING` fino all'approvazione admin)
- 🏠 Dashboard con KPI (ordini del mese, litri annui, ordini evasi)
- 📦 Nuovo ordine con wizard a 4 step
- 📋 Storico ordini filtrabile
- 🏢 Profilo azienda + cambio password

### Area Admin
- 📊 Dashboard globale
- 👥 Gestione clienti: approva, sospendi, riattiva, elimina
- 📦 Ordini: cambio stato inline
- ⛽ Catalogo prodotti: CRUD completo
- 📍 Punti di consegna: CRUD per cliente

---

## 🛠 Stack

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| ORM | Prisma 5 |
| Database | Vercel Postgres |
| Auth | NextAuth v5 (Auth.js) — JWT |
| Validazione | Zod |
| Password | bcryptjs (12 rounds) |
| Styling | CSS custom (no Tailwind) |

---

## 🧪 Test dopo il deploy

1. Vai su `/login` → accedi con le credenziali admin
2. Admin → **Punti Consegna**: dovrai creare almeno un punto per un cliente
3. Apri una finestra anonima → `/register` → crea un cliente test
4. Torna sull'admin → **Clienti** → clicca "✓ Approva"
5. Finestra anonima: login col cliente → crea un ordine
6. Admin → **Tutti gli Ordini** → cambia stato

---

## 📝 Personalizzazione

- **Colori**: modifica le CSS variables in `src/app/globals.css`
- **Logo**: sostituisci il quadrato "FA" in `Sidebar.tsx` e nelle pagine login/register
- **Email**: in `api/orders/route.ts` puoi agganciare Resend o SendGrid
- **Nuovi campi**: estendi i modelli in `prisma/schema.prisma`, poi `npx prisma db push`

---

## 🆘 Problemi comuni

| Problema | Soluzione |
|---|---|
| Build fallisce su Vercel | Controlla che il database sia collegato (Storage → Postgres) |
| Login non funziona | Verifica di aver fatto `npm run db:seed` |
| Cliente non può accedere | Status `PENDING` — approvalo dal pannello admin |
| Errore `AUTH_SECRET` | Aggiungilo nelle env vars di Vercel |

---

## 📄 Licenza

Codice realizzato per FA Petroli. Tutti i diritti riservati.
