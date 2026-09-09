import { IconButton, InputAdornment, TextField } from "@mui/material";
import PropTypes from "prop-types";
import React, { useState } from "react";

function CustomInput({
    InputStartIcon,
    InputEndIcon,
    onEndIconClick,
    fullWidth = true,
    readonly,
    inputBgColor,
    borderRadius,
    backgroundColor,
    error,
    helperText,
    color,
    type = "text",
    sx,
    disabled,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextField
            fullWidth={fullWidth}
            type={showPassword && type === "password" ? "text" : type}
            {...props}
            error={error}
            helperText={helperText}
            disabled={disabled}
            InputProps={{
                readOnly: readonly,
                startAdornment: InputStartIcon && (
                    <InputAdornment position="start">{InputStartIcon}</InputAdornment>
                ),
                endAdornment: type === "password" ? (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            sx={{ padding: "6px", color: "#1F2937" }}
                        />
                    </InputAdornment>
                ) : (
                    InputEndIcon && (
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                onClick={onEndIconClick}
                                sx={{ padding: "6px", color: "#1F2937" }}
                            >
                                {InputEndIcon}
                            </IconButton>
                        </InputAdornment>
                    )
                ),
            }}
            sx={(theme) => ({
                "& .MuiOutlinedInput-root": {
                    borderRadius: borderRadius || "20px",
                    background: backgroundColor || "rgba(94, 19, 33, 1)",
                    color: color||"#fff",
                    border: "1px solid #E5E7EB",

                    // 🔥 remove border everywhere
                    "& fieldset": {
                        border: "none",
                    },
                    "&:hover fieldset": {
                        border: "none",
                    },
                    "&.Mui-focused fieldset": {
                        border: "none",
                    },
                    "&:hover": {
                        borderColor: "#D1D5DB",
                    },
                    "&.Mui-focused": {
                        borderColor: "#FF1572",
                    },
                },

                "& .MuiInputBase-input": {
                    padding: "12px 16px",
                    fontSize: "15px",
                    color: "#1F2937",
                    fontFamily: "Montserrat",

                    "&::placeholder": {
                        color: "#9CA3AF",
                        opacity: 1,
                        fontWeight: 400,
                    },
                },

                "& .MuiInputBase-input": {
                    padding: "12px 16px",
                    fontSize: "15px",
                    color: color || "#1F2937",
                    fontFamily: "Montserrat",

                    "&::placeholder": {
                        color: "#9CA3AF",
                        opacity: 1,
                        fontWeight: 400,
                    },
                    "&:-webkit-autofill": {
                        WebkitTextFillColor: color || "#1F2937",
                        WebkitBoxShadow: `0 0 0 100px ${backgroundColor || "rgba(94, 19, 33, 1)"} inset`,
                        boxShadow: `0 0 0 100px ${backgroundColor || "rgba(94, 19, 33, 1)"} inset`,
                        caretColor: color || "#1F2937",
                        borderRadius: borderRadius || "20px",
                    },
                    "&:-webkit-autofill:hover": {
                        WebkitTextFillColor: color || "#1F2937",
                        WebkitBoxShadow: `0 0 0 100px ${backgroundColor || "rgba(94, 19, 33, 1)"} inset`,
                        boxShadow: `0 0 0 100px ${backgroundColor || "rgba(94, 19, 33, 1)"} inset`,
                    },
                    "&:-webkit-autofill:focus": {
                        WebkitTextFillColor: color || "#1F2937",
                        WebkitBoxShadow: `0 0 0 100px ${backgroundColor || "rgba(94, 19, 33, 1)"} inset`,
                        boxShadow: `0 0 0 100px ${backgroundColor || "rgba(94, 19, 33, 1)"} inset`,
                    },
                },
                "& .MuiInputAdornment-root .MuiIconButton-root": {
                    color: color || "#1F2937",
                },
                "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                    fontSize: "20px",
                    color: color || "#1F2937",
                },

                "& .MuiFormHelperText-root": {
                    color: "#1F2937",
                    marginLeft: 0,
                },
                "& .MuiFormHelperText-root.Mui-error": {
                    color: "#d32f2f",
                },

                ...(typeof sx === "function" ? sx(theme) : sx),
            })}
        />

    );
}

CustomInput.propTypes = {
    InputStartIcon: PropTypes.element,
    InputEndIcon: PropTypes.element,
    onEndIconClick: PropTypes.func,
    fullWidth: PropTypes.bool,
    readonly: PropTypes.bool,
    type: PropTypes.string,
    disabled: PropTypes.bool,
};

export default CustomInput;
