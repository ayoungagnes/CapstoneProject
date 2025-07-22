"use client";

import { Box, Typography, Card, CardContent, Chip, Grid, Divider } from "@mui/material";
import { Assessment, MenuBook, DriveFileRenameOutline } from "@mui/icons-material";

export default function ScoreSummaryCard({ results }) {
  const scoreData = results.score;

  // Render nothing if scoreData is not available
  if (!scoreData) return null;

  return (
    <Card sx={{ mb: 4, background: "linear-gradient(45deg, #f5f5f5, #e3f2fd)" }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3} alignItems="center">
          
          {/* Main Score Display */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Assessment color="primary" sx={{ fontSize: 50 }} />
              <Typography variant="h3" component="p" fontWeight="bold">
                {scoreData.overallBandScore}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Overall Band Score
              </Typography>
            </Box>
          </Grid>

          {/* Breakdown Display */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Performance Breakdown
            </Typography>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={2}>
              
              {/* Reading Score Section (only shows if reading was practiced) */}
              {scoreData.readingTotal > 0 && (
                <Box flex={1} textAlign="center">
                  <Chip icon={<MenuBook />} label="Reading" sx={{ mb: 1 }} />
                  <Typography variant="h4" component="p">{scoreData.readingBandScore.toFixed(1)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Band Score
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({scoreData.readingCorrect} / {scoreData.readingTotal} correct)
                  </Typography>
                </Box>
              )}

              {/* A divider if both sections are present */}
              {scoreData.readingTotal > 0 && scoreData.writingTotal > 0 && (
                <Divider orientation="vertical" flexItem />
              )}

              {/* Writing Score Section (only shows if writing was practiced) */}
              {scoreData.writingTotal > 0 && (
                <Box flex={1} textAlign="center">
                  <Chip icon={<DriveFileRenameOutline />} label="Writing" sx={{ mb: 1 }} />
                  <Typography variant="h4" component="p">{scoreData.writingBandScore.toFixed(1)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Band Score
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    AI-Graded
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  );
}