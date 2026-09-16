import { Box, Typography } from "@mui/material";
import DeleteIcon from "../../../assets/icon/delete.svg";
import MicImage from "../../../assets/icon/mic.jpg";
import { formatMoney } from "../../../utils/cartHelpers";

const Checkbox = ({ checked, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      width: 20,
      height: 20,
      border: "2px solid #5E1321",
      borderRadius: 1,
      mr: 2,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: checked ? "#5E1321" : "transparent",
      flexShrink: 0,
    }}
  >
    {checked ? (
      <Typography fontSize={12} color="white" lineHeight={1}>
        ✓
      </Typography>
    ) : null}
  </Box>
);

const CartItems = ({
  cartVendors,
  onToggleVendor,
  onToggleItem,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  return (
    <>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          bgcolor: "#5E1321",
          borderRadius: 1,
          py: 2,
          px: 3,
          color: "white",
          mb: 2,
        }}
      >
        <Typography fontWeight={600} sx={{ flex: 4 }}>
          Products
        </Typography>
        <Typography fontWeight={600} sx={{ flex: 1.5, textAlign: "center" }}>
          Unit Price
        </Typography>
        <Typography fontWeight={600} sx={{ flex: 1.5, textAlign: "center" }}>
          Quantity
        </Typography>
        <Typography fontWeight={600} sx={{ flex: 1.5, textAlign: "center" }}>
          Total
        </Typography>
        <Typography fontWeight={600} sx={{ flex: 0.5, textAlign: "center" }} />
      </Box>

      {cartVendors.map((vendor) => {
        const hasProducts = vendor.products.length > 0;
        const allSelected =
          hasProducts && vendor.products.every((p) => p.selected);

        return (
          <Box
            key={vendor.vendorId}
            sx={{
              mb: 3,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f5f5f5",
                p: { xs: 1.5, md: 2 },
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Checkbox
                checked={allSelected}
                onClick={() => onToggleVendor(vendor.vendorId, !allSelected)}
              />
              <Typography
                variant="h6"
                fontSize={{ xs: 14, md: 16 }}
                fontWeight={600}
                color="#5E1321"
              >
                {vendor.vendorName}
              </Typography>
            </Box>

            {vendor.products.map((item) => {
              const variantLabel = [item.size, item.colour]
                .filter(Boolean)
                .join(" · ");
              const unitPrice = Number(item.unitPrice ?? item.price) || 0;
              const originalUnitPrice =
                Number(item.listUnitPrice) > 0 ? item.listUnitPrice : unitPrice;
              const lineTotal =
                Number(item.lineTotal) ||
                unitPrice * (Number(item.quantity) || 1);
              const hasDiscount =
                Number(item.listUnitPrice) > 0 &&
                item.listUnitPrice > unitPrice;

              return (
                <Box
                  key={item.cartItemId}
                  sx={{
                    py: { xs: 2, md: 3 },
                    px: { xs: 1.5, md: 2 },
                    borderBottom: "1px solid #eee",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box
                    sx={{
                      display: { xs: "flex", md: "none" },
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={item.selected}
                        onClick={() => onToggleItem(item.cartItemId)}
                      />
                      <Box
                        component="img"
                        src={item.image || MicImage}
                        alt={item.name}
                        sx={{
                          width: 60,
                          height: 50,
                          borderRadius: 2,
                          mr: 2,
                          objectFit: "cover",
                        }}
                      />
                      <Box flex={1}>
                        <Typography
                          fontWeight={600}
                          color="#5E1321"
                          fontSize={13}
                        >
                          {item.name}
                        </Typography>
                        {variantLabel ? (
                          <Typography fontSize={10} color="#8E8E8E">
                            {variantLabel}
                          </Typography>
                        ) : null}
                        <Typography
                          fontWeight={600}
                          color="#5E1321"
                          fontSize={13}
                        >
                          {formatMoney(unitPrice)} / unit
                        </Typography>
                        <Typography
                          fontWeight={700}
                          color="#FF1572"
                          fontSize={14}
                        >
                          {formatMoney(lineTotal)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                          Qty: {item.quantity}
                        </Typography>
                        <Box
                          component="img"
                          src={DeleteIcon}
                          alt="delete"
                          onClick={() => onRemoveItem(item.cartItemId)}
                          sx={{ width: 24, height: 16, cursor: "pointer" }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      fontWeight={400}
                      fontSize={10}
                      color="text.secondary"
                      ml={5}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        flex: 4,
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      <Checkbox
                        checked={item.selected}
                        onClick={() => onToggleItem(item.cartItemId)}
                      />
                      <Box
                        component="img"
                        src={item.image || MicImage}
                        alt={item.name}
                        sx={{
                          width: 93,
                          height: 75,
                          borderRadius: 4,
                          mr: 2,
                          objectFit: "cover",
                        }}
                      />
                      <Box>
                        <Typography
                          fontWeight={600}
                          color="#5E1321"
                          fontSize={14}
                        >
                          {item.name}
                        </Typography>
                        {variantLabel ? (
                          <Typography
                            fontSize={11}
                            color="#8E8E8E"
                            fontWeight={500}
                          >
                            Size: {item.size || "—"} · Colour:{" "}
                            {item.colour || "—"}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1.5, textAlign: "center" }}>
                      <Typography fontWeight={600} color="#5E1321">
                        {formatMoney(originalUnitPrice)}
                      </Typography>
                      {hasDiscount ? (
                        <Typography
                          fontSize={11}
                          color="#FF1572"
                          fontWeight={500}
                        >
                          After discount: {formatMoney(unitPrice)}
                        </Typography>
                      ) : null}
                    </Box>

                    <Box
                      sx={{
                        flex: 1.5,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        onClick={() =>
                          onUpdateQuantity(item.cartItemId, item.quantity - 1)
                        }
                        sx={{
                          cursor: item.quantity > 1 ? "pointer" : "default",
                          fontWeight: 600,
                          color: "#5E1321",
                          userSelect: "none",
                        }}
                      >
                        −
                      </Typography>
                      <Typography
                        sx={{ px: 1.5, fontSize: 14, fontWeight: 600 }}
                      >
                        {item.quantity}
                      </Typography>
                      <Typography
                        onClick={() =>
                          onUpdateQuantity(item.cartItemId, item.quantity + 1)
                        }
                        sx={{
                          cursor:
                            item.quantity < item.maxQuantity
                              ? "pointer"
                              : "default",
                          fontWeight: 600,
                          color: "#5E1321",
                          userSelect: "none",
                        }}
                      >
                        +
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1.5, textAlign: "center" }}>
                      <Typography fontWeight={700} color="#FF1572">
                        {formatMoney(lineTotal)}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 0.5, textAlign: "center" }}>
                      <Box
                        component="img"
                        src={DeleteIcon}
                        alt="delete"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        sx={{
                          width: 30,
                          height: 18,
                          cursor: "pointer",
                          mx: "auto",
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    fontWeight={400}
                    fontSize={10}
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: { xs: "none", md: "block" },
                      ml: 6,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </>
  );
};

export default CartItems;
