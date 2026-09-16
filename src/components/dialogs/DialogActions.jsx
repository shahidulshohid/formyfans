import { DialogActions } from "@mui/material";
import React from "react";
import CustomButton from "../cutomButon";

export const DialogActionButtons = ({
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  cancelProps = {},
  confirmProps = {},
  loading = false,      
  disabled = false,     
  ...mainProps
}) => {
  return (
    <DialogActions
      sx={{
        padding: "12px",
      }}
      {...mainProps}
    >
      {onCancel && (
        <CustomButton
          variant="outlined"
          handleClickBtn={onCancel}
          title={cancelText}
          disabled={disabled || loading}   
          {...cancelProps}
        />
      )}
      {onConfirm && (
        <CustomButton
          variant="contained"
          handleClickBtn={onConfirm}
          title={confirmText}
          loading={loading}            
          disabled={disabled || loading}    
          {...confirmProps}
        />
      )}
    </DialogActions>
  );
};