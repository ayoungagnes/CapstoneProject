"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Divider,
  Stack,
} from "@mui/material";

export default function WritingPracticePage() {
  const router = useRouter();
  const { status } = useSession();

  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateQuestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/writing/generate", { method: "POST" });
      const data = await response.json(); // Always parse JSON, even for errors
      console.log(data);
      if (!response.ok) {
        // Throw an error using the message from the API's JSON response
        throw new Error(data.error || "Failed to generate a question.");
      }

      // --- ROBUSTNESS CHECK IS HERE ---
      // Before trying to use the data, make sure it has what we need.
      if (!data.question || !data.questionGroup) {
        throw new Error("Received an invalid response from the server.");
      }
      // --- END OF CHECK ---

      setQuestionData({
        groupId: data.questionGroup._id,
        questionId: data.question._id,
        instruction: data.questionGroup.instruction,
        content: data.question.content,
      });
    } catch (err) {
      // Set the error state so it's visible to the user
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (wordCount < 40) {
      setError(
        "Your essay is too short. Please write a more detailed response."
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure questionData exists before trying to submit
      if (!questionData) {
        throw new Error("No question has been generated.");
      }

      const response = await fetch("/api/practice/start-and-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questionData.questionId, // Now safely accessing the state
          answerContent: userAnswer,
        }),
      });
      const result = await response.json();
      console.log("result ", result);
      if (!response.ok) {
        throw new Error(
          result.error || "There was an issue submitting your answer."
        );
      }

      router.push(`/practice/results/${result.sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount =
    userAnswer.trim() === "" ? 0 : userAnswer.trim().split(/\s+/).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          IELTS Writing Practice
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Generate an official-style Task 2 question and write your response.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!questionData && !isLoading && (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateQuestion}
              disabled={status === "loading"}
            >
              Generate Writing Task
            </Button>
          </Box>
        )}

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 5,
            }}
          >
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Generating your question...</Typography>
          </Box>
        )}

        {questionData && (
          <Box component="form" onSubmit={handleSubmit}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                {questionData.instruction}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {questionData.content}
              </Typography>
            </Paper>

            <TextField
              fullWidth
              multiline
              rows={15}
              variant="outlined"
              label="Your Essay"
              placeholder="Start writing your essay here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              helperText={`Word Count: ${wordCount}`}
              required
            />

            <Stack direction="row" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || userAnswer.length === 0}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit for Grading"
                )}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
