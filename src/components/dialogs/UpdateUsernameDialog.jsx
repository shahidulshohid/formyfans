import { forwardRef, useImperativeHandle, useState } from "react";
import { updateProfileUsername } from "../../api/modules/profile";
import useUserStore from "../../zustand/userUserStore";
import { AppInput } from "../input";
import { DialogActionButtons } from "./DialogActions";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";

export const UpdateUsernameDialog = forwardRef(({}, ref) => {
  const { user, setUserData } = useUserStore();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    open: (dataParams) => {
      setOpen(true);
      setUsername(user?.username || "");
    },
    close: () => setOpen(false),
  }));

  const handleClose = () => {
    setOpen(false);
    setUsername(user?.username || "");
    setError("");
    setLoading(false);
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (username?.trim() === user?.username?.trim()) {
      setError("New username cannot be the same as the current username");
      return;
    }

    setLoading(true);
    try {
      const response = await updateProfileUsername({ username });
      if (response.data?.status === "success") {
        setUserData({ ...user, username });
        handleClose();
      } else {
        setError(response.data?.message || "Failed to update username");
      }
    } catch (err) {
      setError("Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogBox open={open} onClose={handleClose}>
      <DialogHeader title="Update Username" onClose={handleClose} />
      <DialogBody>
        <AppInput
          variantStyles="darkBrown"
          inputLabel="Username"
          type="text"
          placeholder="Username"
          fullWidth
          size="small"
          value={username || ""}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          error={error}
          helperText={error}
        />
      </DialogBody>
      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleUpdateUsername}
        cancelText="Cancel"
        confirmText="Update"
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
});

UpdateUsernameDialog.displayName = "UpdateUsernameDialog";
