"use client"
import * as React from 'react';
import { Box, Button, Stack } from '@mui/material';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { useRouter } from 'next/navigation';

export default function DashboarPage() {
  const router = useRouter();

  return (
    <Stack direction="column">
      <Stack direction="row" spacing={4}>
        <SummaryCard
          title="Total Inventaris Tetap"
          value="0"
          unit="Aset"
          onClick={() => router.push('/inventaris/aset')}
        />
        <SummaryCard
          title="Total Stok Habis Pakai"
          value="0"
          unit="Item"
          onClick={() => router.push('/inventaris-habis-pakai/stok')}
        />
        <SummaryCard
          title="Total Stok Habis Pakai"
          value="0"
          unit="Item"
          onClick={() => router.push('/inventaris-habis-pakai/stok')}
        />
      </Stack>
    </Stack>
  );
}