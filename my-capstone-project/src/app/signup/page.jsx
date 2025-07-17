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

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirm = () => setShowConfirmPassword((prev) => !prev);
  const handleMouseDown = (event) => event.preventDefault();

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Add signup logic and validation
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Signing up", { name, email, password });
  };

  return (
    <Box
      component={Paper}
      elevation={3}

      onSubmit={handleSubmit}
      sx={{
        width: 360,
        mx: "auto",
        mt: 8,
        p: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" align="center">
        Sign Up
      </Typography>

      <TextField
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <FormControl variant="outlined" fullWidth required>
        <InputLabel htmlFor="signup-password">Password</InputLabel>
        <OutlinedInput
          id="signup-password"
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

      <FormControl variant="outlined" fullWidth required>
        <InputLabel htmlFor="signup-confirm-password">
          Confirm Password
        </InputLabel>
        <OutlinedInput
          id="signup-confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={handleToggleConfirm}
                onMouseDown={handleMouseDown}
                edge="end"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Confirm Password"
        />
      </FormControl>

      <Button type="submit" variant="contained" size="large">
        Create Account
      </Button>

      <Typography variant="body2" align="center">
        Already have an account?{" "}
        <MuiLink component={Link} href="/login">
          Log In
        </MuiLink>
      </Typography>
    </Box>
  );
}
