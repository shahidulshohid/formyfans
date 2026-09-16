import { Box, Typography } from "@mui/material";
import SectionCard from "./SectionCard";
import FormField from "./FormField";
import ProductImageUpload from "./ProductImageUpload";

const GeneralSection = ({
  productName,
  productDetails,
  onProductNameChange,
  onProductDetailsChange,
  images = [],
  onFilesSelect,
  onRemoveImage,
  imageUploading = false,
  errors = {},
}) => {
  return (
    <SectionCard sx={{ mb: 3, maxWidth: "100%" }}>
      <Typography fontSize={24} fontWeight={600} color="#5E1321" mb={3}>
        General
      </Typography>

      <FormField
        label="Product Name"
        placeholder="MERILAND T-SHIRT"
        value={productName}
        onChange={(e) => onProductNameChange(e.target.value)}
        error={Boolean(errors.productName)}
        helperText={errors.productName}
      />

      <FormField
        label="Product Details"
        placeholder="What is included in this product"
        multiline
        value={productDetails}
        onChange={(e) => onProductDetailsChange(e.target.value)}
        error={Boolean(errors.productDetails)}
        helperText={errors.productDetails}
      />

      <Box sx={{ width: "100%", maxWidth: "100%", mt: 1 }}>
        <ProductImageUpload
          embedded
          images={images}
          onFilesSelect={onFilesSelect}
          onRemoveImage={onRemoveImage}
          uploading={imageUploading}
          error={Boolean(errors.images)}
          helperText={errors.images}
        />
      </Box>
    </SectionCard>
  );
};

export default GeneralSection;
