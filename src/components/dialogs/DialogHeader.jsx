import { DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

export const DialogHeader = ({ title, secondaryHeading, onClose, icon }) => {
  return (
    <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon && (
          <IconButton
            aria-label="icon"
            sx={{
              backgroundColor: "#0000000a",
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {icon}
          </IconButton>
        )}
        <Stack>
          <Typography
            variant="h6"
            fontWeight={600}
            lineHeight={"normal"}
            textTransform={"capitalize"}
          >
            {title}
          </Typography>
          {secondaryHeading && (
            <Typography
              variant="body2"
              color="text.coolGrey"
              lineHeight={"normal"}
            >
              {secondaryHeading}
            </Typography>
          )}
        </Stack>
      </Stack>
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};
