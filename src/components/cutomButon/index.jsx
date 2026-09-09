import { Box, Button, CircularProgress } from "@mui/material";

const CustomButton = ({
  title = "LOGIN",
  icon,
  handleClickBtn,
  width,
  height,
  radius = 10,
  sx = {},
  variant,
  fontSize,
  bgcolor,
  color,
  loading = false,
  ...props
}) => {
  const borderRadiusValue = typeof radius === "number" ? `${radius}px` : radius;

  return (
    <Button
      variant={variant || ""}
      onClick={handleClickBtn}
      loading={loading}
      disabled={props.disabled}
      startIcon={icon}
      {...props}
      sx={{
        textTransform: "none",
        borderRadius: borderRadiusValue,
        width: width,
        height: height,
        fontWeight: 600,
        fontSize: fontSize || "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Montserrat",
        gap: 1,
        bgcolor: bgcolor || "rgba(255, 80, 120, 1)",
        color: color || "#fff",
        ...sx,
      }}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
