"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import Link from "next/link";

export default function readingPage() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const res = await fetch("/api/question-materials");
      const data = await res.json();
      setMaterials(data);
    };
    fetchMaterials();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        IELTS Mock Reading Question
      </Typography>

      <Grid container spacing={3}>
        {materials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material._id}>
            <Card elevation={3}>
              <CardActionArea
                component={Link}
                href={`reading/${material._id}`}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    {material.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {material.type === "reading"
                      ? "Reading Section"
                      : material.type}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
