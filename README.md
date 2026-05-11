# AlphaPulse: Solana Smart Money Tracker

AlphaPulse is a high-fidelity terminal designed to track real-time smart money movements and market intelligence across the Solana ecosystem. Built for the Frontier Hackathon, it leverages the Birdeye API to provide institutional-grade data visualization and whale tracking in a responsive, cyber-financial interface.

## Core Features

Market Pulse Terminal
Real-time monitoring of the top 10 Solana tokens by 24-hour volume. The dashboard tracks live price action, 1-hour and 24-hour price changes, and total market capitalization.

Whale Tracker
Live monitoring of high-value transactions for major Solana tokens. The system detects large-scale movements (Whales) and alerts the user to significant buy or sell pressure.

Signal Intelligence
Dynamic Signal Score gauge that calculates market sentiment based on 24-hour buy/sell ratios. This allows users to visualize whether a token is under accumulation or distribution.

Token Security & Analytics
Deep-dive drawer for every token featuring 24-hour price action charts, top trader activity summaries, and comprehensive security audits (mint authority, freeze authority, and holder concentration).

Smart Money Alerts
Automated toast notifications for significant price surges or drops, helping users identify alpha before the broader market reacts.

## Technical Stack

Frontend: React 18, Vite
Styling: Vanilla CSS, Tailwind CSS (for utility layouts)
Animations: Framer Motion (physics-based interactions and motion-first UI)
Data: Birdeye API (Primary), DexScreener API (Secondary Fallback)
Wallet: Solana Wallet Adapter (Phantom, Solflare)

## Birdeye Integration

AlphaPulse is designed to showcase the full power of Birdeye Data Intelligence. The application integrates six distinct Birdeye endpoints:
1. Token List: Powering the main ecosystem leaderboard.
2. Token Overview: Providing price, volume, and transaction counts.
3. OHLCV Candles: Rendering the 24-hour price action charts.
4. Top Traders: Summarizing whale activity.
5. Token Security: Fetching on-chain security metrics and trust scores.
6. Trending Tokens: Identifying high-velocity assets in real-time.

Architecture Note: The Birdeye API key is intentionally exposed client-side for the ease of this hackathon demo. In a production environment, all Birdeye fetches would be routed through a secure backend proxy to protect the API credentials.

## Getting Started

1. Install dependencies:
npm install

2. Create a .env file in the root directory and add your Birdeye API key:
VITE_BIRDEYE_API_KEY=your_key_here

3. Start the development server:
npm run dev

4. Build for production:
npm run build

## Usage Guide

Market View
The primary view displays a heatmap of the Solana ecosystem. Click on any token row to expand the detail drawer.

Detail Drawer
In the drawer, you can analyze the 24-hour price chart and check the Signal Score. The "Top Traders" section summarizes current market participants, while "Token Security" provides an immediate risk assessment.

Whale Tracker
Switch to the Whale Tracker tab to monitor large on-chain moves for SOL, JUP, and other major assets in real-time.

Pulse Effect
The central AlphaPulse orb reacts dynamically to market volatility. A high-frequency pulse indicates a volatile, high-opportunity market environment.
