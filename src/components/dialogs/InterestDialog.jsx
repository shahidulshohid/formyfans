import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  INTERESTS,
  INTEREST_TYPE_LABELS,
  normalizeInterestValue,
} from "../../constants/interests";
import useInterestDialogStore from "../../zustand/interestDialogStore";
import { DialogActionButtons } from "./DialogActions";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";

const groupedInterests = INTERESTS.reduce((groups, interest) => {
  if (!groups[interest.type]) {
    groups[interest.type] = [];
  }
  groups[interest.type].push(interest);
  return groups;
}, {});

export const InterestDialog = () => {
  const {
    open,
    selectedInterests,
    title,
    onSave,
    closeInterestDialog,
  } = useInterestDialogStore();
  const [localSelected, setLocalSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalSelected(
        selectedInterests.map((interest) => normalizeInterestValue(interest)),
      );
    }
  }, [open, selectedInterests]);

  const handleToggleInterest = (value) => {
    setLocalSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleClose = () => {
    if (saving) return;
    closeInterestDialog();
  };

  const handleSave = async () => {
    if (!onSave) {
      closeInterestDialog();
      return;
    }

    setSaving(true);
    try {
      await onSave(localSelected);
      closeInterestDialog();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogBox open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogHeader
        title={title}
        secondaryHeading="Select topics you are interested in"
        onClose={handleClose}
      />

      <DialogBody>
        <Box display="flex" flexDirection="column" gap={3}>
          {Object.entries(groupedInterests).map(([type, interests]) => (
            <Box key={type}>
              <Typography
                fontSize={14}
                fontWeight={700}
                color="#5E1321"
                mb={1.5}
              >
                {INTEREST_TYPE_LABELS[type] || type}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {interests.map((interest) => {
                  const isSelected = localSelected.includes(interest.value);

                  return (
                    <Chip
                      key={interest.value}
                      label={interest.label}
                      onClick={() => handleToggleInterest(interest.value)}
                      sx={{
                        bgcolor: isSelected ? "#FF1572" : "#FFF",
                        color: isSelected ? "#FFF" : "#5E1321",
                        border: "2px solid #FF1572",
                        fontWeight: 600,
                        fontSize: 12,
                        "&:hover": {
                          bgcolor: isSelected ? "#E0115F" : "rgba(255, 21, 114, 0.08)",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        confirmText={saving ? "Saving..." : "Save Interests"}
        cancelText="Cancel"
        confirmProps={{
          disabled: saving,
          startIcon: saving ? <CircularProgress size={16} color="inherit" /> : null,
        }}
      />
    </DialogBox>
  );
};
