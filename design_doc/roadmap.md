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

### 3. Risk Matrix (The "Smart" Thresholds)
Hard-coded thresholds per asset class instead of a global rule.

| Asset Class | Watch Level | Buy Level | Crisis Level |
| :--- | :--- | :--- | :--- |
| **Bonds/Cash** | -2% | -5% | -10% |
| **World/US Indices** | -5% | -15% | -30% |
| **Tech/Growth** | -15% | -30% | -50% |
| **Crypto** | -30% | -50% | -75% |

## 🛠 Feature Ideas
*   **Portfolio Mode**: Allow user to input their holdings and see the "Cheapness" of their specific portfolio.
*   **Email Alerts**: Send a weekly summary or an alert when an asset hits "Signal" status.
*   **Historical Charting**: Click an asset to see a chart of its Price vs. ATH over time.
