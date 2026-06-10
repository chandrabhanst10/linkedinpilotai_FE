import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAdminStatsThunk,
  fetchAdminUsersThunk,
  fetchAdminFailedJobsThunk,
  deleteAdminUserThunk,
  updateAdminUserRoleThunk,
} from "../../store/adminSlice";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

// Icons
import StorageIcon from "@mui/icons-material/Storage";
import GroupIcon from "@mui/icons-material/Group";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { AdminUser, FailedJob } from "../../types/admin";
import type { UserRole } from "../../types/auth";

import Box from "@mui/material/Box";

export default function AdminPanel() {
  const dispatch = useAppDispatch();
  const {
    stats,
    users,
    failedJobs,
    loading,
    error: reduxError,
  } = useAppSelector((state) => state.admin);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = () => {
    dispatch(fetchAdminStatsThunk());
    dispatch(fetchAdminUsersThunk());
    dispatch(fetchAdminFailedJobsThunk());
  };

  useEffect(() => {
    fetchAdminData();
  }, [dispatch]);

  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  const handleDeleteUser = async (userId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user? This removes all active scheduled posts and integrations.",
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      await dispatch(deleteAdminUserThunk(userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionLoading(true);
    try {
      await dispatch(updateAdminUserRoleThunk({ userId: userId, role: newRole }));
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const overviewCards = [
    {
      title: "Registered Users",
      value: stats?.counters.totalUsers,
      icon: <GroupIcon />,
      color: "#6366f1",
    },
    {
      title: "Total Posts",
      value: stats?.counters.totalPosts,
      icon: <DynamicFeedIcon />,
      color: "#10b981",
    },
    {
      title: "Active Queue Jobs",
      value: stats?.counters.totalActiveSched,
      icon: <StorageIcon />,
      color: "#0ea5e9",
    },
    {
      title: "Failed Publishings",
      value: stats?.counters.totalFailed,
      icon: <WarningAmberIcon />,
      color: "#ef4444",
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Administrator Control Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor platform load, manage user directories, track queue volumes,
          and check system health.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Counters Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {overviewCards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.title}>
            <Card sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: `${c.color}22`,
                  color: c.color,
                  width: 48,
                  height: 48,
                }}
              >
                {c.icon}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  {c.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {c.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Health diagnostics and plan allocations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              System Health & Resource Loads
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    CPU Load Average
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {stats?.systemHealth.cpuUsage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.systemHealth.cpuUsage}
                  sx={{ height: 8, borderRadius: "4px" }}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    RAM Utilization
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {stats?.systemHealth.memoryUsage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.systemHealth.memoryUsage}
                  color="secondary"
                  sx={{ height: 8, borderRadius: "4px" }}
                />
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Operating Platform:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {stats?.systemHealth.platform} ({stats?.systemHealth.arch})
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Uptime Service:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {Math.round(stats?.systemHealth.uptime / 3600)} Hours
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Plan Tiers allocation stats */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Subscription Tier Distribution
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Free Trial Plans:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {stats?.subscriptions.free}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pro Level Plans:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "primary.main" }}
                >
                  {stats?.subscriptions.pro}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Agency Business Plans:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "secondary.main" }}
                >
                  {stats?.subscriptions.agency}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Users directory table */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            User Directories
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage system permissions and delete accounts.
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  System Permission Role
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u: AdminUser) => (
                <TableRow key={u._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      disabled={actionLoading}
                      onChange={(e) => handleRoleChange(u._id, e.target.value as UserRole)}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={actionLoading}
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      Delete Account
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Queue Failed Jobs Diagnostics List */}
      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Queue Dead Jobs Logger
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Reviews recently failed scheduled post automation attempts.
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Author Account</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Post Content Summary
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Execution Target</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Failure Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {failedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No automated job failures logged. System healthy.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                failedJobs.map((job: FailedJob) => (
                  <TableRow key={job._id}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {job.user?.name} ({job.user?.email})
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {job.content}
                    </TableCell>
                    <TableCell>
                      {new Date(job.scheduledTime).toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{ color: "error.main", fontSize: "0.85rem" }}
                    >
                      {job.error}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
