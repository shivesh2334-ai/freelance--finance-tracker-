# MedFinance – Consultation Tracker

A Next.js 14 application for tracking medical consultation finances — bill amounts, doctor share, tax deductions, and net receivables.

## Features

- **Medical consultation record tracking** — patient name, ID, bill date, amount
- **Finance calculations** — configurable share percentage, tax deduction, net receivable
- **Multiple statuses** — Pending, Received, Partial
- **CSV export** — ready for Google Sheets
- **Print / Invoice view** — printable consultation receipt
- **Search & filter** — by patient name/ID and status
- **Local storage persistence** — no backend required
- **Share records** — native share API or clipboard copy

## Tech Stack

- [Next.js 14](https://nextjs.org/) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- React 18

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shivesh2334-ai/freelance--finance-tracker-)

The project includes a `vercel.json` configuration file. Simply connect the repository to Vercel and it will deploy automatically.

## Project Structure

```
freelance--finance-tracker-/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main page (state management)
│   └── globals.css      # Global styles & print styles
├── components/
│   ├── Sidebar.tsx      # Navigation sidebar + CSV export
│   ├── Header.tsx       # Page header with print button
│   ├── Dashboard.tsx    # Stats overview + recent records
│   ├── AddForm.tsx      # Add / edit consultation form
│   ├── RecordsList.tsx  # Filterable records table
│   ├── InvoiceView.tsx  # Printable invoice / receipt
│   └── common/
│       ├── Field.tsx
│       ├── FieldSelect.tsx
│       ├── CalcRow.tsx
│       ├── InvoiceRow.tsx
│       ├── ActionBtn.tsx
│       ├── StatCard.tsx
│       └── Toast.tsx
├── lib/
│   ├── storage.ts       # localStorage helpers
│   ├── calculations.ts  # Finance calculation utilities
│   └── constants.ts     # Shared constants
├── types/
│   └── index.ts         # TypeScript types
├── .env.local.example   # Environment variable template
├── next.config.js
├── tsconfig.json
├── package.json
└── vercel.json
```

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

## License

MIT
