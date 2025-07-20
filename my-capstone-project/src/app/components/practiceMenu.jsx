"use client";

import {
  Button,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PracticeMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const timerRef = useRef(null);

  const handleOpen = (e) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnchorEl(e.currentTarget);
  };
  const delayedClose = () => {
    timerRef.current = setTimeout(() => setAnchorEl(null), 200);
  };
  const cancelClose = () => timerRef.current && clearTimeout(timerRef.current);

  return (
    <Box
      onMouseEnter={handleOpen}
      onMouseLeave={delayedClose}
      sx={{ display: "inline-block", position: "relative" }}
    >
      <Button id="practice-btn" aria-controls={open ? "practice-menu" : undefined} aria-expanded={open}>
        Practice
      </Button>

      <Menu
        id="practice-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        keepMounted
        disableScrollLock
        disablePortal
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ list: { onMouseEnter: cancelClose, onMouseLeave: delayedClose } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); router.push("/practice/writing"); }}>Writing</MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); router.push("/practice/reading"); }}>Reading</MenuItem>
      </Menu>
    </Box>
  );
}