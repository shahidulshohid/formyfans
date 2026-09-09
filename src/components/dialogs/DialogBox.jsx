import { Dialog } from "@mui/material";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "600px",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const DialogBox = ({ children, ...props }) => {
  return <BootstrapDialog {...props}>{children}</BootstrapDialog>;
};
