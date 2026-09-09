import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../../../components/header";
import Sidebar from "../../../components/sidebar";
import SearchIcon from "../../../assets/icon/search-brown.svg";
import CategoryIcon from "../../../assets/icon/category.svg";
import HeartIcon from "../../../assets/icon/Heart-white.svg";
import FilterIcon from "../../../assets/icon/filter.svg";
import ChatIcon from "../../../assets/icon/chat.svg";
import {
  MarketplaceHeader,
  PageHeader,
  GeneralSection,
  PricingSection,
} from "../../../components/productForm";
import {
  buildVariantRows,
  getCreatorId,
  mapApiProductToForm,
  resolveVariantSize,
} from "../../../components/productForm/constants";
import { useProducts } from "../../../hook/products";
import { uploadMediaService } from "../../../utils/helper";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const emptyForm = () => ({
  productName: "",
  productDetails: "",
  pricingMode: "normal",
  discount: "",
  totalPrice: "",
  quantity: "",
  selectedSizes: [],
  selectedColours: [],
  variants: [],
  images: [],
});

const emptyErrors = () => ({
  productName: "",
  productDetails: "",
  images: "",
  totalPrice: "",
  quantity: "",
  selectedColours: "",
  variants: "",
});

const CreateProduct = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyErrors);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);
  const { createProduct, updateProduct, createLoading, updateLoading } =
    useProducts();

  useEffect(() => {
    if (!isEditMode) return;
    const product = location.state?.product;
    if (product) {
      const mapped = mapApiProductToForm(product);
      if (mapped) setFormData(mapped);
    }
  }, [isEditMode, location.state]);

  const navItems = [
    { icon: CategoryIcon, iconName: "Categories" },
    // { icon: HeartIcon, iconName: "Liked Products" },
    // { icon: FilterIcon, iconName: "Filter" },
    { icon: FilterIcon, iconName: "my listing", path: "/product-listing" },
  ];

  const menuItems = [
    { label: "Product List", path: "/product-listing" },
    { label: "Create Product", path: "/create-product" },
    { label: "Orders List", path: "/order-listing" },
  ];

  const clearError = (field) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const handleProductNameChange = (value) => {
    setFormData((prev) => ({ ...prev, productName: value }));
    clearError("productName");
  };

  const handleProductDetailsChange = (value) => {
    setFormData((prev) => ({ ...prev, productDetails: value }));
    clearError("productDetails");
  };

  const handlePricingModeChange = (mode) => {
    setFormData((prev) => ({ ...prev, pricingMode: mode }));
    setErrors(emptyErrors());
  };

  const handleDiscountChange = (value) => {
    setFormData((prev) => ({ ...prev, discount: value }));
  };

  const handleTotalPriceChange = (value) => {
    setFormData((prev) => ({ ...prev, totalPrice: value }));
    clearError("totalPrice");
  };

  const handleQuantityChange = (value) => {
    setFormData((prev) => ({ ...prev, quantity: value }));
    clearError("quantity");
  };

  const handleSizesChange = (sizes) => {
    setFormData((prev) => ({
      ...prev,
      selectedSizes: sizes,
      variants: buildVariantRows(sizes, prev.selectedColours, prev.variants),
    }));
    clearError("variants");
  };

  const handleColoursChange = (colours) => {
    setFormData((prev) => ({
      ...prev,
      selectedColours: colours,
      variants: buildVariantRows(prev.selectedSizes, colours, prev.variants),
    }));
    clearError("selectedColours");
    clearError("variants");
  };

  const handleVariantFieldChange = (rowId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    }));
    clearError("variants");
  };

  const handleFilesSelect = async (files) => {
    const invalid = files.find((f) => !f.type.startsWith("image/"));
    if (invalid) {
      toast.error("Please upload image files only");
      return;
    }

    setImageUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadMediaService(file).then((res) => res?.url)),
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      clearError("images");
      toast.success(
        uploadedUrls.length > 1
          ? "Images uploaded successfully"
          : "Image uploaded successfully",
      );
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCancel = () => {
    setFormData(emptyForm());
    setErrors(emptyErrors());
    navigate("/product-listing");
  };

  const validate = () => {
    const next = emptyErrors();
    let valid = true;

    if (!formData.productName.trim()) {
      next.productName = "Product name is required";
      valid = false;
    }

    if (!formData.images.length) {
      next.images = "Upload at least one image";
      valid = false;
    }

    if (formData.pricingMode === "normal") {
      const price = Number.parseFloat(
        String(formData.totalPrice).replace(/[^0-9.]/g, ""),
      );
      if (!formData.totalPrice.trim() || Number.isNaN(price) || price <= 0) {
        next.totalPrice = "Enter a valid total price";
        valid = false;
      }
      const qty = Number.parseInt(String(formData.quantity), 10);
      if (!formData.quantity.trim() || Number.isNaN(qty) || qty < 0) {
        next.quantity = "Enter a valid quantity";
        valid = false;
      }
    } else {
      if (!formData.selectedColours.length) {
        next.selectedColours = "Select at least one colour";
        valid = false;
      }
      if (!formData.variants.length) {
        next.variants = "Add variant rows by selecting colour";
        valid = false;
      }

      const invalidVariant = formData.variants.find((row) => {
        const price = Number.parseFloat(
          String(row.totalPrice).replace(/[^0-9.]/g, ""),
        );
        const qty = Number.parseInt(String(row.quantity), 10);
        const missingSize =
          formData.selectedSizes.length > 0 &&
          !resolveVariantSize(row, formData.selectedSizes);
        return (
          missingSize ||
          !row.quantity.trim() ||
          Number.isNaN(qty) ||
          qty < 0 ||
          !row.totalPrice.trim() ||
          Number.isNaN(price) ||
          price <= 0
        );
      });

      if (invalidVariant) {
        next.variants = formData.selectedSizes.length
          ? "Fill size, quantity and price for every variant row"
          : "Fill quantity and price for every variant row";
        valid = false;
      }
    }

    setErrors(next);
    if (!valid) return false;

    const creatorId = getCreatorId();
    if (!creatorId) {
      toast.error("Creator session not found. Please log in again.");
      return false;
    }

    return true;
  };

  const buildPayload = useCallback(() => {
    const creatorId = getCreatorId();
    const base = {
      creatorId,
      name: formData.productName.trim(),
      productDetails: formData.productDetails.trim(),
      images: formData.images,
    };

    if (formData.pricingMode === "normal") {
      const totalPrice = Number.parseFloat(
        String(formData.totalPrice).replace(/[^0-9.]/g, ""),
      );
      const quantity = Number.parseInt(String(formData.quantity), 10);
      return {
        ...base,
        productType: "normal",
        totalPrice,
        quantity,
      };
    }

    const hasSizes = formData.selectedSizes.length > 0;

    return {
      ...base,
      productType: "variant",
      variants: formData.variants.map((row) => {
        const size = resolveVariantSize(row, formData.selectedSizes);
        const variant = {
          colour: row.colour,
          quantity: Number.parseInt(String(row.quantity), 10),
          totalPrice: Number.parseFloat(
            String(row.totalPrice).replace(/[^0-9.]/g, ""),
          ),
          discount: row.discount?.trim()
            ? Number.parseFloat(String(row.discount).replace(/[^0-9.]/g, ""))
            : 0,
          deliveryCharges: row.deliveryCharges?.trim()
            ? Number.parseFloat(
                String(row.deliveryCharges).replace(/[^0-9.]/g, ""),
              )
            : 0,
        };
        if (hasSizes && size) {
          return { size, ...variant };
        }
        return variant;
      }),
    };
  }, [formData]);

  const handlePublish = async () => {
    if (!validate()) return;

    const payload = buildPayload();
    const response = isEditMode
      ? await updateProduct(editId, payload)
      : await createProduct(payload);
    if (response?.success) {
      navigate("/product-listing");
    }
  };

  const isBusy = createLoading || updateLoading || imageUploading;
  const isSaving = createLoading || updateLoading;

  return (
    <Box>
      <Header />
      <Box sx={{ boxSizing: "border-box", padding: 2 }}>
        <MarketplaceHeader
          searchIcon={SearchIcon}
          chatIcon={ChatIcon}
          navItems={navItems}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Sidebar menuItems={menuItems} activeItem="Create Product" />
          </Box>

          <Box
            sx={{
              flex: 1,
              bgcolor: "#F5F5F5",
              p: { xs: 2, md: 4 },
              minWidth: 0,
              overflow: "auto",
            }}
          >
            <PageHeader
              title={isEditMode ? "Edit Product" : "Add New Product"}
              onCancel={handleCancel}
              onPublish={handlePublish}
              publishLoading={isSaving}
              publishDisabled={isBusy}
              publishLabel={isEditMode ? "Update" : "Publish"}
              publishLoadingLabel={isEditMode ? "Updating..." : "Publishing..."}
            />

            <Box sx={{ maxWidth: 960, width: "100%" }}>
              <GeneralSection
                productName={formData.productName}
                productDetails={formData.productDetails}
                onProductNameChange={handleProductNameChange}
                onProductDetailsChange={handleProductDetailsChange}
                images={formData.images}
                onFilesSelect={handleFilesSelect}
                onRemoveImage={handleRemoveImage}
                imageUploading={imageUploading}
                errors={errors}
              />

              <PricingSection
                pricingMode={formData.pricingMode}
                onPricingModeChange={handlePricingModeChange}
                discount={formData.discount}
                onDiscountChange={handleDiscountChange}
                totalPrice={formData.totalPrice}
                onTotalPriceChange={handleTotalPriceChange}
                quantity={formData.quantity}
                onQuantityChange={handleQuantityChange}
                selectedSizes={formData.selectedSizes}
                onSizesChange={handleSizesChange}
                selectedColours={formData.selectedColours}
                onColoursChange={handleColoursChange}
                variants={formData.variants}
                onVariantFieldChange={handleVariantFieldChange}
                errors={errors}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateProduct;
