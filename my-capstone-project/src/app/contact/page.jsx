"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stack,
  Link,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";

export default function ContactPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Thank you for your message! We will get back to you shortly.");
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box textAlign="center" mb={{ xs: 5, md: 10 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Get In Touch
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
          We're here to help and answer any question you might have. We look
          forward to hearing from you.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid item xs={12} md={5}>
            <Box>
              <Typography
                variant="h4"
                component="h2"
                fontWeight="600"
                gutterBottom
              >
                Contact Information
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Fill up the form and our team will get back to you within 24
                hours.
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PhoneIcon color="primary" />
                  <Link
                    href="tel:+64405451163"
                    variant="body1"
                    color="inherit"
                    underline="hover"
                  >
                    +64 405451163
                  </Link>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <EmailIcon color="primary" />
                  <Link
                    href="mailto:support@ieltsmate.com"
                    variant="body1"
                    color="inherit"
                    underline="hover"
                  >
                    support@ieltsmate.com
                  </Link>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <BusinessIcon color="primary" />
                  <Typography variant="body1">
                    99/123 AI Learning Ave
                    <br />
                    Sydney, NSW 2000
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    name="firstName"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    name="lastName"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email Address"
                    name="email"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Subject"
                    name="subject"
                    variant="outlined"
                  />
                </Grid>

                <TextField
                  fullWidth
                  required
                  label="Your Message"
                  name="message"
                  multiline
                  rows={5}
                  variant="outlined"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5, fontWeight: "bold" }}
                >
                  Send Message
                </Button>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
