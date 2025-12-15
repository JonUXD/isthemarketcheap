# Project Roadmap & Future Ideas

This document tracks feature ideas, architectural improvements, and complex enhancements that are planned for the future but not yet implemented.

## 🧠 Smart Status Logic (The "Hedge Fund" Upgrade)
Currently, the app uses a static percentage drop (e.g., >20% = Signal) to determine status. This is a blunt instrument.
**Goal:** Implement a context-aware system that understands that a -20% drop in S&P 500 is a crisis, while a -20% drop in Bitcoin is normal noise.

### 1. Volatility Column & Filter
**Calculation**: Annualized Standard Deviation of daily returns over the last 90 days.
*   **The Feature**: Add a new column "Volatility" with simple tags:
    *   **LOW** (e.g., Bonds)
    *   **MED** (e.g., S&P 500)
    *   **HIGH** (e.g., Crypto)
*   **The Filter**: Allow users to filter the table by these tags (e.g., "Show me only HIGH volatility assets").
*   **Note**: This does **NOT** change the "Status" or "% Below ATH" logic. It is purely an additional data point for the user.

### 2. Velocity Signal (The Crash Detector)
Measure the *speed* of the drop.
*   **Scenario**: A -20% drop over 2 years is a "Bear Market" (Grind). A -20% drop in 2 weeks is a "Panic" (Opportunity).
*   **Status**:
    *   **PANIC**: High velocity drop.
    *   **GRIND**: Low velocity drop.

### 3. ATH Time Horizon Selector
**Goal**: Allow users to toggle between "All-Time High", "10-Year High", and "5-Year High".
*   **The Problem**: Comparing Bitcoin (born 2009) to Gold (trading for centuries) on "All-Time" can be misleading.
*   **The Solution**: A toggle in the UI.
*   **Technical Note**: This requires updating the data structure to store multiple ATH values (e.g., `ath_max`, `ath_10y`, `ath_5y`) instead of just one.

## 📖 Methodology & Trust (New Page)
**Goal**: Build trust by being transparent about data sources and the creator.
*   **"How it Works"**: Explain the "Discount Logic" (e.g., why -20% is a signal).
*   **Data Providers**: Explicitly list sources (Yahoo Finance for Stocks/ETFs, CoinGecko for Crypto) to prove data quality.
*   **About Me**: A personal section with a biography and LinkedIn link to humanize the project.

## 🎨 UI/UX & Branding
*   **[COMPLETED] Theme Selector**: Add a Light/Dark mode toggle (currently Dark Mode only).
*   **[COMPLETED] Visual Identity**: Developed a unique color palette and "personality" (Cyber-Finance).
*   **Branding**: Brainstorm a proper name and logo (currently "Is the Market Cheap?").

## 🏗️ Architecture & Code Quality
*   **Component Refactoring**: Break down the monolithic `pages/index.js` into smaller, reusable components (e.g., `AssetTable`, `FilterBar`, `StatusChip`).
*   **TypeScript Migration**: Move from JavaScript to TypeScript for better type safety as the project grows.

## 🛠 Feature Ideas
*   **Volatility Column & Filter**: (As described above).
*   **Portfolio Mode**: Allow user to input their holdings and see the "Cheapness" of their specific portfolio.
*   **Email Alerts**: Send a weekly summary or an alert when an asset hits "Signal" status.
*   **Historical Charting**: Click an asset to see a chart of its Price vs. ATH over time.
