"use client";

import { useState } from "react";

import {
  Stack,
  MenuItem,
  Menu,
  Avatar,
  Typography,
  Button,
} from "@mui/material";

const account = {
  id: 1,
  name: "Bharat Kashyap",
  role: "Admin",
  image: "https://avatars.githubusercontent.com/u/19550456",
  projects: [
    {
      id: 3,
      title: "Project X",
    },
  ],
};

export function Account() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Stack direction="row" display="flex" spacing={2} alignItems="center">
          <Avatar alt={account.name} src={account.image} />
          <Stack direction="column">
            <Typography component="span" variant="body1" fontWeight={600} textAlign="left">
              {account.name}
            </Typography>
            <Typography component="span" variant="caption" fontWeight={400} textAlign="left">
              {account.role}
            </Typography>
          </Stack>
        </Stack>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  );
}
