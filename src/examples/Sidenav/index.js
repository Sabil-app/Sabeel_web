/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
  setDarkMode,
} from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  const collapseName = location.pathname.replace("/", "");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [pendingLogoutRoute, setPendingLogoutRoute] = useState("/authentication/sign-in");

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);
  const handleDarkMode = () => setDarkMode(dispatch, !darkMode);

  const handleLogoutClick = (event, targetRoute) => {
    event.preventDefault();
    setPendingLogoutRoute(targetRoute || "/authentication/sign-in");
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    navigate(pendingLogoutRoute);
  };

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = href ? (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavCollapse
            name={name}
            icon={icon}
            active={key === collapseName}
            noCollapse={noCollapse}
          />
        </Link>
      ) : (
        <NavLink
          key={key}
          to={route}
          onClick={key === "logout" ? (event) => handleLogoutClick(event, route) : undefined}
        >
          <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
        </NavLink>
      );
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color={textColor}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
      );
    }

    return returnValue;
  });

  return (
    <>
      <SidenavRoot
        {...rest}
        variant="permanent"
        ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
      >
        <MDBox pt={3} pb={1} px={3} textAlign="center">
          <MDBox
            display={{ xs: "block", xl: "none" }}
            position="absolute"
            top={0}
            right={0}
            p={1.625}
            onClick={closeSidenav}
            sx={{ cursor: "pointer" }}
          >
            <MDTypography variant="h6" color="secondary">
              <Icon sx={{ fontWeight: "bold" }}>close</Icon>
            </MDTypography>
          </MDBox>
          <MDBox
            component={NavLink}
            to="/"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {brand && (
              <MDBox
                component="img"
                src={brand}
                alt="Brand"
                width={brandName ? "2.5rem" : "70%"}
                sx={{
                  maxWidth: brandName ? "2.5rem" : "70%",
                  maxHeight: "80px",
                  objectFit: "contain",
                  transition: "all 300ms linear",
                }}
              />
            )}
            {brandName && (
              <MDBox
                sx={(theme) => ({
                  ...sidenavLogoLabel(theme, { miniSidenav }),
                  ml: 1,
                  color: "#ba955c",
                })}
              >
                <MDTypography
                  component="h6"
                  variant="button"
                  fontWeight="bold"
                  sx={{ color: "inherit", fontSize: "1rem" }}
                >
                  {brandName}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </MDBox>
        <Divider
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
        <MDBox
          display="flex"
          flexDirection="column"
          height="calc(100vh - 150px)"
          justifyContent="space-between"
        >
          <List>{renderRoutes}</List>
          <MDBox px={2} pb={1}>
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              pt={1}
              sx={{
                borderTop: ({ borders: { borderWidth, borderColor } }) =>
                  `${borderWidth[1]} solid ${borderColor}`,
              }}
            >
              <NavLink
                to="/authentication/sign-in"
                onClick={(event) => handleLogoutClick(event, "/authentication/sign-in")}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <SidenavCollapse
                  name="Déconnexion"
                  icon={<Icon fontSize="small">logout</Icon>}
                  sx={{ minHeight: "auto", py: 1 }}
                />
              </NavLink>
            </MDBox>
          </MDBox>
        </MDBox>
      </SidenavRoot>
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <MDTypography variant="button" color="text">
            Voulez-vous vraiment vous déconnecter ?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="dark" onClick={() => setLogoutDialogOpen(false)}>
            Annuler
          </MDButton>
          <MDButton variant="gradient" color="error" onClick={handleConfirmLogout}>
            Confirmer
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
