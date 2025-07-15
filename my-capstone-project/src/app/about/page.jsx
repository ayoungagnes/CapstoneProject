'use client';
import { Box, Container, Typography, Divider } from '@mui/material';

export default function AboutPage() {
  return (
    <>
    
    <Container sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h3" gutterBottom>
        About IELTSMate
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" gutterBottom>
        What is IELTSMate?
      </Typography>
      <Typography variant="body1" paragraph>
        IELTSMate is your AI-powered practice companion for the IELTS exam.
        Whether you're aiming to improve your speaking, writing, reading, or
        listening skills, we offer a smart, responsive, and friendly platform that
        gives you instant feedback, helpful tips, and motivation to reach your goals.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Why We Built It
      </Typography>
      <Typography variant="body1" paragraph>
        Preparing for IELTS can be expensive, stressful, and lonely. We wanted to
        make it accessible, efficient, and even fun — using the power of AI to help
        students get better faster, anytime, anywhere.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Meet Your Study Buddy
      </Typography>
      <Typography variant="body1" paragraph>
        Our AI assistant listens to your answers, reads your writing, and gives
        detailed, instant feedback. No need to wait for a tutor or book a time —
        IELTSMate is always here to help.
      </Typography>

      <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic' }}>
        ✨ "Practice smarter. Score higher." ✨
      </Typography>
    </Container>
    </>
  )
};
