# DOOH Ad Log PDF Generator

A web application for generating Digital Out-of-Home (DOOH) advertisement log PDFs.

## Features

- Fill in campaign details with a simple form
- Automatically generate ad log schedules with configurable gaps
- Download as PDF immediately
- Responsive design
- Deployed on Vercel

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Vercel auto-detects Next.js and deploys automatically
5. Your app is live!

## Project Structure

```
adlog-web/
├── app/
│   ├── api/
│   │   └── generate-pdf/
│   │       └── route.ts       # PDF generation API
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main form page
│   ├── globals.css             # Global styles
│   └── page.module.css         # Page-specific styles
├── public/                      # Static assets
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
└── vercel.json                 # Vercel config
```

## Technologies

- **Framework**: Next.js 14
- **Language**: TypeScript
- **PDF Generation**: pdfkit
- **Styling**: CSS Modules
- **Deployment**: Vercel
