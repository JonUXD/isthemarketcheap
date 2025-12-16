import { intervalToDuration } from 'date-fns';

/**
 * Calculate status based on percent below ATH
 */
export function calculateStatus(percentBelow) {
    if (percentBelow > 20) {
        return { label: 'WATCH', color: 'secondary', textColor: '#fff' };
    } else if (percentBelow > 5) {
        return { label: 'WATCH', color: 'default', textColor: '#fff' };
    }
    return { label: '', color: 'default', textColor: '#666' };
}

/**
 * Process assets: add calculated fields (percentBelow, status)
 */
export function enrichAssets(assets) {
    return assets.map(asset => {
        const percentBelow = ((asset.ath - asset.currentPrice) / asset.ath) * 100;
        const status = calculateStatus(percentBelow);
        return { ...asset, percentBelow, status };
    });
}

/**
 * Filter assets by category
 */
export function filterByCategory(assets, category) {
    if (category === 'All') return assets;

    if (category === 'Crypto') {
        return assets.filter(a => a.sector === 'Crypto');
    } else if (category === 'ETFs') {
        return assets.filter(a => a.category === 'ETF' && a.sector !== 'Crypto');
    } else if (category === 'Commodities') {
        return assets.filter(a => a.category === 'Commodity' || a.category === 'Commodity ETF');
    }

    return assets;
}

/**
 * Filter assets by search term
 */
export function filterBySearch(assets, searchTerm) {
    if (!searchTerm) return assets;

    const lowerTerm = searchTerm.toLowerCase();
    return assets.filter(a =>
        a.name.toLowerCase().includes(lowerTerm) ||
        a.label.toLowerCase().includes(lowerTerm) ||
        (a.friendlyName && a.friendlyName.toLowerCase().includes(lowerTerm))
    );
}

/**
 * Sort assets by key and direction
 */
export function sortAssets(assets, sortConfig) {
    const sorted = [...assets];
    sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    return sorted;
}

/**
 * Process assets through all filters and sorting
 */
export function processAssets(assets, searchTerm, category, sortConfig) {
    let processed = enrichAssets(assets);
    processed = filterByCategory(processed, category);
    processed = filterBySearch(processed, searchTerm);
    processed = sortAssets(processed, sortConfig);
    return processed;
}

/**
 * Format date as relative time (e.g., "2y 3mo ago")
 */
export function formatRelativeTime(dateStr) {
    if (!dateStr) return '-';
    const start = new Date(dateStr);
    const end = new Date();

    if (isNaN(start.getTime())) return '-';
    if (start > end) return 'Just now';

    try {
        const duration = intervalToDuration({ start, end });

        if (duration.years > 0) {
            return `${duration.years}y ${duration.months > 0 ? duration.months + 'mo' : ''} ago`;
        }
        if (duration.months > 0) {
            return `${duration.months}mo ${duration.days > 0 ? duration.days + 'd' : ''} ago`;
        }
        if (duration.days > 0) {
            return `${duration.days}d ${duration.hours > 0 ? duration.hours + 'h' : ''} ago`;
        }
        if (duration.hours > 0) {
            return `${duration.hours}h ago`;
        }
        if (duration.minutes > 0) {
            return `${duration.minutes}m ago`;
        }
        return 'Just now';
    } catch (e) {
        console.error("Date formatting error", e);
        return '-';
    }
}
