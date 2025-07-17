"use client";

import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
} from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";
import PracticeMenu from "./practiceMenu";
import AccountSection from "./accountSectionMenu";

export default function CustomAppBar() {
  const router = useRouter();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{ width: "100%", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Button
          onClick={() => router.push("/")}
          sx={{ textTransform: "none", p: 0 }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/logo.png"
              alt="logo"
              style={{ width: 80, marginRight: 8 }}
            />
            <Typography variant="h6">IELTSMate</Typography>
          </Box>
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button onClick={() => router.push("/about")}>About</Button>
          <PracticeMenu />
          <Button onClick={() => router.push("/contact")}>Contact</Button>
          <AccountSection/>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
