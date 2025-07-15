'use client';
import { AppBar, Toolbar, Button, Box, Typography , Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomAppBar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    setIsOpen(false);
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
            <Link href="/about"><Button>About</Button></Link>
            <Link href="/contact"><Button>Contact</Button></Link>
            <div className="relative" // Or other positioning classes
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
            <Link href="/practice"><Button>Practice</Button></Link>
            {isOpen && (
        <div className="absolute top-full left-0"> {/* Adjust positioning as needed */}
          <ul>
            <li><Link href="/practice/writing">Writing</Link></li>
            <li><Link href="/practice/reading">Reading</Link></li>
          </ul>
        </div>
            )}
            </div>
            <Link href="/login"><Button variant="outlined">Log In</Button></Link>
          </Box>
        </Toolbar>
      </AppBar>
 </>
  )
}
