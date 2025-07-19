"use client";

import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const getResultIcon = (isCorrect) => {
  return isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />;
};

const getResultColor = (isCorrect) => {
  return isCorrect ? "success" : "error";
};

export default function ReadingResultDisplay({ question, index }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        borderWidth: "1px",
        borderColor: question.isCorrect ? "success.light" : "error.light",
        bgcolor: question.isCorrect ? 'action.hover' : '#fff5f5'
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="flex-start" gap={1.5}>
              {getResultIcon(question.isCorrect)}
              <Box>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                   {index + 1}. {question.content}
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
                color="primary"
                variant="filled"
                sx={{ width: "100%", justifyContent: 'flex-start', pl: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}