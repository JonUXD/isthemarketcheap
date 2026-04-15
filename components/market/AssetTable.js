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
            sx={{ borderRadius: 2, overflowX: 'auto', border: 1, borderColor: 'divider' }}
        >
            <Table sx={{ minWidth: { xs: 'auto', sm: 650 } }} aria-label="asset table">
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
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Asset Name</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Category</TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <TableSortLabel
                                active={sortConfig.key === 'currentPrice'}
                                direction={sortConfig.key === 'currentPrice' ? sortConfig.direction : 'asc'}
                                onClick={() => handleSort('currentPrice')}
                            >
                                Price
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Price Date</TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>All-Time High</TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>ATH Date</TableCell>
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
                                <TableCell
                                    component="th"
                                    scope="row"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        maxWidth: { xs: 110, sm: 'none' },
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {asset.friendlyName}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
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
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{asset.category}</TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.95rem', display: { xs: 'none', sm: 'table-cell' } }}>
                                    ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace', display: { xs: 'none', sm: 'table-cell' } }}
                                    title={asset.currentPriceDate ? format(new Date(asset.currentPriceDate), 'yyyy-MM-dd') : ''}
                                >
                                    {priceDate}
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.95rem', display: { xs: 'none', sm: 'table-cell' } }}>
                                    ${asset.ath.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace', display: { xs: 'none', sm: 'table-cell' } }}
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