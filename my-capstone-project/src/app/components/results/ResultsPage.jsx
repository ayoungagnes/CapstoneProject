"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
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
    // A function to wrap our async logic
    const fetchResults = async () => {
      console.log("1. Starting fetchResults for id:", id);
      try {
        // Log the exact URL we are trying to fetch
        const apiUrl = `/api/practice/results/${id}`;
        console.log("2. Fetching data from API:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("3. Received response from API:", response);

        // Check if the response status is not OK (e.g., 404, 500)
        if (!response.ok) {
          console.error("4a. Response was NOT OK. Status:", response.status);
          // Try to get more error details from the response body
          const errorText = await response.text();
          console.error("4b. Error response body:", errorText);
          throw new Error(
            `Failed to fetch results. Status: ${response.status}`
          );
        }

        console.log("4. Response was OK. Parsing JSON...");
        const data = await response.json();
        console.log("5. Successfully parsed JSON data:", data);

        setResults(data);
        console.log("6. Set results state successfully.");
      } catch (err) {
        console.error("7. An error occurred in the try/catch block:", err);
        setError(err.message);
      } finally {
        console.log(
          "8. Reached the 'finally' block. Setting loading to false."
        );
        setLoading(false);
      }
    };

    // Check if id exists before trying to fetch
    if (id) {
      fetchResults();
    } else {
      console.warn("No id provided, not fetching results.");
      setLoading(false); // Stop loading if there's no ID
    }
  }, [id]); // Dependency array is correct

  const calculateStats = () => {
    if (!results) return { correct: 0, incorrect: 0, total: 0, percentage: 0 };

    let correct = 0;
    let total = 0;

    results.groups.forEach((group) => {
      group.questions.forEach((question) => {
        total++;
        if (question.isCorrect) {
          correct++;
        }
      });
    });

    return {
      correct,
      incorrect: total - correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  };

  const getResultIcon = (isCorrect) => {
    if (isCorrect) {
      return <CheckCircle color="success" />;
    }
    return <Cancel color="error" />;
  };

  const getResultColor = (isCorrect) => {
    return isCorrect ? "success" : "error";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "error";
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/practice")}
          startIcon={<Home />}
        >
          Back to Practice
        </Button>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box maxWidth="md" mx="auto" py={4}>
        <Alert severity="info">No results found for this session.</Alert>
      </Box>
    );
  }

  const stats = calculateStats();

  return (
    <Box maxWidth="lg" mx="auto" py={4}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" gutterBottom>
          Practice Results
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {results.material.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Completed on: {new Date(results.submittedAt).toLocaleString()}
        </Typography>
      </Box>

      {/* Score Summary */}
      <Card
        sx={{ mb: 4, background: "linear-gradient(45deg, #f5f5f5, #e3f2fd)" }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <Assessment color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.percentage}%
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
                  value={stats.percentage}
                  color={getScoreColor(stats.percentage)}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <Chip
                    icon={<CheckCircle />}
                    label={`${stats.correct} Correct`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Cancel />}
                    label={`${stats.incorrect} Incorrect`}
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    icon={<HelpOutline />}
                    label={`${stats.total} Total`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reading Material */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Reading Material
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {results.material.instruction}
        </Typography>
        <Box sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
          {results.material.paragraphs.map((p) => (
            <Box key={p._id} mb={2}>
              <Typography variant="subtitle2" fontWeight="bold">
                ({p.label})
              </Typography>
              <Typography variant="body2">{p.content}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Results by Group */}
      {results.groups.map((group, groupIndex) => (
        <Box key={group._id} mb={4}>
          <Typography variant="h5" gutterBottom>
            Question Group {groupIndex + 1}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {group.instruction}
          </Typography>

          {group.questions.map((question, questionIndex) => (
            <Card
              key={question._id}
              sx={{
                mb: 2,
                border: `2px solid`,
                borderColor: question.isCorrect ? "success.main" : "error.main",
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      {getResultIcon(question.isCorrect)}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Question {questionIndex + 1}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {question.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Your Answer:
                      </Typography>
                      <Chip
                        label={question.userAnswer || "Not answered"}
                        color={getResultColor(question.isCorrect)}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="subtitle2" gutterBottom>
                        Correct Answer:
                      </Typography>
                      <Chip
                        label={question.correctAnswer}
                        color="success"
                        variant="filled"
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

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="center" mt={4}>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => router.push("/practice")}
        >
          Back to Practice
        </Button>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => router.push("/practice/new")}
        >
          Try Another Practice
        </Button>
      </Box>
    </Box>
  );
}
