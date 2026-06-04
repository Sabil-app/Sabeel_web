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

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import NotificationCenter from "components/NotificationCenter";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";
import agencyRoutes from "agency.routes";
import { getCurrentUser, getHomeRouteForRole, isAuthenticated } from "auth/adminAgenceAuth";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const authenticatedStrict = isAuthenticated();
  const rawAdminAuth = (() => {
    try {
      return window.localStorage.getItem("sabeel_admin_agence_auth");
    } catch (_) {
      return null;
    }
  })();
  const authenticated = authenticatedStrict || Boolean(rawAdminAuth);
  const currentUser = getCurrentUser();
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/how-it-works" ||
    pathname === "/authentication/sign-in" ||
    pathname === "/authentication/sign-up" ||
    pathname === "/authentication/forgot-password" ||
    pathname === "/authentication/verify-otp" ||
    pathname === "/authentication/reset-password" ||
    pathname === "/authentication/verify-2fa";

  useEffect(() => {
    console.log("[AdminApp] route guard state", {
      pathname,
      authenticated,
      isPublicRoute,
      activeRole: currentUser?.activeRole,
      status: currentUser?.status,
      profileCompletionSubmitted: currentUser?.profileCompletionSubmitted,
    });
  }, [authenticated, currentUser, isPublicRoute, pathname]);

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Sidebar / route access filtering by admin permissions.
  // Primary admin sees everything; sub-admins only see items whose required
  // `permission` is in their permissions array. Items without `permission`
  // (Dashboard, Messages, Notifications, Settings, Profile...) stay visible.
  const userPermissions = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
  const canAccessRoute = (route) => {
    if (!route?.permission) return true;
    if (currentUser?.isPrimaryAdmin) return true;
    if (currentUser?.activeRole === "agence") return true;
    return userPermissions.includes(route.permission);
  };
  const visibleAdminRoutes = routes.filter(canAccessRoute);

  const getProtectedElement = (route) => {
    if (isPublicRoute) {
      return route.component;
    }

    if (!authenticated) {
      return <Navigate to="/authentication/sign-in" />;
    }

    if (
      route?.permission &&
      !currentUser?.isPrimaryAdmin &&
      currentUser?.activeRole !== "agence" &&
      !userPermissions.includes(route.permission)
    ) {
      return <Navigate to="/dashboard" />;
    }

    if (pathname.startsWith("/agency") && currentUser?.activeRole !== "agence") {
      return <Navigate to={getHomeRouteForRole(currentUser?.activeRole)} />;
    }

    if (!pathname.startsWith("/agency") && currentUser?.activeRole === "agence") {
      return <Navigate to="/agency/dashboard" />;
    }

    if (pathname.startsWith("/agency") && currentUser?.activeRole === "agence") {
      const isAgencyProfileRoute = pathname === "/agency/profile";
      const isAgencyAllowed =
        Boolean(currentUser?.profileCompletionSubmitted) && currentUser?.status === "active";

      if (!isAgencyAllowed && !isAgencyProfileRoute) {
        return <Navigate to="/agency/profile" />;
      }
    }

    return route.component;
  };

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route exact path={route.route} element={getProtectedElement(route)} key={route.key} />
        );
      }

      return null;
    });

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={pathname.startsWith("/agency") ? "/images/logo.png" : "/images/log.png"}
              brandName=""
              routes={pathname.startsWith("/agency") ? agencyRoutes : visibleAdminRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            {authenticated && <NotificationCenter />}
          </>
        )}
        <Routes>
          {getRoutes(routes)}
          {getRoutes(agencyRoutes)}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={pathname.startsWith("/agency") ? "/images/logo.png" : "/images/log.png"}
            brandName=""
            routes={pathname.startsWith("/agency") ? agencyRoutes : visibleAdminRoutes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          {authenticated && <NotificationCenter />}
        </>
      )}
      <Routes>
        {getRoutes(routes)}
        {getRoutes(agencyRoutes)}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}
