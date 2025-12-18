# Project Roadmap & Future Ideas

This document tracks feature ideas, architectural improvements, and complex enhancements that are planned for the future but not yet implemented.

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
