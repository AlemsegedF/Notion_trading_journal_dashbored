# Notion Trading Journal Dashboard

A professional trading journal dashboard that connects to your Notion database and displays real-time trading analytics with beautiful charts and statistics.

## Features
- 📊 Real-time data from your Notion trading database
- 📈 Interactive charts (equity curve, P&L per trade, by pair/setup)
- 🎯 Win rate and expectancy calculations
- 💱 Analysis by currency pair, setup type, and trading session
- 🔄 Auto-syncing with Notion database

## Setup Instructions

### 1. Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "Create new integration"
3. Name it "Trading Dashboard"
4. Copy the **Internal Integration Token** (starts with `ntn_`)
5. Go to your Trading database and click the "..." menu → "Connections" → Add your integration

### 2. Get Your Database ID

1. Open your Notion Trading database
2. The URL format is: `https://notion.so/{workspace}/{DATABASE_ID}?v=...`
3. Copy the long string between `/` and `?` - that's your **DATABASE_ID**

### 3. Set Environment Variables

Create a `.env.local` file in the project root:

```env
NOTION_TOKEN=ntn_YOUR_INTEGRATION_TOKEN_HERE
NOTION_DATABASE_ID=your_database_id_here
```

### 4. Notion Database Structure

Your Notion database should have these columns:
- **Date** (Date type)
- **Pair** (Text/Title) - e.g., "EUR/USD"
- **Session** (Select) - Options: "London", "NY", "Asia", etc.
- **Setup** (Select) - e.g., "FVG Entry", "Order Block", "Liquidity Sweep"
- **Outcome** (Select) - Options: "Win", "Loss", "Breakeven"
- **P&L** (Number) - Profit/loss amount
- **R** (Number) - Risk-adjusted return
- **Risk** (Number) - Risk amount
- **SOP OK** (Checkbox) - Standard Operating Procedure followed
- **Execution** (Number) - Execution quality (1-10)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Building

```bash
npm run build
npm run start
```

## Deployment on Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Project Settings:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
4. Deploy!

Every push to `main` branch auto-deploys to Vercel.

## Tech Stack

- **Next.js 14** - React framework
- **Recharts** - Chart library
- **Notion API** - Data source
- **Vercel** - Hosting

## License

MIT
