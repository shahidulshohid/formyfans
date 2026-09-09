import { InputLabel, useTheme } from "@mui/material";
import PropTypes from "prop-types";

const Label = ({ title, required, style, htmlFor, ...props }) => {
    const theme = useTheme();

    return (
        <InputLabel
            htmlFor={htmlFor}
            {...props}
            sx={{
                marginBottom: "5px",
                fontSize: "20px",
                mt: "5px",
                color: "text.primary",
                fontWeight: 550,
                ...style,
            }}
        >
            {title}
            {/* {required && (
        <span
          style={{
            color: props?.error
              ? theme.palette.error.main
              : theme.palette.primary.main,
            marginLeft: 5,
            color: "#fff",
            marginTop: "15px",
            fontSize: "15px",
          }}
        >
          *
        </span>
      )} */}
        </InputLabel>
    );
};

Label.propTypes = {
    title: PropTypes.string.isRequired,
    required: PropTypes.bool,
    labelProps: PropTypes.object,
    htmlFor: PropTypes.string,
};

Label.defaultProps = {
    required: false,
    labelProps: {},
    htmlFor: "",
};

export default Label;
