import { Box, Typography } from "@mui/material";

const SettingHeader = ({ title, icon, maxWidth = 793 }) => {
  return (
    <Box
      bgcolor="#FF1572"
      borderRadius="30px"
      px={{ xs: 2, md: 3 }}
      display="flex"
      width="100%"
      maxWidth={maxWidth}
      height={{ xs: 50, md: 60 }}
      alignItems="center"
      gap={2}
    >
      <img src={icon} alt="Account" style={{ width: 30, height: 30 }} />
      <Typography
        color="#5E1321"
        fontSize={{ xs: 18, md: 24 }}
        fontWeight={600}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default SettingHeader;
