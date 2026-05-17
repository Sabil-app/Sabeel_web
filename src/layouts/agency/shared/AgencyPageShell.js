import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import "layouts/agency/shared/agency-theme.css";

/**
 * AgencyPageShell
 * ------------------------------------------------------------------
 * Shared wrapper for every page of the Agency space.
 *  - Applies the `.agency-page` theme (premium gradients, animations)
 *  - Includes DashboardNavbar by default (can be disabled)
 *  - Includes Footer by default (can be disabled)
 */
function AgencyPageShell({
  children,
  withNavbar = true,
  withFooter = true,
  sx = {},
  contentPy = 3,
}) {
  return (
    <DashboardLayout>
      {withNavbar ? <DashboardNavbar /> : null}
      <MDBox className="agency-page" py={contentPy} sx={sx}>
        {children}
      </MDBox>
      {withFooter ? <Footer /> : null}
    </DashboardLayout>
  );
}

AgencyPageShell.propTypes = {
  children: PropTypes.node.isRequired,
  withNavbar: PropTypes.bool,
  withFooter: PropTypes.bool,
  sx: PropTypes.object,
  contentPy: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
};

export default AgencyPageShell;
