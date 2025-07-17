// "use client";

// import { useState } from "react";
// import * as React from "react";
// import Box from "@mui/material/Box";
// import TextField from "@mui/material/TextField";
// import { FormControl, InputLabel, OutlinedInput,InputAdornment,IconButton } from "@mui/material";
// import { Visibility,VisibilityOff } from "@mui/icons-material";

// export default function logInPage() {
//   const [userName, setUserName] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [userPassword, setUserPassword] = useState("");
//   const [showPassword, setShowPassword] = React.useState(false);
//    const handleClickShowPassword = () => setShowPassword((show) => !show);

//   const handleMouseDownPassword = (event) => {
//     event.preventDefault();
//   };

//   const handleMouseUpPassword = (event) => {
//     event.preventDefault();
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//   };
//   return (
//     <>

//       <Box
//         component="form"
//         sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
//         noValidate
//         autoComplete="off"
//       >
//         <div>
//           <TextField required id="outlined-required" label="Name" type="Name" />

//           <TextField required
//             id="outlined-password-input"
//             label="Password"
//             type="password"
//             autoComplete="current-password"
//           />
//         </div>
//       </Box>
//       <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
//         <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
//         <OutlinedInput
//           id="outlined-adornment-password"
//           type={showPassword ? "text" : "password"}
//           endAdornment={
//             <InputAdornment position="end">
//               <IconButton
//                 aria-label={
//                   showPassword ? "hide the password" : "display the password"
//                 }
//                 onClick={handleClickShowPassword}
//                 onMouseDown={handleMouseDownPassword}
//                 onMouseUp={handleMouseUpPassword}
//                 edge="end"
//               >
//                 {showPassword ? <VisibilityOff /> : <Visibility />}
//               </IconButton>
//             </InputAdornment>
//           }
//           label="Password"
//         />
//       </FormControl>
//     </>
//   );
// }
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Add authentication logic here
    console.log("Logging in with", { email, password });
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
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
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

      <Typography variant="body2" align="center">
        Don&apos;t have an account?{' '}
        <MuiLink component={Link} href="/signup">
          Sign Up
        </MuiLink>
      </Typography>
    </Box>
  );
}
