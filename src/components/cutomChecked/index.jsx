import React from "react";
import { Checkbox, Box, Typography, FormControlLabel } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const CustomCheckbox = ({
    checked,
    onChange,
    label = "Default Text",
    icon,
    checkedIcon,

}) => {
    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={checked}
                    onChange={onChange}
                    icon={icon}
                    checkedIcon={checkedIcon}
                    sx={{
                        color: "primary.white",
                        "&.Mui-checked": {
                            color: "primary.white",
                        },
                    }}
                />
            }
            label={
                <Typography fontSize="20px" color="primary.white">
                    {label}
                </Typography>
            }
        />
    );
};

export default CustomCheckbox;
