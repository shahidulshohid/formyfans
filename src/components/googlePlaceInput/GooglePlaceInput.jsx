import { Box, CircularProgress, TextField } from "@mui/material";
import { useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const libraries = ["places"];

const PAC_DROPDOWN_STYLES = `
  .pac-container {
    z-index: 99999 !important;
    margin-top: 6px !important;
    border: 1px solid #f0d4df !important;
    border-radius: 12px !important;
    background: #ffffff !important;
    box-shadow: 0 12px 32px rgba(94, 19, 33, 0.12) !important;
    overflow: hidden !important;
    font-family: Montserrat, sans-serif !important;
    padding: 6px 0 !important;
  }

  .pac-container:after {
    display: none !important;
  }

  .pac-item {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 16px !important;
    border: none !important;
    border-bottom: 1px solid #f5eef2 !important;
    cursor: pointer !important;
    line-height: 1.4 !important;
    transition: background-color 0.15s ease !important;
  }

  .pac-item:last-child {
    border-bottom: none !important;
  }

  .pac-item:hover,
  .pac-item-selected {
    background: rgba(255, 21, 114, 0.08) !important;
  }

  .pac-icon {
    width: 18px !important;
    height: 18px !important;
    margin-top: 0 !important;
    margin-right: 0 !important;
    background-size: 18px 18px !important;
    opacity: 0.7 !important;
  }

  .pac-item-query {
    color: #5E1321 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    padding-right: 4px !important;
  }

  .pac-item span:not(.pac-item-query):not(.pac-icon) {
    color: #6b7280 !important;
    font-size: 13px !important;
  }

  .pac-matched {
    color: #FF1572 !important;
    font-weight: 700 !important;
  }

  .pac-logo {
    padding: 8px 12px 10px !important;
    margin: 0 !important;
    border-top: 1px solid #f5eef2 !important;
    background: #fafafa !important;
  }

  .pac-logo:after {
    height: 14px !important;
    background-size: contain !important;
  }
`;

export const GooglePlacesInput = ({
  name,
  value = "",
  onChange,
  placeholder = "Search country...",
  disabled = false,
  onPlaceSelected,
  fullWidth = true,
  backgroundColor = "#FFFFFF",
  borderRadius = "8px",
  color = "#1F2937",
  error = false,
  helperText = "",
  sx,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || "");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_INPUT_API_KEY,
    libraries,
  });

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["country"],
        fields: ["formatted_address", "geometry", "name", "address_components"],
      },
    );

    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const components = place?.address_components || [];
      const countryComp = components.find((c) =>
        c.types.includes("country"),
      );
      const country = countryComp?.long_name || place?.name || "";

      setInputValue(country);
      onChange?.({ target: { name, value: country } });
      onPlaceSelected?.({
        address: country,
        country,
        latitude: place.geometry?.location?.lat?.(),
        longitude: place.geometry?.location?.lng?.(),
        place,
      });
    });

    const fixDropdownClick = () => {
      document.querySelectorAll(".pac-item").forEach((item) => {
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
        });
      });
    };

    const observer = new MutationObserver(fixDropdownClick);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isLoaded, name, onChange, onPlaceSelected]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    onChange?.({ target: { name, value: nextValue } });
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius,
      background: backgroundColor,
      color,
      border: "1px solid #E5E7EB",
      "& fieldset": { border: "none" },
      "&:hover fieldset": { border: "none" },
      "&.Mui-focused fieldset": { border: "none" },
      "&:hover": { borderColor: "#D1D5DB" },
      "&.Mui-focused": { borderColor: "#FF1572" },
    },
    "& .MuiInputBase-input": {
      padding: "12px 16px",
      fontSize: "15px",
      color,
      fontFamily: "Montserrat",
      "&::placeholder": {
        color: color === "#fff" ? "rgba(255,255,255,0.55)" : "#9CA3AF",
        opacity: 1,
        fontWeight: 400,
      },
    },
    "& .MuiFormHelperText-root": {
      color: color === "#fff" ? "rgba(255,255,255,0.8)" : "#1F2937",
      marginLeft: 0,
    },
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#d32f2f",
    },
    ...sx,
  };

  if (loadError) {
    return (
      <TextField
        fullWidth={fullWidth}
        disabled
        value="Error loading maps"
        error
        helperText="Google Maps failed to load"
        sx={fieldSx}
      />
    );
  }

  if (!isLoaded) {
    return (
      <Box position="relative">
        <TextField
          fullWidth={fullWidth}
          disabled
          placeholder="Loading country search..."
          sx={fieldSx}
        />
        <CircularProgress
          size={18}
          sx={{
            color: "#FF1572",
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </Box>
    );
  }

  return (
    <>
      {/* <style>{PAC_DROPDOWN_STYLES}</style> */}
      <TextField
        fullWidth={fullWidth}
        name={name}
        inputRef={inputRef}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        helperText={helperText}
        sx={fieldSx}
      />
    </>
  );
};

export default GooglePlacesInput;
