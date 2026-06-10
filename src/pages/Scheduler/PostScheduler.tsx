import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { PostAction, Post } from "../../types/posts";
import type { EventClickArg } from "@fullcalendar/core";
import {
  fetchPostsThunk,
  deletePostThunk,
  duplicatePostThunk,
  retryPostThunk,
} from "../../store/postsSlice";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

// FullCalendar imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TableRowsIcon from "@mui/icons-material/TableRows";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function PostScheduler() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector((state) => state.posts);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState("scheduled");
  const [viewType, setViewType] = useState("table"); // table or calendar
  const [search, setSearch] = useState("");

  // Dialog State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchPosts = () => {
    dispatch(
      fetchPostsThunk({
        tab: activeTab,
        search: search || undefined,
        limit: 100, // Load all for calendar
      }),
    );
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, search, dispatch]);

  const handleAction = async (action: PostAction, postId: string) => {
    try {
      if (action === "delete") {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this post?",
        );
        if (!confirmDelete) return;
        dispatch(deletePostThunk(postId));
      } else if (action === "duplicate") {
        dispatch(duplicatePostThunk(postId));
      } else if (action === "retry") {
        dispatch(retryPostThunk(postId));
      }
      setPreviewOpen(false);
    } catch (error) {
      console.error(`Failed executing post action ${action}:`, error);
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const post = posts.find((p) => p._id === info.event.id);
    if (post) {
      setSelectedPost(post);
      setPreviewOpen(true);
    }
  };

  const calendarEvents = posts.map((post) => ({
    id: post._id,
    title: post.content.substring(0, 30) + "...",
    start: post.scheduledTime,
    color:
      post.status === "published"
        ? "#10b981"
        : post.status === "failed"
          ? "#ef4444"
          : post.status === "publishing"
            ? "#0ea5e9"
            : "#6366f1",
  }));

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Scheduler Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage drafts, review scheduled publishing cues, and track execution
            logs.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(_e, val) => val && setViewType(val)}
            size="small"
          >
            <ToggleButton value="table" aria-label="table view">
              <TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} /> Table
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} /> Calendar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Tabs list filters */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
        >
          <Tab label="Scheduled" value="scheduled" sx={{ fontWeight: 600 }} />
          <Tab label="Drafts" value="draft" sx={{ fontWeight: 600 }} />
          <Tab label="Published" value="published" sx={{ fontWeight: 600 }} />
          <Tab label="Failed" value="failed" sx={{ fontWeight: 600 }} />
        </Tabs>

        {/* Filters and search section */}
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 360 }}
          />
          <Button startIcon={<RefreshIcon />} size="small" onClick={fetchPosts}>
            Reload
          </Button>
        </Box>
      </Card>

      {/* Main Views Container */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : viewType === "calendar" ? (
        /* Full Calendar Render */
        <Card sx={{ p: 3 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="70vh"
            editable
          />
        </Card>
      ) : (
        /* Tabular Queue rendering */
        <TableContainer component={Card}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Profile</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Content Outline</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Time Settings</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No posts found in this queue block.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => {
                  const linkedAccount = post.linkedinAccounts[0];
                  const accountMeta = typeof linkedAccount === 'string' ? null : linkedAccount;
                  return (
                  <TableRow key={post._id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={accountMeta?.avatar}
                          sx={{ width: 30, height: 30 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {accountMeta?.name || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        onClick={() => {
                          setSelectedPost(post);
                          setPreviewOpen(true);
                        }}
                        sx={{
                          cursor: "pointer",
                          fontWeight: 500,
                          maxWidth: 320,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {post.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(post.scheduledTime).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.status.toUpperCase()}
                        size="small"
                        color={
                          post.status === "published"
                            ? "success"
                            : post.status === "failed"
                              ? "error"
                              : post.status === "publishing"
                                ? "info"
                                : "primary"
                        }
                        sx={{ fontWeight: 700, borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        {post.status === "failed" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleAction("retry", post._id)}
                          >
                            Retry
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/compose?edit=${post._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          startIcon={<FileCopyIcon />}
                          onClick={() => handleAction("duplicate", post._id)}
                        >
                          Duplicate
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleAction("delete", post._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Post Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Post Detail Preview</DialogTitle>
        <DialogContent dividers>
          {selectedPost && (() => {
            const linkedAccount = selectedPost.linkedinAccounts[0];
            const accountMeta = typeof linkedAccount === 'string' ? null : linkedAccount;
            return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Avatar src={accountMeta?.avatar} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {accountMeta?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Scheduled for:{" "}
                    {new Date(selectedPost.scheduledTime).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", py: 1 }}
              >
                {selectedPost.content}
              </Typography>

              {selectedPost.media && selectedPost.media.length > 0 && (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={selectedPost.media[0].url}
                    alt="Media preview"
                    style={{
                      width: "100%",
                      maxHeight: 240,
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}

              {selectedPost.error && (
                <Alert severity="error" sx={{ borderRadius: "8px", mt: 1 }}>
                  <strong>Failure Reason:</strong> {selectedPost.error}
                  {selectedPost.screenshotUrl && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                      >
                        Automation Screenshot Captured:
                      </Typography>
                      <img
                        src={selectedPost.screenshotUrl}
                        alt="Error screenshot"
                        style={{
                          width: "100%",
                          border: "1px solid #ef4444",
                          borderRadius: "4px",
                        }}
                      />
                    </Box>
                  )}
                </Alert>
              )}
            </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {selectedPost && (
            <>
              <Button
                onClick={() => navigate(`/compose?edit=${selectedPost._id}`)}
                color="primary"
              >
                Edit Post
              </Button>
              <Button
                onClick={() => handleAction("delete", selectedPost?._id)}
                color="error"
              >
                Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
