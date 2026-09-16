import { Chip } from "@mui/material";
export const AppChip = ({
  label,
  borderColor = "neutral.ligthColor",
  textColor = "text.neutralGrey",
  bgColor = "colors.white",
  hoverBgColor,
  hoverBorderColor,
  hoverTextColor,
  onClick,
  size = "small",
  fontWeight = 500,
  radius = "20px",
  px = 1,
  variant = "outlined",
  sx = {},
  ...rest
}) => {
  const isClickable = Boolean(onClick);

  return (
    <Chip
      variant={variant}
      label={label}
      size={size}
      clickable={isClickable}
      onClick={onClick}
      sx={{
        borderRadius: radius,
        borderColor,
        color: textColor,
        backgroundColor: bgColor,
        fontWeight,
        px,
        cursor: isClickable ? "pointer" : "default",
        "&:hover": {
          backgroundColor: hoverBgColor || bgColor,
          borderColor: hoverBorderColor || borderColor,
          color: hoverTextColor || textColor,
        },
        ...sx,
      }}
      {...rest}
    />
  );
};