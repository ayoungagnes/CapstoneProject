"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Home, Refresh } from "@mui/icons-material";

import ScoreSummaryCard from "./ScoreSummaryCard";
import ReadingResultDisplay from "./reading/ReadingResultDisplay";
import WritingFeedbackDisplay from "./writing/WritingFeedbackDisplay";

export default function ResultsPage({ id }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/practice/results/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch results. Status: ${response.status}`
          );
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
      setLoading(false);
      setError("No Session ID provided.");
    }
  }, [id]);

  // Loading, Error, and No Results states...
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" py={4} textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/")}
          startIcon={<Home />}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box maxWidth="md" mx="auto" py={4} textAlign="center">
        <Alert severity="info">
          No results could be displayed for this session.
        </Alert>
      </Box>
    );
  }

  // Determine the type of practice session to link to.
  let tryAnotherLink = "/"
  let tryAnotherText = "Try Another Practice";
  console.log(results.score)
  if (results.score) {
    if (results.score.writingBandScore != 0) {
      tryAnotherLink = "/practice/writing";
      tryAnotherText = "Try Another Writing Practice";
    } else if (
      results.score.writingBandScore == 0 &&
      results.score.readingBandScore == 0
    ) {
      tryAnotherLink = "/"
      tryAnotherText = "Back to homepage while waiting"
    } else {
      tryAnotherLink = "/practice/reading";
      tryAnotherText = "Try Another Reading Practice";
    }
  }

  return (
    <Box maxWidth="lg" mx="auto" py={4}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Practice Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Completed on: {new Date(results.submittedAt).toLocaleString()}
        </Typography>
      </Box>

      <ScoreSummaryCard results={results} />

      {results.groups.map((group, groupIndex) => (
        <Box key={group._id} mb={4}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ textTransform: "capitalize" }}
          >
            Question Group {groupIndex + 1}:{" "}
            {group.questionType.replace(/_/g, " ")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {group.instruction}
          </Typography>

          {group.questions.map((question, questionIndex) =>
            question.isWriting ? (
              <WritingFeedbackDisplay
                key={question._id}
                question={question}
                index={questionIndex}
              />
            ) : (
              <ReadingResultDisplay
                key={question._id}
                question={question}
                index={questionIndex}
              />
            )
          )}

          {groupIndex < results.groups.length - 1 && <Divider sx={{ my: 3 }} />}
        </Box>
      ))}

      <Box display="flex" gap={2} justifyContent="center" mt={4}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => router.push(tryAnotherLink)}
        >
          {tryAnotherText}
        </Button>
      </Box>
    </Box>
  );
}
