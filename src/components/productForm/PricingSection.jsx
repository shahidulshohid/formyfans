import {
  Box,
  Button,
  Checkbox,
  FormHelperText,
  ListItemText,
  MenuItem,
  TableCell,
  Typography,
} from "@mui/material";
import SectionCard from "./SectionCard";
import FormField from "./FormField";
import CustomInput from "../cutomInput";
import PaginatedTable from "../dynamicTable";
import {
  formatVariantFinalPrice,
  PRODUCT_COLOURS,
  PRODUCT_SIZES,
} from "./constants";

const selectSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: 2,
    height: 40,
    color: "#5E1321",
    fontWeight: 600,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "& fieldset": { border: "none" },
  },
  "& .MuiInputBase-input": {
    fontSize: 16,
    color: "#5E1321",
  },
};

const tableInputSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "8px",
    height: 36,
    "& fieldset": { border: "1px solid #E8E8E8" },
    "&.Mui-focused fieldset": { borderColor: "#FF1572" },
  },
  "& .MuiInputBase-input": {
    padding: "8px 10px",
    fontSize: 14,
    color: "#5E1321",
    fontWeight: 600,
  },
};

const VARIANT_HEADERS_WITH_SIZE = [
  { id: "size", label: "Size", width: "8%", align: "center" },
  { id: "colour", label: "Color", width: "14%", align: "center" },
  {
    id: "quantity",
    label: "Available Quantity",
    width: "20%",
    align: "center",
  },
  { id: "totalPrice", label: "Price", width: "14%", align: "center" },
  { id: "discount", label: "Discount (%)", width: "14%", align: "center" },
  { id: "deliveryCharges", label: "Delivery", width: "14%", align: "center" },
  { id: "finalPrice", label: "Total Price", width: "16%", align: "center" },
];

const VARIANT_HEADERS_NO_SIZE = [
  { id: "colour", label: "Color", width: "16%", align: "center" },
  {
    id: "quantity",
    label: "Available Quantity",
    width: "22%",
    align: "center",
  },
  { id: "totalPrice", label: "Price", width: "15%", align: "center" },
  { id: "discount", label: "Discount (%)", width: "17%", align: "center" },
  { id: "deliveryCharges", label: "Delivery", width: "15%", align: "center" },
  { id: "finalPrice", label: "Total Price", width: "15%", align: "center" },
];

const ModeToggle = ({ active, label, onClick, width }) => (
  <Button
    variant={active ? "contained" : "outlined"}
    onClick={onClick}
    sx={{
      borderColor: "#FF1572",
      color: active ? "#fff" : "#FF1572",
      bgcolor: active ? "#FF1572" : "white",
      borderRadius: "20px",
      px: 3,
      textTransform: "none",
      fontSize: 16,
      fontWeight: 600,
      width,
      height: 37,
      boxShadow: "none",
      "&:hover": {
        bgcolor: active ? "#e01265" : "rgba(255, 21, 114, 0.06)",
        borderColor: "#FF1572",
      },
    }}
  >
    {label}
  </Button>
);

