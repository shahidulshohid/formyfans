import { Box, InputBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppLogo from "../../assets/images/home-page-logo.png";
import { styled, alpha } from "@mui/material/styles";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { grey } from "@mui/material/colors";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "20px",
  backgroundColor: theme.palette.colors.white,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  border: "1px solid",
  borderColor: theme.palette.divider,
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
   [theme.breakpoints.down("md")]: {
    display:"none",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

export const Logo = () => {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <Box
        onClick={() => navigate("/")}
        component="img"
        src={AppLogo}
        sx={{
          cursor: "pointer",
          width: "60px",
          height: "60px",
        }}
      />
      {/* <Search>
        <SearchIconWrapper>
          <SearchIcon sx={{ color: grey[400] }} />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search Creators, post, tags"
          inputProps={{ "aria-label": "search" }}
        />
      </Search> */}
    </React.Fragment>
  );
};
