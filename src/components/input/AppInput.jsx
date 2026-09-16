import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";
import { useState } from "react";

const inputVariants = {
  darkBrown: {
    borderRadius: "4px",
    "& .MuiOutlinedInput-root": {
      bgcolor: "background.darkBrown",
      color: "text.white",
      paddingRight: "4px",
      "& .MuiSvgIcon-root": {
        color: "text.deepPink",
      },
    },

    "& .MuiFormHelperText-root": {
      marginLeft: 0,
    },
  },
  profileSearch: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px !important",
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
    },
  },
  creatorSearch: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "neutral.white",
      borderRadius: "20px",
      "& fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "14px",
      color: "text.darkBrown",
      padding: "8px 10px",
      "&::placeholder": {
        color: "text.darkBrown",
        opacity: 1,
      },
    },
  }
};

export const AppInput = ({
  startIcon,
  endIcon,
  withPasswordToggle,
  inputLabel,
  labelProps,
  variantStyles,
  sx,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";

  const variantStylesObj = inputVariants[variantStyles] ?? {};

  return (
    <>
      {inputLabel && (
        <InputLabel
          htmlFor={props.id}
          required={props.required}
          sx={{ fontSize: "1rem", mb: 0.5, color: "primary.main" }}
          {...labelProps}
        >
          {inputLabel}
        </InputLabel>
      )}
      <TextField
        {...props}
        sx={{ ...variantStylesObj, ...sx }}
        fullWidth
        type={isPassword ? (showPassword ? "text" : "password") : props.type}
        slotProps={{
          input: {
            readOnly: props.readOnly,
            startAdornment: startIcon && (
              <InputAdornment position="start">{startIcon}</InputAdornment>
            ),
            endAdornment: endIcon && (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            ),
            ...(isPassword &&
              withPasswordToggle && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{
                        p: 0.6,
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Visibility fontSize="small" />
                      ) : (
                        <VisibilityOff fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }),
          },
        }}
      />
    </>
  );
};
