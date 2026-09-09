import { Box, FormHelperText, Typography } from "@mui/material";
import CustomInput from "../cutomInput";

const FormField = ({
  label,
  placeholder,
  multiline = false,
  value,
  onChange,
  error = false,
  helperText = "",
  sx,
  ...props
}) => {
  return (
    <Box mb={3} sx={{ width: "100%", ...sx }}>
      {label && (
        <Typography
          fontSize={16}
          fontWeight={600}
          color={error ? "error.main" : "#FF1572"}
          mb={1}
        >
          {label}
        </Typography>
      )}

      {multiline ? (
        <>
          <Box
            component="textarea"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            sx={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              minHeight: 100,
              p: 2,
              bgcolor: "#FFFFFF",
              borderRadius: 2,
              fontSize: 16,
              border: error ? "1px solid" : "none",
              borderColor: error ? "error.main" : "transparent",
              resize: "none",
              fontFamily: "inherit",
              color: "#5E1321",
              fontWeight: 600,
              outline: "none",
              boxShadow: error ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
            }}
            {...props}
          />
          {helperText ? (
            <FormHelperText error={error} sx={{ mx: 0, mt: 0.75 }}>
              {helperText}
            </FormHelperText>
          ) : null}
        </>
      ) : (
        <CustomInput
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          error={error}
          helperText={helperText}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              bgcolor: "#FFFFFF",
              borderRadius: 2,
              height: 40,
              boxShadow: error ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
              "& fieldset": {
                border: error ? "1px solid" : "none",
                borderColor: error ? "error.main" : "transparent",
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "error.main" : "#FF1572",
              },
            },
            "& .MuiFormHelperText-root": {
              mx: 0,
              mt: 0.75,
            },
          }}
          {...props}
        />
      )}
    </Box>
  );
};

export default FormField;
