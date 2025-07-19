"use client";

import { Box, Typography, Paper, Divider, Chip, CircularProgress } from '@mui/material';

const FeedbackCriterion = ({ title, score, feedback }) => (
  <Box mb={2}>
    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
      <Chip label={`Score: ${score}`} color="primary" />
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {feedback}
    </Typography>
  </Box>
);

export default function WritingFeedbackDisplay({ question, index }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
      <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
        {index + 1}. {question.content}
      </Typography>
      <Divider sx={{ my: 2 }} />

      {!question.detailedFeedback ? (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            AI feedback is being generated. This can take up to a minute. Please check back shortly.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h5" gutterBottom color="primary.main">AI Feedback Report</Typography>
          {Object.entries(question.detailedFeedback).map(([key, value]) => {
            const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return <FeedbackCriterion key={key} title={title} {...value} />;
          })}
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>Your Submission</Typography>
      <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap', bgcolor: 'grey.50', maxHeight: '400px', overflowY: 'auto' }}>
        {question.userAnswer}
      </Paper>
    </Paper>
  );
}