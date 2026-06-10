import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import API from "../../api";
import { fetchAccountsThunk } from "../../store/accountsSlice";
import {
  fetchPostByIdThunk,
  createPostThunk,
  updatePostThunk,
} from "../../store/postsSlice";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Drawer from "@mui/material/Drawer";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

// Icons
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SaveIcon from "@mui/icons-material/Save";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { useThemeMode } from "../../context/ThemeContext";

export default function PostComposer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get("edit") || "";
  const { mode } = useThemeMode();

  // Accounts & Posts Redux
  const { accounts, loading: accountsLoading } = useAppSelector((state) => state.accounts);
  const { currentPost } = useAppSelector((state) => state.posts);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Form State
  const [content, setContent] = useState("");
  const [scheduledTime, setScheduledTime] = useState(() => {
    // Default to +2 hours from now
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI Assistant Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0 && !editPostId) {
      setSelectedAccounts([accounts[0]._id]);
    }
  }, [accounts, selectedAccounts, editPostId]);

  useEffect(() => {
    if (editPostId) {
      dispatch(fetchPostByIdThunk(editPostId));
    }
  }, [editPostId, dispatch]);

  useEffect(() => {
    if (editPostId && currentPost) {
      setContent(currentPost.content);
      if (currentPost.media && currentPost.media.length > 0) {
        setMediaUrl(currentPost.media[0].url);
        setMediaType(currentPost.media[0].type);
      }
      setSelectedAccounts(
        currentPost.linkedinAccounts.map((a) =>
          typeof a === 'string' ? a : a._id
        )
      );

      // Format date to local datetime format
      const localDate = new Date(currentPost.scheduledTime);
      const formatted = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      setScheduledTime(formatted);
    }
  }, [editPostId, currentPost]);

  const handleAccountToggle = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id)
        ? prev.filter((accId) => accId !== id)
        : [...prev, id],
    );
  };

  const handleConnectLinkedin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    window.location.href = `${apiUrl}/linkedin/auth`;
  };

  const handleSave = async (status = "scheduled") => {
    if (!content) {
      setError("Post text content cannot be blank");
      return;
    }
    if (selectedAccounts.length === 0) {
      setError("Please select at least one LinkedIn Profile to publish to");
      return;
    }

    if (!scheduledTime) {
      setError("Please select a valid scheduled date and time");
      return;
    }
    const parsedDate = new Date(scheduledTime);
    if (isNaN(parsedDate.getTime())) {
      setError("Selected schedule date and time is invalid");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const postPayload = {
      content,
      scheduledTime: parsedDate.toISOString(),
      status,
      linkedinAccounts: selectedAccounts,
      media: mediaUrl ? [{ url: mediaUrl, type: mediaType as 'image' | 'video' }] : [],
    };

    try {
      let resultAction;
      if (editPostId) {
        resultAction = await dispatch(
          updatePostThunk({ id: editPostId, postPayload }),
        );
      } else {
        resultAction = await dispatch(createPostThunk(postPayload));
      }

      if (
        (editPostId && updatePostThunk.fulfilled.match(resultAction)) ||
        (!editPostId && createPostThunk.fulfilled.match(resultAction))
      ) {
        setSuccess(
          status === "draft"
            ? "Draft saved successfully!"
            : "Post scheduled successfully!",
        );
        setTimeout(() => navigate("/scheduler"), 1500);
      } else {
        setError((resultAction.payload as string) || "Failed to submit post.");
      }
    } catch (err) {
      setError("Failed to submit post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI Actions
  const handleAIGenerate = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await API.post("/ai/generate", {
        topic: aiTopic,
        tone: aiTone,
      });
      if (res.data.success) {
        setAiResult(res.data.data.fullText);
      }
    } catch (err) {
      console.error("AI generate failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIImprove = async (action: 'shorten' | 'expand' | 'improve') => {
    if (!content) return;
    setAiLoading(true);
    try {
      const res = await API.post("/ai/improve", { content, action });
      if (res.data.success) {
        setContent(res.data.data.improved);
      }
    } catch (err) {
      console.error("AI improvement failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIClickCTA = async () => {
    setAiLoading(true);
    try {
      const res = await API.post("/ai/cta", { tone: aiTone });
      if (res.data.success) {
        setContent((prev) => `${prev}\n\n${res.data.data.cta}`);
      }
    } catch (err) {
      console.error("AI CTA failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const activeConnectedAccount = accounts.find((a) =>
    selectedAccounts.includes(a._id),
  ) || {
    name: "LinkedIn Profile",
    avatar:
      "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop",
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header and top info */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {editPostId ? "Edit Post Workspace" : "Compose Post Workspace"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Draft your updates, preview live feed appearances, and configure
            scheduled publish calendars.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => setAiDrawerOpen(true)}
          sx={{ py: 1.2, borderRadius: "10px" }}
        >
          AI Copilot Panel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px" }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Post Editor Forms */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Connected account multi-selectors */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Publishing Profiles (Select Targets)
              </Typography>
              {accountsLoading ? (
                <CircularProgress size={24} />
              ) : accounts.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: "8px" }}>
                  No accounts linked yet.{" "}
                  <Button size="small" onClick={handleConnectLinkedin}>
                    Connect LinkedIn Account
                  </Button>
                </Alert>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {accounts.map((acc) => {
                    const isSelected = selectedAccounts.includes(acc?._id);
                    return (
                      <Chip
                        key={acc?._id}
                        avatar={<Avatar src={acc?.avatar} />}
                        label={acc?.name}
                        onClick={() => handleAccountToggle(acc._id)}
                        variant={isSelected ? "filled" : "outlined"}
                        color={isSelected ? "primary" : "default"}
                        sx={{
                          py: 2.2,
                          px: 0.5,
                          cursor: "pointer",
                          borderRadius: "12px",
                        }}
                      />
                    );
                  })}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleConnectLinkedin}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      py: 0.5,
                    }}
                  >
                    + Connect Profile
                  </Button>
                </Box>
              )}
            </Box>

            {/* Content editor textfield */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Content Editor
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share insight, write stories or compose professional updates..."
                variant="outlined"
              />
              {/* Quick toolbar */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<InsertEmoticonIcon />}
                    onClick={() => insertEmoji("🚀")}
                  >
                    🚀
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => insertEmoji("📈")}
                  >
                    📈
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => insertEmoji("💡")}
                  >
                    💡
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => insertEmoji("🎯")}
                  >
                    🎯
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {content.length} characters (Recommended limit: 3000)
                </Typography>
              </Box>
            </Box>

            {/* Media URL attachments input (Simulating Cloudinary uploads) */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Attach Media Link (Image/Video URL)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                    >
                      <MenuItem value="image">Image File</MenuItem>
                      <MenuItem value="video">Video File</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {mediaUrl && (
                <Box
                  sx={{
                    mt: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <PhotoSizeSelectActualIcon fontSize="small" /> Media link
                    attached
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setMediaUrl("")}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>

            {/* Time schedules */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Schedule Date & Time
              </Typography>
              <TextField
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                sx={{ width: "100%", maxWidth: 300 }}
              />
            </Box>

            <Divider />

            {/* Work actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
                onClick={() => handleSave("draft")}
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                disabled={isSubmitting}
                onClick={() => handleSave("scheduled")}
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : editPostId ? (
                  "Update Schedule"
                ) : (
                  "Schedule Post"
                )}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: LinkedIn Desktop Feed Live Simulator */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: "sticky", top: "90px" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Live LinkedIn Desktop Preview
            </Typography>
            <Card
              sx={{
                bgcolor: mode === "light" ? "#ffffff" : "#1d2226",
                border: "1px solid",
                borderColor: mode === "light" ? "#eef0f2" : "#2d3237",
              }}
            >
              <Box sx={{ p: 2 }}>
                {/* Simulator Header */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Avatar
                    src={activeConnectedAccount.avatar}
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: mode === "light" ? "rgba(0,0,0,0.9)" : "#ffffff",
                        fontSize: "0.9rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {activeConnectedAccount.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block" }}
                    >
                      Founder & Creator • LinkedIn Auto Pilot
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      Now • 🌐
                    </Typography>
                  </Box>
                </Box>

                {/* Simulator Post Body Text */}
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    color: mode === "light" ? "rgba(0,0,0,0.9)" : "#eef0f2",
                    fontSize: "0.875rem",
                    lineHeight: 1.4,
                    mb: 2,
                    wordBreak: "break-word",
                  }}
                >
                  {content ||
                    "Your post text preview will display here in real-time as you type..."}
                </Typography>
              </Box>

              {/* Simulator Post Media Preview Container */}
              {mediaUrl && (
                <Box
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    bgcolor: "#000000",
                    maxHeight: 320,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {mediaType === "video" ? (
                    <video
                      src={mediaUrl}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: 320,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: 320,
                        objectFit: "contain",
                      }}
                    />
                  )}
                </Box>
              )}

              <Divider />
              {/* Simulator Action Buttons Feed */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  py: 1,
                  color: "text.secondary",
                }}
              >
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                  Like
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<CommentOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                  Comment
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<ShareOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                  Share
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                  Send
                </Button>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* AI Assistant Drawer panel */}
      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380 },
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AutoAwesomeIcon color="primary" /> AI Pilot Assistant
          </Typography>
          <Button size="small" onClick={() => setAiDrawerOpen(false)}>
            Close
          </Button>
        </Box>

        <Divider />

        {/* Generate caption topic forms */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Generate New Caption
          </Typography>
          <TextField
            fullWidth
            label="Topic / Premise"
            size="small"
            placeholder="e.g. 3 pillars of workflow automation for teams"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Tone</InputLabel>
            <Select
              value={aiTone}
              label="Tone"
              onChange={(e) => setAiTone(e.target.value)}
            >
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="bold">Bold & Direct</MenuItem>
              <MenuItem value="persuasive">Persuasive (Sales)</MenuItem>
              <MenuItem value="empathetic">Empathetic</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            onClick={handleAIGenerate}
            disabled={aiLoading || !aiTopic}
          >
            {aiLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Generate Content"
            )}
          </Button>
        </Box>

        {aiResult && (
          <Box
            sx={{
              bgcolor: "action.hover",
              p: 2,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, display: "block", mb: 1 }}
            >
              GENERATED OUTPUT:
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", mb: 2, fontSize: "0.85rem" }}
            >
              {aiResult}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setContent(aiResult);
                setAiDrawerOpen(false);
              }}
            >
              Apply to Editor
            </Button>
          </Box>
        )}

        <Divider />

        {/* Adjustments on existing drafts */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Adjust Current Draft Content
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={aiLoading || !content}
              onClick={() => handleAIImprove("expand")}
              sx={{ justifyContent: "space-between" }}
            >
              Expand Content Details <span>📝</span>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={aiLoading || !content}
              onClick={() => handleAIImprove("shorten")}
              sx={{ justifyContent: "space-between" }}
            >
              Shorten (Make Concise) <span>✂️</span>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={aiLoading || !content}
              onClick={() => handleAIImprove("improve")}
              sx={{ justifyContent: "space-between" }}
            >
              Polished & Make Engaging <span>✨</span>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={aiLoading}
              onClick={handleAIClickCTA}
              sx={{ justifyContent: "space-between" }}
            >
              Inject High-Converting CTA <span>🎯</span>
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
