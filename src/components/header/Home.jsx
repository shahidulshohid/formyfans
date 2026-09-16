import { Badge, IconButton } from "@mui/material";
  import { House } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate(0);
  return (
    <IconButton
      onClick={() => navigate("/")}
      size="small"
      sx={{
        borderRadius: 1,
      }}
    >
      <House />
    </IconButton>
  );
};
