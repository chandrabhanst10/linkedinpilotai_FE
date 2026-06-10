import { useEffect, useState, Fragment } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchChartsThunk,
  fetchBestTimesThunk,
  fetchTopPostsThunk,
} from "../../store/analyticsSlice";
import type { TopPost } from "../../types/analytics";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

// Recharts
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Chip } from "@mui/material";
import type { AnalyticsRange, BestTimeSlot } from "../../types/analytics";

export default function Analytics() {
  const dispatch = useAppDispatch();
  const {
    charts: chartData,
    bestTimes,
    topPosts,
    loading,
  } = useAppSelector((state) => state.analytics);
  const [range, setRange] = useState<AnalyticsRange>("7d");

  useEffect(() => {
    dispatch(fetchChartsThunk(range));
    dispatch(fetchBestTimesThunk());
    dispatch(fetchTopPostsThunk());
  }, [range, dispatch]);

  if (loading || !chartData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Summarize aggregates
  const totals = (chartData ?? []).reduce(
    (acc, cur) => {
      acc.impressions += cur.impressions ?? 0;
      acc.likes += cur.likes ?? 0;
      acc.comments += cur.comments ?? 0;
      acc.shares += cur.shares ?? 0;
      acc.clicks += cur.clicks ?? 0;
      return acc;
    },
    { impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
  );

  const metricsCards = [
    {
      title: "Impressions",
      value: totals.impressions,
      change: "+12.4%",
      color: "#6366f1",
    },
    {
      title: "Clicks",
      value: totals.clicks,
      change: "+8.2%",
      color: "#38bdf8",
    },
    { title: "Likes", value: totals.likes, change: "+15.1%", color: "#10b981" },
    {
      title: "Comments",
      value: totals.comments,
      change: "+3.5%",
      color: "#f59e0b",
    },
    {
      title: "Shares",
      value: totals.shares,
      change: "+20.0%",
      color: "#ec4899",
    },
  ];

  // Helper to draw custom heatmap cells
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hourlySlots = [9, 11, 13, 15, 17, 19]; // selected visual hour intervals

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header and range toggles */}
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
            Analytics & Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze your LinkedIn brand growth, review engagement curves, and
            post at optimal times.
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={range}
          exclusive
          onChange={(_e, val) => val && setRange(val)}
          size="small"
        >
          <ToggleButton value="7d">Last 7 Days</ToggleButton>
          <ToggleButton value="30d">Last 30 Days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Aggregate Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricsCards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.title}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {card.value.toLocaleString()}
              </Typography>
              <Box
                sx={{ display: "flex", gap: 0.5, mt: 1, alignItems: "center" }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "success.main", fontWeight: 700 }}
                >
                  {card.change}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs. last period
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recharts Area and Bar configurations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Impressions Trend
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="primaryGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#primaryGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Engagements Detail
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="comments"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Best Posting Times Heatmap representation & Top posts list */}
      <Grid container spacing={3}>
        {/* Heatmap Grid */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Best Posting Times
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 3 }}
            >
              Darker cells represent periods of high community activity in your
              timezone.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {/* Draw rows for Days */}
              {days.map((day) => (
                <Box
                  key={day}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ width: 35, fontWeight: 700 }}
                  >
                    {day}
                  </Typography>
                  <Box sx={{ display: "flex", flexGrow: 1, gap: 0.5 }}>
                    {/* Draw columns for selected hours */}
                    {hourlySlots.map((hour) => {
                      const match: BestTimeSlot = bestTimes.find(
                        (bt) =>
                          bt.day === day && bt.hour.startsWith(`${hour}:`),
                      ) ?? { day, hour: `${hour}:00`, score: 10 };

                      // Normalize score to opacity 0.1 to 1.0
                      const opacity = Math.min(
                        1,
                        Math.max(0.1, match.score / 100),
                      );

                      return (
                        <Box
                          key={hour}
                          sx={{
                            flexGrow: 1,
                            height: 28,
                            bgcolor: `rgba(99, 102, 241, ${opacity})`,
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            "&:hover": {
                              transform: "scale(1.05)",
                              outline: "2px solid #6366f1",
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.65rem",
                              color: opacity > 0.6 ? "#ffffff" : "text.primary",
                              fontWeight: 700,
                            }}
                          >
                            {hour}h
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Top Performing posts */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Top Performing Posts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Published updates sorted by community impressions count.
              </Typography>
            </Box>
            <Divider />
            <List sx={{ p: 0, flexGrow: 1, overflowY: "auto" }}>
              {topPosts.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No published posts to compute metrics.
                  </Typography>
                </Box>
              ) : (
                topPosts.map((post: TopPost, idx: number) => (
                  <Fragment key={post._id}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          mr: 2,
                          flexGrow: 1,
                          minWidth: 0,
                        }}
                      >
                        <Avatar
                          src={post.accounts[0]?.avatar}
                          sx={{ width: 34, height: 34 }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              fontWeight: 600,
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            }}
                          >
                            {post.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Impressions:{" "}
                            <strong>{post.metrics.impressions}</strong> • Likes:{" "}
                            <strong>{post.metrics.likes}</strong>
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        color="secondary"
                        variant="filled"
                        sx={{ fontWeight: 800, borderRadius: "6px" }}
                      />
                    </ListItem>
                    {idx < topPosts.length - 1 && <Divider />}
                  </Fragment>
                ))
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
