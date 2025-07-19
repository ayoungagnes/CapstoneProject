import { Box, Typography } from "@mui/material";

export default function ResultsHeader() {
  return (
    <Box mb={4}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Practice History
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Review your past practice session results.
      </Typography>
    </Box>
  );
}