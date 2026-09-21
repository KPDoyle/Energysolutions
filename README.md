# Stratford Energy Response

A brand-led corrective-action and field-service platform for Stratford Energy. It coordinates national equipment replacement and warranty programmes from affected-asset intake through customer contact, installer allocation, field evidence, equipment returns, review and verified close-out.

## Product capabilities

- Programme and affected-population management
- Work-order scheduling and field work packs
- Customer contact and appointment milestones
- Approved installer capacity and accreditation controls
- Evidence upload, completion gates and reviewer sign-off
- Equipment return chain of custody
- Service-level and regional risk control tower
- Manufacturer reports and CSV export
- Bulk CSV intake, audit records, backup and restore
- Responsive field interface

## Run locally

```bash
corepack pnpm install
corepack pnpm dev
```

## Build

```bash
corepack pnpm build
```

The app is statically exported for Vercel. Demonstration records persist in the browser, and uploaded evidence files use IndexedDB.
