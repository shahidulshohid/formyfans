import { Box, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useSidebarDrawerStore from "../../zustand/sidebarDrawerStore";
import DrawerProfile from "./drawerProfile";
import DrawerInterests from "./drawerInterests";
import DrawerSuggestions from "./drawerSuggestions";

const SidebarDrawer = () => {
  const { open, closeDrawer } = useSidebarDrawerStore();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={closeDrawer}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 380 },
          maxWidth: "100%",
          bgcolor: "colors.lightPink",
          borderRight: "1px solid",
          borderColor: "neutral.ligthColor",
        },
      }}
    >
      <Box sx={{ p: 2, pb: 10, height: "100%", overflow: "auto" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography fontWeight={700} color="text.darkBrown">
            Menu
          </Typography>
          <IconButton onClick={closeDrawer} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <DrawerProfile />
        <DrawerInterests />
        <Box my={2}>

        </Box>
        <DrawerSuggestions />
      </Box>
    </Drawer>
  );
};

export default SidebarDrawer;
