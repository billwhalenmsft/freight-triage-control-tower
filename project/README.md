# Freight Triage Control Tower — Prototype

A working prototype of a **Freight Triage Control Tower**: a single surface where the
operations team can **Queue → Assign → Resolve** post-booking freight emails, review the
**email thread** for each item, and track **ageing + SLA** — all in one app.

Built as a **Power Apps Code App** (React + TypeScript + Fluent UI). This prototype runs on
**sample data** so you can explore it immediately, with no environment or sign-in required.

## What's inside

| Screen | What it does |
|---|---|
| **Control Tower** | Queue / Assigned / Resolved lanes with priority + SLA badges. Assign an owner, resolve, reopen. |
| **Inbox** | All inbound emails, filter by carrier/mode, open the related triage item. |
| **Item detail** | Shipment identifiers (SH#, HBL/AWB/MBL), SLA countdown, and the full email thread inline. |
| **Ageing & SLA** | Open by ageing bucket, SLA breaches by carrier/owner, resolved-within-SLA %, mean time to resolve. |

## Run it locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**. Changes you make (assigning, resolving) are remembered in
your browser so you can demo a full flow.

> Tip: a pre-built version is included in the package's `prototype/` folder — just open it in a
> browser to try it without installing anything.

## How the data works

The app talks to a single data interface (`src/data/`). Today it uses a **mock provider** seeded
with sample emails. To connect it to live data later, that one interface is swapped for a
Dataverse-backed implementation — the rest of the app is unchanged.

## Notes

- Sample carriers, shipment numbers, and emails are **fictional demo data**.
- This is a **prototype** to validate the experience, not a production deployment.

_Prepared for TE Connectivity by Microsoft._