const PricingSection = ({
  pricingMode = "normal",
  onPricingModeChange,
  discount = "",
  onDiscountChange,
  totalPrice = "",
  onTotalPriceChange,
  quantity = "",
  onQuantityChange,
  selectedSizes = [],
  onSizesChange,
  selectedColours = [],
  onColoursChange,
  variants = [],
  onVariantFieldChange,
  errors = {},
}) => {
  const isVariant = pricingMode === "variant";
  const hasSizes = selectedSizes.length > 0;
  const variantTableHeaders = hasSizes
    ? VARIANT_HEADERS_WITH_SIZE
    : VARIANT_HEADERS_NO_SIZE;
  const variantDisplayRows = hasSizes
    ? [
        "size",
        "colour",
        "quantity",
        "totalPrice",
        "discount",
        "deliveryCharges",
        "finalPrice",
      ]
    : [
        "colour",
        "quantity",
        "totalPrice",
        "discount",
        "deliveryCharges",
        "finalPrice",
      ];

  const handleSizeSelect = (event) => {
    const { value } = event.target;
    onSizesChange(typeof value === "string" ? value.split(",") : value);
  };

  const handleColourSelect = (event) => {
    const { value } = event.target;
    onColoursChange(typeof value === "string" ? value.split(",") : value);
  };

  const variantColSx = (field) => {
    const col = variantTableHeaders.find((h) => h.id === field);
    return col?.width ? { width: col.width } : {};
  };

  const renderVariantInput = (row, field, placeholder, inputProps = {}) => (
    <TableCell
      key={field}
      align="center"
      sx={{ verticalAlign: "middle", px: 1, ...variantColSx(field) }}
    >
      <CustomInput
        value={row[field] ?? ""}
        onChange={(e) => onVariantFieldChange(row.id, field, e.target.value)}
        placeholder={placeholder}
        type="number"
        backgroundColor="#fff"
        color="#5E1321"
        sx={tableInputSx}
        inputProps={{ min: 0, ...inputProps }}
      />
    </TableCell>
  );

  const customRenderCell = (row, val) => {
    if (val === "quantity")
      return renderVariantInput(row, "quantity", "0", { step: 1 });
    if (val === "totalPrice")
      return renderVariantInput(row, "totalPrice", "0.00", { step: "0.01" });
    if (val === "discount")
      return renderVariantInput(row, "discount", "0", {
        step: "0.01",
        max: 100,
      });
    if (val === "deliveryCharges")
      return renderVariantInput(row, "deliveryCharges", "0.00", {
        step: "0.01",
      });
    if (val === "finalPrice") {
      const display = formatVariantFinalPrice(
        row.totalPrice,
        row.discount,
        row.deliveryCharges,
      );
      return (
        <TableCell
          key="finalPrice"
          align="center"
          sx={{ verticalAlign: "middle", px: 1, ...variantColSx("finalPrice") }}
        >
          <Typography fontSize={14} fontWeight={700} sx={{ color: "#5E1321" }}>
            {display}
          </Typography>
        </TableCell>
      );
    }
    return null;
  };

  return (
    <SectionCard sx={{ maxWidth: "100%" }}>
      <Typography fontSize={18} fontWeight={600} color="#333" mb={2}>
        Pricing
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <ModeToggle
          active={pricingMode === "normal"}
          label="Normal"
          onClick={() => onPricingModeChange("normal")}
          width={120}
        />
        <ModeToggle
          active={isVariant}
          label="Variant"
          onClick={() => onPricingModeChange("variant")}
          width={120}
        />
      </Box>

      {!isVariant ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            width: "100%",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <FormField
              label="Total Price"
              placeholder="59.00"
              value={totalPrice}
              onChange={(e) => onTotalPriceChange(e.target.value)}
              type="number"
              error={Boolean(errors.totalPrice)}
              helperText={errors.totalPrice}
              sx={{ mb: 0 }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <FormField
              label="Quantity"
              placeholder="50"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              type="number"
              error={Boolean(errors.quantity)}
              helperText={errors.quantity}
              sx={{ mb: 0 }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <FormField
              label="Discount (%)"
              placeholder="e.g. 10"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
              type="number"
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              sx={{ mb: 0 }}
            />
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ width: "100%", mb: 3 }}>
            {/* <FormField
                            label="Discount (%)"
                            placeholder="e.g. 10"
                            value={discount}
                            onChange={(e) => onDiscountChange(e.target.value)}
                            type="number"
                            inputProps={{ min: 0, max: 100, step: "0.01" }}
                            sx={{ mb: 0 }}
                        /> */}
          </Box>
          <Box mb={2} sx={{ width: "100%" }}>
            <Typography fontSize={16} fontWeight={600} color="#FF1572" mb={1}>
              Select Size{" "}
              <Typography
                component="span"
                fontSize={13}
                fontWeight={500}
                color="text.secondary"
              >
                (optional)
              </Typography>
            </Typography>
            <CustomInput
              select
              value={selectedSizes}
              onChange={handleSizeSelect}
              fullWidth
              backgroundColor="#fff"
              color="#5E1321"
              sx={selectSx}
              SelectProps={{
                multiple: true,
                displayEmpty: true,
                renderValue: (selected) =>
                  selected.length
                    ? `${selected.length} size(s) selected`
                    : "Skip if product has no sizes",
              }}
            >
              {PRODUCT_SIZES.map((size) => (
                <MenuItem key={size} value={size}>
                  <Checkbox
                    checked={selectedSizes.includes(size)}
                    sx={{
                      color: "#FF1572",
                      "&.Mui-checked": { color: "#FF1572" },
                    }}
                  />
                  <ListItemText primary={size} />
                </MenuItem>
              ))}
            </CustomInput>
          </Box>

          <Box mb={3}>
            <Typography
              fontSize={16}
              fontWeight={600}
              color={errors.selectedColours ? "error.main" : "#FF1572"}
              mb={1}
            >
              Select Color
            </Typography>
            <CustomInput
              select
              value={selectedColours}
              onChange={handleColourSelect}
              fullWidth
              backgroundColor="#fff"
              color="#5E1321"
              error={Boolean(errors.selectedColours)}
              sx={{
                ...selectSx,
                "& .MuiOutlinedInput-root fieldset": {
                  border: errors.selectedColours ? "1px solid" : "none",
                  borderColor: errors.selectedColours
                    ? "error.main"
                    : "transparent",
                },
              }}
              SelectProps={{
                multiple: true,
                displayEmpty: true,
                renderValue: (selected) =>
                  selected.length
                    ? `${selected.length} colour(s) selected`
                    : "Choose colour(s)",
              }}
            >
              {PRODUCT_COLOURS.map((color) => (
                <MenuItem key={color.label} value={color.label}>
                  <Checkbox
                    checked={selectedColours.includes(color.label)}
                    sx={{
                      color: "#FF1572",
                      "&.Mui-checked": { color: "#FF1572" },
                    }}
                  />
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "6px",
                      bgcolor: `#${color.hex}`,
                      border: "1px solid rgba(0,0,0,0.15)",
                      mr: 1,
                    }}
                  />
                  <ListItemText primary={color.label} />
                </MenuItem>
              ))}
            </CustomInput>
            {errors.selectedColours ? (
              <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
                {errors.selectedColours}
              </FormHelperText>
            ) : null}
          </Box>

          {variants.length > 0 ? (
            <Box sx={{ mt: 1, width: "100%" }}>
              <Typography
                fontSize={14}
                fontWeight={600}
                color="#5E1321"
                mb={1.5}
              >
                Variant combinations
              </Typography>
              <PaginatedTable
                tableHeader={variantTableHeaders}
                tableData={variants}
                displayRows={variantDisplayRows}
                hidepagination
                showPagination={false}
                headerBgColor="#FF1572"
                fullWidth
                tableWidth="100%"
                customRenderCell={customRenderCell}
                getRowId={(row) => row.id}
              />
            </Box>
          ) : (
            <Typography fontSize={13} color="text.secondary">
              Select size (optional), then colour to build variant rows.
            </Typography>
          )}
          {errors.variants ? (
            <FormHelperText error sx={{ mx: 0, mt: 1 }}>
              {errors.variants}
            </FormHelperText>
          ) : null}
        </>
      )}
    </SectionCard>
  );
};

export default PricingSection;
