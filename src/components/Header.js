import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import useRouteChange from "./RouteChange";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const routeChangerHome = useRouteChange("/")
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {hasHiddenAuthButtons ? (
        children
      ) : (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => routeChangerHome()}
        >
          Back to explore
        </Button>
      )}
    </Box>
  );
};

export default Header;
