"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import {useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  const result = await signIn("credentials", {
    redirect: false,
    email,
    password,
  });

  if (result.ok) {
    router.push("/");
  } else {
    alert("Login failed: " + result.error);
  }
};

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{
        width: 360,
        mx: "auto",
        my: 8,
        p: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Typography variant="h5" align="center">
          Log In
        </Typography>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />

        <FormControl variant="outlined" fullWidth required>
          <InputLabel htmlFor="login-password">Password</InputLabel>
          <OutlinedInput
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  onMouseDown={handleMouseDown}
                  edge="end"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Button type="submit" variant="contained" size="large">
          Log In
        </Button>
      </form>

      <Typography variant="body2" align="center">
        Don&apos;t have an account?{" "}
        <MuiLink component={Link} href="/signup">
          Sign Up
        </MuiLink>
      </Typography>
    </Box>
  );
}
