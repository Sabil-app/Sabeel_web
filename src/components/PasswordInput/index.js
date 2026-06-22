import { useState } from "react";
import PropTypes from "prop-types";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import MDInput from "components/MDInput";

function PasswordInput({ value, onChange, label, disabled, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <MDInput
      type={showPassword ? "text" : "password"}
      label={label}
      variant="outlined"
      fullWidth
      value={value}
      onChange={onChange}
      disabled={disabled}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword((prev) => !prev)}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
              disabled={disabled}
              size="small"
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  );
}

PasswordInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
};

PasswordInput.defaultProps = {
  value: "",
  onChange: undefined,
  label: "Mot de passe",
  disabled: false,
};

export default PasswordInput;
