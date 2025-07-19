import { Box, Pagination } from "@mui/material";

export default function ResultsPagination({
  totalPages,
  currentPage,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 2, mt: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}