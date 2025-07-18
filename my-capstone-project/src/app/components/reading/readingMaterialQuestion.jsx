"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
} from "@mui/material";

export default function ReadingMaterialQuestion({ material, groups }) {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); // State to hold submission errors
  const router = useRouter();

  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  // --- THIS IS THE UPDATED SUBMISSION HANDLER ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    // 1. Extract the IDs from the full 'groups' array prop.
    // This is the "snapshot" of the test structure.
    const questionGroupIds = groups.map(group => group._id);

    // 2. Construct the new payload with both the answers and the group IDs.
    const payload = {
      userAnswers: answers,
      questionGroupIds: questionGroupIds,
    };

    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 3. Stringify the new, correct payload.
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // If the API returns an error, display it to the user.
        throw new Error(result.message || "Failed to submit answers.");
      }

      // 4. On success, redirect to the new results page.
      router.push(`/practice/results/${result.sessionId}`);

    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message); // Set the error state to show an Alert
    } finally {
      setIsSubmitting(false);
    }
  };

  // The rest of the component's JSX remains the same.
  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>
        {material.title}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {material.subtitle}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={{ fontStyle: "italic" }}
      >
        {material.instruction}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 4, whiteSpace: "pre-wrap" }}>
        {material.paragraphs.map((p) => (
          <Box key={p._id} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              ({p.label})
            </Typography>
            <Typography variant="body1">{p.content}</Typography>
          </Box>
        ))}
      </Paper>

      {/* This map correctly renders the question groups you receive as props */}
      {groups.map((group, i) => (
        <Box key={group._id} mb={4}>
          <Typography variant="h6" gutterBottom>
            Question Group {i + 1}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {group.instruction}
          </Typography>

          {group.questions.map((q, idx) => (
            <Box key={q._id} mb={2}>
              <FormControl fullWidth>
                <FormLabel>
                  {idx + 1}. {q.content}
                </FormLabel>
                {group.questionType === "true_false_ng" ? (
                  <RadioGroup
                    row
                    value={answers[q._id] || ""}
                    onChange={(e) => handleChange(q._id, e.target.value)}
                  >
                    <FormControlLabel value="TRUE" control={<Radio />} label="TRUE" />
                    <FormControlLabel value="FALSE" control={<Radio />} label="FALSE" />
                    <FormControlLabel value="NOT GIVEN" control={<Radio />} label="NOT GIVEN" />
                  </RadioGroup>
                ) : (
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={answers[q._id] || ""}
                    onChange={(e) => handleChange(q._id, e.target.value)}
                  />
                )}
              </FormControl>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
        </Box>
      ))}

      {/* Display an error message if the submission fails */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Answers"}
      </Button>
    </Box>
  );
}