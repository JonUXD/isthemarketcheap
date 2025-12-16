import React from 'react';
import { Stack, Chip } from '@mui/material';

const CATEGORIES = ['All', 'Crypto', 'ETFs', 'Commodities'];

export default function CategoryFilters({ selected, onChange }) {
    return (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {CATEGORIES.map((category) => (
                <Chip
                    key={category}
                    label={category}
                    clickable
                    color={selected === category ? 'primary' : 'default'}
                    onClick={() => onChange(category)}
                    sx={{ fontWeight: 600 }}
                />
            ))}
        </Stack>
    );
}
