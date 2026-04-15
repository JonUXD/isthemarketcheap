# FEATURE: User Favorites (My Wallet)

## Goal
Allow users to mark specific assets as "favorites" so they can track their personal portfolio (wallet) at the top of the dashboard.

## Technical Approach: localStorage
- **Storage**: Use the browser's `localStorage` API to store an array of asset names (e.g., `['SPY', 'BTC']`).
- **Persistence**: Data remains on the user's device even after closing the browser or refreshing the page.
- **Privacy**: No server-side storage or user accounts; the data is 100% local to the user.

## User Experience (UX)
1. **The Star Icon**: Add a star icon to each row in the `AssetTable`.
2. **"Favorites Only" Toggle**: A new filter chip at the top to toggle between "Show All" and "My Wallet".
3. **Smart Sorting**: When in "All" view, favorited assets should automatically float to the top of the list.

## Logic Implementation
- A React `useEffect` hook will load the favorites from memory on page load.
- A state variable `favorites` will track the current list.
- The filtering/sorting logic in `AssetTable.js` will be updated to prioritize these favorites.
