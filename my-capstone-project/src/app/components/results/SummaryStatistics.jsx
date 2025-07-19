import { Card, CardContent, Grid, Typography } from "@mui/material";

export default function SummaryStatistics({ totalCount, averageScore }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Sessions
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalCount}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Average Score
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {averageScore}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}