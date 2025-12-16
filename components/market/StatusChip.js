import React from 'react';
import { Chip } from '@mui/material';

export default function StatusChip({ status }) {
    if (!status || !status.label) {
        return null;
    }

    return (
        <Chip
            label={status.label}
            color={status.color}
            variant={status.color === 'default' ? 'outlined' : 'filled'}
            size="small"
            sx={{
                minWidth: 70,
                fontWeight: 'bold',
                color: status.textColor,
                borderColor: status.color === 'default' ? 'divider' : undefined
            }}
        />
    );
}
