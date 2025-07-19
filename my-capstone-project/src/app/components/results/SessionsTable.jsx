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

// Helper function to get score chip styles
const getScoreChip = (score) => {
  let color = "default";
  if (score >= 80) color = "success";
  else if (score >= 60) color = "warning";
  else if (score >= 0) color = "error";

  return (
    <Chip label={`${score}%`} color={color} size="small" variant="outlined" />
  );
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
            <TableCell align="center">Questions</TableCell>
            <TableCell align="center">Score</TableCell>
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
              <TableCell align="center">{session.totalQuestions}</TableCell>
              <TableCell align="center">{getScoreChip(session.score)}</TableCell>
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