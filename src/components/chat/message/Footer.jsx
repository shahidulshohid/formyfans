import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import StopIcon from "@mui/icons-material/Stop";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send";
import useActiveChatStore from "../../../zustand/activeChatStore";
import useMessageStore from "../../../zustand/messageStore";
import useTextMessageStore from "../../../zustand/textMessageStore";
import useUserStore from "../../../zustand/userUserStore";
import CustomInput from "../../cutomInput";
import { uploadMediaService } from "../../../utils/helper";
import { AudioBubble } from "./Message";

const useStyle = {
  inputButton: {
    borderRadius: "10px",
    border: "1px solid",
    borderColor: "customColor.coolGrey",
    "&:hover": {},
  },
  sendButton: {
    padding: "6px",
    borderRadius: "8px",
    backgroundColor: "primary.main",
    "&:hover": {
      backgroundColor: "primary.main",
    },
  },
  recordingButton: {
    borderRadius: "10px",
    border: "1px solid",
    borderColor: "error.main",
    color: "error.main",
    animation: "pulse 1.2s ease-in-out infinite",
    "@keyframes pulse": {
      "0%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0.4)" },
      "70%": { boxShadow: "0 0 0 8px rgba(211, 47, 47, 0)" },
      "100%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0)" },
    },
  },
  emojiPickerContainer: {
    position: "absolute",
    bottom: "60px",
    left: "10px",
    zIndex: 1100,
  },
  attachmentContainer: {
    position: "absolute",
    bottom: "60px",
    left: "10px",
    right: "10px",
    zIndex: 1000,
    maxWidth: "300px",
  },
  attachmentPreview: {
    p: 1.5,
    borderRadius: "12px",
    backgroundColor: "secondary.light",
    border: "1px solid #E1E7EF",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  imagePreview: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    mb: 1,
  },
  pdfPreview: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: 1,
    borderRadius: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  audioPreview: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: 1,
    borderRadius: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
};

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const MessageFooter = ({ socket }) => {
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const attachmentContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

  const { user } = useUserStore();
  const { activeChat } = useActiveChatStore();
  const { addInsideMessage, updateInsideMessage, updateInsideMessageInCatch } =
    useMessageStore();
  const {
    textMessage,
    attachment,
    setTextMessage,
    setAttachment,
    resetTextMessage,
    resetAttachment,
  } = useTextMessageStore();

  // ─── File type helpers ───────────────────────────────────────────────────────
  const isImage = (file) => file && file.type.startsWith("image/");
  const isPDF = (file) => file && file.type === "application/pdf";
  const isAudio = (file) => file && file.type.startsWith("audio/");

  // ─── Click outside emoji picker ──────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // ─── Image preview URL ───────────────────────────────────────────────────────
  useEffect(() => {
    if (attachment && isImage(attachment)) {
      const url = URL.createObjectURL(attachment);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [attachment]);

  // ─── Audio preview URL ───────────────────────────────────────────────────────

  useEffect(() => {
    if (attachment && isAudio(attachment)) {
      const url = URL.createObjectURL(attachment);
      setAudioPreviewUrl(url);
      return () => URL.revokeObjectURL(url); // cleanup
    } else {
      setAudioPreviewUrl(null);
    }
  }, [attachment]);

  // ─── Cleanup recording timer on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ─── Emoji ───────────────────────────────────────────────────────────────────
  const handleEmojiClick = (emojiData) => {
    setTextMessage(`${textMessage}${emojiData.emoji}`);
  };

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  // ─── Attachment ──────────────────────────────────────────────────────────────
  const handleAttachmentClick = () => attachmentInputRef.current.click();

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setRecordingDuration(0);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleChangeAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large. Maximum size is 10MB");
      return;
    }
    if (!isImage(file) && !isPDF(file)) {
      toast.error("Please select only PDF or Image files");
      return;
    }
    setAttachment(file);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  // ─── Voice recording ─────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setAttachment(audioFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  // ─── Send message ─────────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!textMessage && !attachment) return;

    const receiverId = activeChat?.participant?.sender?._id;
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    const tempMessage = {
      _id: tempId,
      conversationId: activeChat?.conversationId,
      senderId: user?._id,
      receiverId,
      message: textMessage || "",
      timestamp: new Date().toISOString(),
      isPending: true,
      ...(attachment && { attachment: { name: attachment.name } }),
    };

    addInsideMessage(tempMessage);

    try {
      let fileUrl = null;

      if (attachment) {
        fileUrl = await uploadMediaService(attachment);
      }

      const finalMessage = {
        ...tempMessage,
        attachment: fileUrl
          ? {
              url: fileUrl?.url,
              type: isAudio(attachment)
                ? "audio"
                : fileUrl?.format === "pdf"
                  ? "file"
                  : "image",
              name: fileUrl?.originalName || attachment?.name,
              size: fileUrl?.bytes,
            }
          : undefined,
        isPending: false,
      };

      socket.emit("send_message", finalMessage);
      updateInsideMessage(finalMessage);
    } catch {
      updateInsideMessageInCatch(tempId);
    }
  };

  const handleSendAndReset = () => {
    handleSendMessage();
    resetTextMessage();
    resetAttachment();
    setRecordingDuration(0);
  };

  // ─── Typing ───────────────────────────────────────────────────────────────────
  const handleTyping = () => {
    socket.emit("typing", {
      conversationId: activeChat?.conversationId,
      senderId: user?._id,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: activeChat?.conversationId,
        senderId: user?._id,
      });
    }, 1000);
  };

  const disableInput = isRecording || attachment?.type?.startsWith("audio/");

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ position: "relative" }}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        gap={0.5}
        px={1}
        py={0.5}
        // bgcolor={grey[50]}
        bgcolor={"secondary.main"}
      >
        {/* Emoji button */}
        <IconButton
          ref={emojiButtonRef}
          sx={useStyle.inputButton}
          aria-label="emoji"
          onClick={toggleEmojiPicker}
          disabled={disableInput}
        >
          <EmojiIcon />
        </IconButton>

        {/* Attach file button */}
        <IconButton
          sx={useStyle.inputButton}
          aria-label="attach-file"
          onClick={handleAttachmentClick}
          disabled={disableInput}
        >
          <AttachFileIcon />
          <input
            ref={attachmentInputRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: "none" }}
            onChange={handleChangeAttachment}
          />
        </IconButton>

        {/* Mic / Stop recording button */}
        {/* {isRecording ? (
          <IconButton
            sx={useStyle.recordingButton}
            aria-label="stop-recording"
            onClick={stopRecording}
          >
            <StopIcon />
            <Typography variant="caption" ml={0.5} fontWeight={600}>
              {formatDuration(recordingDuration)}
            </Typography>
          </IconButton>
        ) : (
          <IconButton
            sx={useStyle.inputButton}
            aria-label="voice-message"
            onClick={startRecording}
            disabled={!!attachment}
          >
            <MicIcon />
          </IconButton>
        )} */}

        {/* Text input */}
        <CustomInput
          // defaultStyle
          color={"text.white"}
          // backgroundColor={"transparent"}
          borderRadius={"10px"}
          placeholder={isRecording ? "Recording..." : "Type a message"}
          value={textMessage}
          disabled={disableInput}
          onChange={(e) => {
            setTextMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendAndReset();
            }
          }}
          InputEndIcon={
            isRecording ? (
              <Box display="flex" alignItems="center" gap={0.5}>
                <IconButton
                  sx={useStyle.recordingButton}
                  aria-label="stop-recording"
                  onClick={stopRecording}
                >
                  <StopIcon />
                  <Typography variant="caption" ml={0.5} fontWeight={600}>
                    {formatDuration(recordingDuration)}
                  </Typography>
                </IconButton>
              </Box>
            ) : textMessage?.trim() || attachment ? (
              <IconButton
                sx={useStyle.sendButton}
                aria-label="send"
                onClick={handleSendAndReset}
              >
                <SendIcon />
              </IconButton>
            ) : (
              // Default — Mic button
              <IconButton
                sx={useStyle.inputButton}
                aria-label="voice-message"
                onClick={startRecording}
              >
                <MicIcon />
              </IconButton>
            )
          }
        />
      </Stack>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <Box ref={emojiPickerRef} sx={useStyle.emojiPickerContainer}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            height={300}
            searchDisabled
          />
        </Box>
      )}

      {/* Attachment / Audio Preview */}
      {attachment && (
        <Box ref={attachmentContainerRef} sx={useStyle.attachmentContainer}>
          <Paper sx={useStyle.attachmentPreview}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {isAudio(attachment) ? "Voice Message" : attachment.name}
              </Typography>
              <IconButton
                size="small"
                onClick={handleRemoveAttachment}
                sx={{
                  p: 0.5,
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Image preview */}
            {isImage(attachment) && imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={useStyle.imagePreview}
              />
            )}

            {/* PDF preview */}
            {isPDF(attachment) && (
              <Box sx={useStyle.pdfPreview}>
                <PictureAsPdfIcon sx={{ color: "error.main", fontSize: 32 }} />
                <Typography variant="body2" color="text.secondary">
                  PDF Document
                </Typography>
              </Box>
            )}

            {/* Audio preview */}
            {/* {isAudio(attachment) && (
              <Box sx={useStyle.audioPreview}>
                <MicIcon sx={{ color: "primary.main", fontSize: 28 }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDuration(recordingDuration)}
                </Typography>
              </Box>
            )} */}
            {isAudio(attachment) && audioPreviewUrl && (
              <Box sx={useStyle.audioPreview}>
                {/* <MicIcon sx={{ color: "primary.main", fontSize: 28 }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDuration(recordingDuration)}
                </Typography> */}
                <AudioBubble url={audioPreviewUrl} isOwn={true} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <IconButton
                    size="small"
                    onClick={handleSendAndReset}
                    sx={{
                      p: 0.5,
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default MessageFooter;
