import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createLiveStream,
  getLiveStreams,
} from "../../api/modules/liveStream";
import { CollaborativeDealPicker } from "../../components/collaborativedealpicker";
import { DealPickerDialog } from "../../components/dialogs";
import Header from "../../components/header";
import { SocketContext } from "../../context/SocketContext";
import {
  getDisplayName,
  getInitialName,
  getUserProfileImage,
} from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";

const LiveStreams = () => {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { user } = useUserStore();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "" });
  const [streamType, setStreamType] = useState("own");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealPickerOpen, setDealPickerOpen] = useState(false);

  const isCreator = user?.role === "creator";

  const loadStreams = async () => {
    try {
      setLoading(true);
      const response = await getLiveStreams();
      setStreams(response?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not load live streams",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (stream) => {
      setStreams((prev) =>
        prev.some((item) => item._id === stream._id)
          ? prev
          : [stream, ...prev],
      );
    };
    const handleRemoved = ({ streamId }) => {
      setStreams((prev) => prev.filter((item) => item._id !== streamId));
    };

    socket.on("livestream_created", handleCreated);
    socket.on("livestream_removed", handleRemoved);
    return () => {
      socket.off("livestream_created", handleCreated);
      socket.off("livestream_removed", handleRemoved);
    };
  }, [socket]);

  const handleCreate = async () => {
    const title = form.title.trim();
    if (title.length < 2) {
      toast.error("Please enter a stream title");
      return;
    }
    if (streamType === "collaborative" && !selectedDeal) {
      toast.error("Please select a deal for the collaborative stream");
      return;
    }

    try {
      setCreating(true);
      const response = await createLiveStream({
        title,
        category: form.category.trim() || "General",
        streamType,
        ...(streamType === "collaborative"
          ? { dealId: selectedDeal._id }
          : {}),
      });
      const stream = response?.data?.data;
      setCreateOpen(false);
      setForm({ title: "", category: "" });
      setStreamType("own");
      setSelectedDeal(null);
      navigate(`/live-streams/${stream._id}`);
    } catch (error) {
      const existingStream = error?.response?.data?.data;
      if (existingStream?._id) {
        navigate(`/live-streams/${existingStream._id}`);
        return;
      }
      toast.error(
        error?.response?.data?.message || "Could not create live stream",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              onClick={() => navigate(-1)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid #5E1321",
                cursor: "pointer",
                color: "#5E1321",
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: 22, md: 28 },
                fontWeight: 600,
                color: "#5E1321",
              }}
            >
              Live on For My Fans Only
            </Typography>
          </Box>

          {isCreator && (
            <Button
              variant="contained"
              startIcon={<LiveTvIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{
                bgcolor: "#FF1572",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "20px",
                px: 2.5,
                "&:hover": { bgcolor: "#E0115F" },
              }}
            >
              Go live
            </Button>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: "#FF1572" }} />
          </Box>
        ) : streams.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            px={2}
            borderRadius="16px"
            bgcolor="#fff"
          >
            <LiveTvIcon sx={{ fontSize: 56, color: "#FF1572", mb: 1 }} />
            <Typography fontSize={20} fontWeight={700} color="#5E1321">
              No one is live right now
            </Typography>
            <Typography fontSize={14} color="text.secondary" mt={0.5}>
              {isCreator
                ? "Start a stream and connect with your fans."
                : "Check back soon for new live streams."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {streams.map((stream) => (
              <Box
                key={stream._id}
                onClick={() => navigate(`/live-streams/${stream._id}`)}
                sx={{ cursor: "pointer" }}
              >
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #5E1321 0%, #FF1572 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    mb: 1.5,
                    transition: "transform 0.2s ease",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <LiveTvIcon sx={{ fontSize: 72, color: "rgba(255,255,255,.8)" }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      bgcolor: "#FF1572",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 11,
                      px: 1.25,
                      py: 0.5,
                      borderRadius: "6px",
                      letterSpacing: ".06em",
                    }}
                  >
                    LIVE
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.25}>
                  <Avatar
                    src={getUserProfileImage(stream.creator)}
                    sx={{ width: 46, height: 46 }}
                  >
                    {getInitialName(stream.creator)}
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography
                      fontSize={16}
                      fontWeight={700}
                      color="#5E1321"
                      noWrap
                    >
                      {stream.title}
                    </Typography>
                    <Typography fontSize={13} color="#FF1572" noWrap>
                      {stream.creator?.username ||
                        getDisplayName(stream.creator)}
                      {stream.streamType === "collaborative" &&
                        stream.coHost &&
                        ` with ${
                          stream.coHost.username ||
                          getDisplayName(stream.coHost)
                        }`}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {stream.category} · {moment(stream.startedAt).fromNow()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#5E1321" }}>
          Start a live stream
        </DialogTitle>
        <DialogContent>
          <FormControl sx={{ width: "100%", mb: 1 }}>
            <RadioGroup
              row
              value={streamType}
              onChange={(event) => {
                const nextType = event.target.value;
                setStreamType(nextType);
                if (nextType === "own") setSelectedDeal(null);
              }}
            >
              <FormControlLabel
                value="own"
                control={<Radio size="small" />}
                label="Own stream"
              />
              <FormControlLabel
                value="collaborative"
                control={<Radio size="small" />}
                label="Collaborative"
              />
            </RadioGroup>
          </FormControl>

          {streamType === "collaborative" && (
            <CollaborativeDealPicker
              deal={selectedDeal}
              onOpenPicker={() => setDealPickerOpen(true)}
            />
          )}

          <TextField
            autoFocus
            fullWidth
            label="Stream title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            inputProps={{ maxLength: 120 }}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Category"
            placeholder="Gaming, Fashion, Q&A..."
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value }))
            }
            inputProps={{ maxLength: 50 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            disabled={creating}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            sx={{
              bgcolor: "#FF1572",
              "&:hover": { bgcolor: "#E0115F" },
            }}
          >
            {creating ? "Starting..." : "Start live"}
          </Button>
        </DialogActions>
      </Dialog>

      <DealPickerDialog
        open={dealPickerOpen}
        contentType="stream"
        onClose={() => setDealPickerOpen(false)}
        onSelect={(deal) => {
          setSelectedDeal(deal);
          setDealPickerOpen(false);
        }}
      />
    </Box>
  );
};

export default LiveStreams;
