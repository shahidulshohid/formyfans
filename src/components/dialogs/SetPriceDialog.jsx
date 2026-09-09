import { forwardRef, useImperativeHandle, useState } from "react";
import { setCreatorSubscriptionPrice } from "../../api/modules/profile";
import useUserStore from "../../zustand/userUserStore";
import { AppInput } from "../input";
import { DialogActionButtons } from "./DialogActions";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import { toast } from "react-toastify";

export const SetCreatorSubscriptionPriceDialog = forwardRef(
  ({ onSuccess }, ref) => {
    const { user, setUserData } = useUserStore();
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      open: (dataParams) => {
        setOpen(true);
        setPrice(dataParams?.price || "");
      },
      close: () => setOpen(false),
    }));

    const handleClose = () => {
      setOpen(false);
      setPrice("");
      setError("");
      setLoading(false);
    };

    const handleSetSubscriptionPrice = async () => {
      if (!price || isNaN(price)) {
        return setError("Please enter a valid value");
      }

      try {
        setLoading(true);
        const response = await setCreatorSubscriptionPrice({ price });
        if (response.data.status === "success") {
          handleClose();
          toast.success(response?.data?.message);
          onSuccess?.();
        } else {
          toast.success(response?.data?.message);
        }
      } catch (error) {
        toast.error(err?.response?.data?.message || err?.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <DialogBox open={open} onClose={handleClose}>
        <DialogHeader title="Set Price" onClose={handleClose} />
        <DialogBody>
          <AppInput
            variantStyles="darkBrown"
            inputLabel="Price"
            type="number"
            placeholder="Set Price e.g 2.99, 3.00"
            fullWidth
            size="small"
            value={price || ""}
            onChange={(e) => {
              setPrice(e.target.valueAsNumber);
              setError("");
            }}
            error={error}
            helperText={error}
            endIcon={<PaidOutlinedIcon />}
          />
        </DialogBody>
        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSetSubscriptionPrice}
          cancelText="Cancel"
          confirmText="Update"
          loading={loading}
          confirmProps={{
            sx: {
              bgcolor: "#FF1572",
              color: "#fff",
              "&:hover": { bgcolor: "#E0115F" },
            },
          }}
          cancelProps={{
            sx: {
              color: "#5E1321",
              borderColor: "#5E1321",
            },
          }}
        />
      </DialogBox>
    );
  },
);

SetCreatorSubscriptionPriceDialog.displayName =
  "SetCreatorSubscriptionPriceDialog";
