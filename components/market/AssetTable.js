import React from 'react';
import { format } from 'date-fns';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Link,
    TableSortLabel,
} from '@mui/material';
import StatusChip from './StatusChip';
import { formatRelativeTime } from '../../lib/assetHelpers';

export default function AssetTable({ assets, sortConfig, onSort }) {
    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        onSort({ key, direction });
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}
        >
            <Table sx={{ minWidth: 650 }} aria-label="asset table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={sortConfig.key === 'friendlyName'}
                                direction={sortConfig.key === 'friendlyName' ? sortConfig.direction : 'asc'}
                                onClick={() => handleSort('friendlyName')}
                            >
                                Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Asset Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={sortConfig.key === 'currentPrice'}
                                direction={sortConfig.key === 'currentPrice' ? sortConfig.direction : 'asc'}
                                onClick={() => handleSort('currentPrice')}
                            >
                                Price
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Price Date</TableCell>
                        <TableCell align="right">All-Time High</TableCell>
                        <TableCell align="right">ATH Date</TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={sortConfig.key === 'percentBelow'}
                                direction={sortConfig.key === 'percentBelow' ? sortConfig.direction : 'asc'}
                                onClick={() => handleSort('percentBelow')}
                            >
                                % Below ATH
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {assets.map((asset) => {
                        const priceDate = formatRelativeTime(asset.currentPriceDate);
                        const athDate = formatRelativeTime(asset.athDate);

                        return (
                            <TableRow
                                key={asset.name}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                    {asset.friendlyName}
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={asset.link}
                                        target="_blank"
                                        rel="noopener"
                                        color="inherit"
                                        underline="hover"
                                        sx={{ fontSize: '1rem' }}
                                    >
                                        {asset.label} ({asset.name})
                                    </Link>
                                </TableCell>
                                <TableCell>{asset.category}</TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                    ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace' }}
                                    title={asset.currentPriceDate ? format(new Date(asset.currentPriceDate), 'yyyy-MM-dd') : ''}
                                >
                                    {priceDate}
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                    ${asset.ath.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace' }}
                                    title={asset.athDate ? format(new Date(asset.athDate), 'yyyy-MM-dd') : ''}
                                >
                                    {athDate}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'text.primary', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>
                                    {asset.percentBelow > 0.001 ? `-${asset.percentBelow.toFixed(2)}%` : '0.00%'}
                                </TableCell>
                                <TableCell align="center">
                                    <StatusChip status={asset.status} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
