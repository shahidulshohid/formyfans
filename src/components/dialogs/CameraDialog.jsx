// CameraModal.jsx
import { useRef, useEffect, useState } from "react";
import { Modal, Box, IconButton, Button } from "@mui/material";
import { toast } from "react-toastify";

export const CameraDialog = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open]);

  //   const startCamera = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //       streamRef.current = stream;
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //       }
  //     } catch {
  //       // ignore
  //     }
  //   };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        toast.error(
          "Camera permission denied. Please allow camera access from browser settings.",
        );
      } else if (err.name === "NotFoundError") {
        toast.error("No camera found on this device.");
      } else {
        toast.error("Could not access camera.");
      }
      onClose();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  //   const handleCapture = () => {
  //     const canvas = document.createElement("canvas");
  //     canvas.width = videoRef.current.videoWidth;
  //     canvas.height = videoRef.current.videoHeight;
  //     canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
  //     canvas.toBlob((blob) => {
  //       const file = new File([blob], "camera-capture.jpg", {
  //         type: "image/jpeg",
  //       });
  //       onCapture(file);
  //       onClose();
  //     }, "image/jpeg");
  //   };

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "camera-capture.jpg", {
        type: "image/jpeg",
      });
      onCapture(file);
      onClose();
    }, "image/jpeg");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            borderRadius: 8,
            transform: "scaleX(-1)", // preview mirror fix
          }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleCapture}>
            Capture
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
