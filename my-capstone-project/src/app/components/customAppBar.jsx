"use client";

import { AppBar, Toolbar, Button, Box, Typography, Menu, MenuItem } from "@mui/material";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CustomAppBar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const timerRef = useRef(null);

  const handleOpen = (event) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    timerRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 200);
  };

  const cancelClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{ width: '100%', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Button
          onClick={() => router.push('/')}
          sx={{ textTransform: 'none', p: 0 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="logo"
              style={{ width: 80, marginRight: 8 }}
            />
            <Typography variant="h6">IELTSMate</Typography>
          </Box>
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={() => router.push('/about')}>About</Button>

          {/* Hover wrapper for Practice button + menu */}
          <Box
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            sx={{ display: 'inline-block', position: 'relative' }}
          >
            <Button
              id="fade-button"
              aria-controls={open ? 'fade-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={() => router.push('/practice') || handleOpen}
            >
              Practice
            </Button>

            <Menu
              id="fade-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              keepMounted
              disableScrollLock
              disablePortal
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              sx={{ zIndex: (theme) => theme.zIndex.appBar + 1 }}
              slotProps={{
                list: {
                  onMouseEnter: cancelClose,
                  onMouseLeave: handleClose,
                  'aria-labelledby': 'fade-button',
                },
              }}
            >
              <MenuItem onClick={() => { setAnchorEl(null); router.push('/practice/writing'); }}>
                Writing
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push('/practice/reading'); }}>
                Reading
              </MenuItem>
            </Menu>
          </Box>

          <Button onClick={() => router.push('/contact')}>Contact</Button>
          <Button variant="outlined" onClick={() => router.push('/login')}>Log In</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
