"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Paper,
  Typography,
} from "@mui/material";

// Adjust these paths if your folder structure is different
import ResultsHeader from "@/app/components/results/ResultHeader";
import SummaryStatistics from "@/app/components/results/SummaryStatistics";
import SessionsTable from "@/app/components/results/SessionsTable";
import ResultsPagination from "@/app/components/results/ResultsPagination";

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchSessions = useCallback(
    async (page = 1) => {
      if (!session) return;
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          sortBy,
          sortOrder,
        });

        // The API route for all results should be updated to return the new score object
        const response = await fetch(`/api/practice/results?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSessions(data.sessions);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load practice results.");
      } finally {
        setLoading(false);
      }
    },
    [session, sortBy, sortOrder]
  );

  useEffect(() => {
    if(session) {
        fetchSessions(1);
    }
  }, [session, fetchSessions]);

  const handlePageChange = (event, newPage) => fetchSessions(newPage);
  const handleSortChange = (newSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(newSortOrder);
    setSortBy(newSortBy);
  };
  const handleViewResult = (id) => router.push(`/practice/results/${id}`);
  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await fetch(`/api/practice/results/${id}`, { method: "DELETE" });
      fetchSessions(pagination.currentPage);
    } catch (err) {
      setError(err.message || "Could not delete the session.");
    }
  };

  if (status === "loading") {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress size={60} /></Box>;
  }
  if (!session) return null;

  // --- START OF SCORE CALCULATION FIX ---
  // Calculate average BAND score safely
  const validSessions = sessions.filter(s => s.score && typeof s.score.overallBandScore === 'number');
  console.log(sessions);
  const averageBandScore =
    validSessions.length > 0
      ? validSessions.reduce((acc, s) => acc + s.score.overallBandScore, 0) / validSessions.length
      : 0;
  // --- END OF SCORE CALCULATION FIX ---


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ResultsHeader />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Pass the new averageBandScore prop */}
      <SummaryStatistics
        totalCount={pagination.totalCount}
        averageBandScore={averageBandScore}
      />

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2">
            Your Results ({pagination.totalCount})
          </Typography>
        </Box>

        {loading && sessions.length === 0 ? (
          <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}><Typography variant="h6" color="text.secondary">No practice results found.</Typography></Box>
        ) : (
          <SessionsTable
            sessions={sessions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onView={handleViewResult}
            onDelete={handleDeleteSession}
          />
        )}
      </Paper>
      
      <ResultsPagination
        totalPages={pagination.totalPages}
        currentPage={pagination.currentPage}
        onPageChange={handlePageChange}
      />
    </Container>
  );
}