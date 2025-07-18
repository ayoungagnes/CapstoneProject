"use client";

import { useState } from "react";
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
} from "@mui/material";

export default function ReadingMaterialQuestion({ material, groups }) {
  const [answers, setAnswers] = useState({});

  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    console.log("User answers:", answers);
    // Send to backend or evaluate
  };

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
                    <FormControlLabel
                      value="TRUE"
                      control={<Radio />}
                      label="TRUE"
                    />
                    <FormControlLabel
                      value="FALSE"
                      control={<Radio />}
                      label="FALSE"
                    />
                    <FormControlLabel
                      value="NOT GIVEN"
                      control={<Radio />}
                      label="NOT GIVEN"
                    />
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

      <Button variant="contained" onClick={handleSubmit}>
        Submit Answers
      </Button>
    </Box>
  );
}
