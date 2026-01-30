# 📄 Invoice Generator

A **premium, mobile-first invoice generator** built for small e-commerce business owners. Create beautiful, professional invoices in seconds using just your phone.

![Invoice Generator](https://via.placeholder.com/800x400/3259E8/FFFFFF?text=Invoice+Generator)

## ✨ Features

- **📱 Mobile-First Design** - Optimized for one-hand use on phones
- **🎨 Premium PDF Output** - Elegant, professional invoices
- **⚡ Fast & Simple** - Minimal typing, large touch targets
- **🏢 Company Branding** - Upload your logo and company details
- **📦 Product Catalog** - Save products for quick invoice creation
- **💰 Auto Calculations** - Subtotals, delivery fees, grand totals
- **📤 Easy Sharing** - Download or share directly via WhatsApp
- **☁️ Cloud Sync** - Data saved to Supabase (PostgreSQL)

## 🛠️ Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Frontend       | Next.js 14 (App Router)         |
| Styling        | Tailwind CSS                    |
| PDF Generation | @react-pdf/renderer             |
| Backend        | Supabase (PostgreSQL)           |
| Database       | Docker (local) / Supabase Cloud |
| State          | React Hooks                     |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Database (Docker)

For development, you can run Supabase locally:

```bash
docker-compose up -d
```

This starts:

- PostgreSQL database (port 54322)
- Supabase API (port 54321)
- Supabase Studio (port 54323)

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

For local development, you can leave defaults or configure your Supabase Cloud credentials.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or use browser dev tools in mobile mode.

## 📱 Usage Guide

### First Time Setup

1. **Tap the gear icon ⚙️** in the top-right corner
2. **Add your company details:**
   - Upload your logo
   - Enter company name, address, phone
   - Set your currency
3. **Switch to Products tab:**
   - Add your products/services
   - Set prices for each item
4. **Save and close settings**

### Creating an Invoice

1. **Enter customer information:**
   - Customer name (required)
   - Address and phone (optional)

2. **Add items:**
   - Tap "Add Item" button
   - Select a product from your catalog
   - Adjust quantity
   - Repeat for more items

3. **Add delivery fee** (if applicable)

4. **Tap "Generate Invoice"**
   - Review the invoice details
   - Download PDF or share via WhatsApp

## 🗄️ Database Schema

```sql
-- Company settings (single row per user)
company_settings
├── id (UUID)
├── company_name
├── company_address
├── phone_number
├── logo_url
├── footer_note
├── currency_symbol
└── timestamps

-- Product catalog
products
├── id (UUID)
├── name
├── unit_price
├── description
├── is_active
└── timestamps

-- Invoices
invoices
├── id (UUID)
├── invoice_number (auto-generated)
├── invoice_date
├── customer_name/address/phone
├── company snapshot
├── subtotal
├── delivery_fee
├── total_amount
├── status
└── timestamps

-- Invoice line items
invoice_items
├── id (UUID)
├── invoice_id (FK)
├── product_id (FK)
├── item_name
├── unit_price
├── quantity
├── line_total
└── sort_order
```

## 📂 Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + custom styles
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main invoice creation page
│
├── components/
│   ├── ui/
│   │   ├── BottomSheet.tsx      # Mobile bottom sheet modal
│   │   ├── LoadingSpinner.tsx   # Loading states
│   │   ├── QuantityStepper.tsx  # +/- quantity control
│   │   └── Toast.tsx            # Notification toasts
│   │
│   ├── settings/
│   │   ├── SettingsSheet.tsx        # Settings container
│   │   ├── CompanySettingsForm.tsx  # Company info form
│   │   └── ProductsManager.tsx      # Product CRUD
│   │
│   ├── invoice/
│   │   ├── ProductPicker.tsx    # Product selection
│   │   ├── InvoiceItemRow.tsx   # Item row with controls
│   │   └── InvoiceTotals.tsx    # Totals display
│   │
│   └── pdf/
│       ├── InvoicePDF.tsx       # PDF template (react-pdf)
│       └── PDFGenerator.tsx     # Download/share logic
│
├── lib/
│   └── supabase.ts      # Database client + API
│
└── types/
    └── index.ts         # TypeScript interfaces
```

## 🎨 Design Principles

### Mobile-First UX

- **Large touch targets** (min 48x48px)
- **Bottom sheets** instead of modals
- **One-hand operation** friendly
- **Minimal typing** - tap to select products

### Premium Visual Design

- **Clean typography** with Inter font
- **Generous whitespace**
- **Soft shadows** for depth
- **Subtle animations** for feedback
- **Consistent color palette**

### PDF Quality

- **Professional layout** with proper hierarchy
- **Custom typography** with web fonts
- **Brand colors** and logo placement
- **Clear line items** table
- **Elegant footer** with thank you note

## 🔧 Customization

### Colors

Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    600: '#3259E8', // Main brand color
    // ...
  }
}
```

### Currency

Change default currency in Settings > Currency Symbol

### PDF Template

Modify `src/components/pdf/InvoicePDF.tsx` to customize:

- Layout structure
- Typography sizes
- Colors and branding
- Footer content

## 📦 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ for small business owners
