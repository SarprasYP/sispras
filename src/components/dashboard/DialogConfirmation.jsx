import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

export default function DialogConfirmation({
  dialogOpen,
  handleCloseDeleteDialog,
  title,
  content,
  handleConfirmDelete
}) {
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDeleteDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle sx={{ p: 2 }} variant="h5" id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          sx={{ px: 2 }}
          variant="outlined"
          onClick={handleCloseDeleteDialog}
        >
          Batal
        </Button>
        <Button
          sx={{ px: 2 }}
          variant="contained"
          onClick={handleConfirmDelete}
          color="error"
          autoFocus
        >
          Ya, Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
}
