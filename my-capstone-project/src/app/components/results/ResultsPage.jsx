"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HelpOutline,
  Assessment,
  Home,
  Refresh,
} from "@mui/icons-material";

export default function ResultsPage({ id }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // This function fetches the data for the given practice session ID.
    const fetchResults = async () => {
      // Using the 'id' prop to build the API URL.
      const apiUrl = `/api/practice/results/${id}`;
      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch results. Status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResults();
    } else {
      // If no ID is provided, stop the loading state.
      setLoading(false);
      setError("No Session ID provided.");
    }
  }, [id]); // This effect re-runs only if the 'id' prop changes.

  // Helper functions for styling based on results.
  const getResultIcon = (isCorrect) => {
    return isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />;
  };

  const getResultColor = (isCorrect) => {
    return isCorrect ? "success" : "error";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "error";
  };

  // 1. Loading State
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Results...</Typography>
      </Box>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <Box maxWidth="md" mx="auto" py={4} textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => router.push("/practice")} startIcon={<Home />}>
          Back to Practice
        </Button>
      </Box>
    );
  }

  // 3. No Results State
  if (!results) {
    return (
      <Box maxWidth="md" mx="auto" py={4} textAlign="center">
        <Alert severity="info">No results could be displayed for this session.</Alert>
      </Box>
    );
  }

  // 4. Success State - Render the results page
  return (
    <Box maxWidth="lg" mx="auto" py={4}>
      {/* --- Header --- */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Practice Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Completed on: {new Date(results.submittedAt).toLocaleString()}
        </Typography>
      </Box>

      {/* --- Score Summary Card --- */}
      {/* This now uses the pre-calculated stats directly from the API response. */}
      <Card sx={{ mb: 4, background: "linear-gradient(45deg, #f5f5f5, #e3f2fd)" }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <Assessment color="primary" sx={{ fontSize: 50 }} />
                <Box>
                  <Typography variant="h4" component="p" fontWeight="bold">
                    {results.score}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Overall Score
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Performance Breakdown
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={results.score}
                  color={getScoreColor(results.score)}
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Box display="flex" justifyContent="space-between" gap={2} mt={1}>
                  <Chip icon={<CheckCircle />} label={`${results.totalCorrect} Correct`} color="success" variant="outlined" />
                  <Chip icon={<Cancel />} label={`${results.totalQuestions - results.totalCorrect} Incorrect`} color="error" variant="outlined" />
                  <Chip icon={<HelpOutline />} label={`${results.totalQuestions} Total`} color="primary" variant="outlined" />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* --- Results by Question Group --- */}
      {/* This section maps over the 'groups' array from your API response. */}
      {results.groups.map((group, groupIndex) => (
        <Box key={group._id} mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Question Group {groupIndex + 1}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {group.instruction}
          </Typography>

          {group.questions.map((question, questionIndex) => (
            <Card
              key={question._id}
              variant="outlined"
              sx={{
                mb: 2,
                borderWidth: "1px",
                borderColor: question.isCorrect ? "success.main" : "error.main",
                bgcolor: question.isCorrect ? "success.lightest" : "error.lightest"
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      {getResultIcon(question.isCorrect)}
                      <Box>
                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                           {questionIndex + 1}. {question.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Your Answer:
                      </Typography>
                      <Chip
                        label={question.userAnswer || "Not answered"}
                        color={getResultColor(question.isCorrect)}
                        variant="outlined"
                        sx={{ mb: 2, width: "100%", justifyContent: 'flex-start', pl: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Correct Answer:
                      </Typography>
                      <Chip
                        label={question.correctAnswer}
                        color="success"
                        variant="filled"
                        sx={{ width: "100%", justifyContent: 'flex-start', pl: 1, color: 'white' }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          <Divider sx={{ my: 3 }} />
        </Box>
      ))}

      {/* --- Action Buttons --- */}
      <Box display="flex" gap={2} justifyContent="center" mt={4}>
        <Button variant="outlined" startIcon={<Home />} onClick={() => router.push("/practice")}>
          Back to Practice
        </Button>
        <Button variant="contained" startIcon={<Refresh />} onClick={() => router.push("/practice/new")}>
          Try Another Practice
        </Button>
      </Box>
    </Box>
  );
}