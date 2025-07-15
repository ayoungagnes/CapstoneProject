'use client';
import { AppBar, Toolbar, Button, Box, Typography , Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import React from 'react';

export default function CustomAppBar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    setIsOpen(false);
  };
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
  {/* AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="logo" style={{ width: 80, marginRight: 8 }} />
            <Typography variant="h6">IELTSMate</Typography>
          </Box>
          
          <Box>
            <div>
            <Link href="/about"><Button>About</Button></Link>
            <Link href="/contact"><Button>Contact</Button></Link>
         
            {/* <Link href="/practice"><Button>Practice</Button></Link> */}
        
             
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
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
            'aria-labelledby': 'basic-button',
          },
        }}
      >
            {open && (
        <div className="absolute top-full left-0"> 
          <ul>
            <MenuItem><Link href="/practice/writing">Writing</Link></MenuItem>
            <MenuItem><Link href="/practice/reading">Reading</Link></MenuItem>
          </ul>
        </div>
            )}
      
        

      </Menu>
       <Link href="/login"><Button variant="outlined">Log In</Button></Link>
    </div>
           
          </Box>
        </Toolbar>
      </AppBar>
 </>
  )
}
