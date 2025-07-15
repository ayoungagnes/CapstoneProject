import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import Link from 'next/link';

export default function CustomAppBar() {
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
            <Link href="/practice"><Button>Practice</Button></Link>
            <Button variant="outlined">Log In</Button>
          </Box>
        </Toolbar>
      </AppBar>
 </>
  )
}
