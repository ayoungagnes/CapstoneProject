"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Alert, Container } from "@mui/material";
import * as React from "react";

// Your original component that displays the material
import ReadingMaterialQuestion from "@/app/components/reading/readingMaterialQuestion";

export default function ReadingPracticePage({ params }) {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for holding the data
  const [material, setMaterial] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to handle authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin"); // Redirect to login page
    }
  }, [status, router]);

  // Effect to fetch data from the new API route
  useEffect(() => {
    // Only fetch if the user is authenticated
    if (status === "authenticated") {
      const fetchMaterial = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/practice/reading/${id}`);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch data");
          }

          const data = await response.json();
          setMaterial(data.material);
          setGroups(data.groups);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchMaterial();
    }
  }, [id, status]); // Dependency array includes 'status'

  // Loading State
  if (loading || status === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Render the component once data is successfully fetched
  if (material) {
    return <ReadingMaterialQuestion material={material} groups={groups} />;
  }
  return null;
}