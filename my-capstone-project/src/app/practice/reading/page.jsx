"use client";
import { Button, Menu, MenuItem, Link } from "@mui/material";
import React from "react";

export default function readingPage() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <h1>Reading page!</h1>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        onMouseEnter={handleClick}
      >
        Practice
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onMouseLeave={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem>
          <Link href="/practice/writing">Writing</Link>
        </MenuItem>
        <MenuItem>
          <Link href="/practice/reading">Reading</Link>
        </MenuItem>
      </Menu>
    </>
  );
}
