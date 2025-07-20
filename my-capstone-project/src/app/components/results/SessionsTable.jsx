"use client";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TableSortLabel,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SessionsTable({
  sessions,
  sortBy,
  sortOrder,
  onSortChange,
  onView,
  onDelete,
}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortBy === "createdAt"}
                direction={sortBy === "createdAt" ? sortOrder : "asc"}
                onClick={() => onSortChange("createdAt")}
              >
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Section</TableCell>
            <TableCell align="center">Overall Band</TableCell>
            <TableCell>Question Types</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => (
            <TableRow
              key={session._id}
              hover
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {formatDate(session.createdAt)}
              </TableCell>
              <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
                {/* Display the section type, e.g., "Writing" or "Reading" */}
                {session.questionGroups[0]?.section || 'N/A'}
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" component="span" fontWeight="bold">
                  {/* Access the overallBandScore from the nested score object */}
                  {session.score?.overallBandScore?.toFixed(1) || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {session.questionGroups.map((group) => (
                    <Chip
                      key={group._id}
                      label={group.questionType?.replace(/_/g, " ")}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "capitalize" }}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title="View Results">
                    <IconButton color="primary" onClick={() => onView(session._id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Session">
                    <IconButton color="error" onClick={() => onDelete(session._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}