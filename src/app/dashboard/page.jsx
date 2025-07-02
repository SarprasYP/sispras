import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';

export default function InventoryPage() {
  return (
    <Box >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Inventory
      </Typography>
      <Button variant="contained">Add New Item</Button>
      {/* You will add your inventory table here */}
    </Box>
  );
}