import { Button, Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import IconButton from "@mui/material/IconButton";
import { Avatar } from "@mui/material";

export default function AccountSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <Button variant="outlined" onClick={() => router.push("/login")}>
        Log In
      </Button>
    );
  }
  const getInitial = (nameOrEmail = "") => {
    return nameOrEmail.charAt(0).toUpperCase();
  };
  const handleLogout = async () => {
    await signOut();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Avatar>{getInitial(session.user.name || session.user.email)}</Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        keepMounted
        disableScrollLock
        disablePortal
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled>{session.user.name || session.user.email}</MenuItem>
        <MenuItem onClick={handleLogout}>Log Out</MenuItem>
      </Menu>
    </>
  );
}
