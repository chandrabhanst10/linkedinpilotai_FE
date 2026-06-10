import { useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSummaryThunk, fetchChartsThunk } from '../../store/analyticsSlice';
import type { ActivityFeedItem, UpcomingPostSummary } from '../../types/analytics';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

// Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Icons
import CreateIcon from '@mui/icons-material/Create';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { summary: data, charts: chartData, loading } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchSummaryThunk());
    dispatch(fetchChartsThunk('7d'));
  }, [dispatch]);

  if (loading || !data || !chartData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Posts', value: data.stats.total, icon: <CreateIcon />, color: '#6366f1' },
    { title: 'Scheduled', value: data.stats.scheduled, icon: <DateRangeIcon />, color: '#0ea5e9' },
    { title: 'Published', value: data.stats.published, icon: <CheckCircleIcon />, color: '#10b981' },
    { title: 'Failed', value: data.stats.failed, icon: <ErrorIcon />, color: '#ef4444' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header action panel */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor queue workloads, active LinkedIn schedules, and overall profile engagements.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/compose')}
          sx={{ py: 1.2, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
        >
          Compose Post
        </Button>
      </Box>

      {/* Stats Counter Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Avatar sx={{ bgcolor: `${card.color}22`, color: card.color, width: 38, height: 38 }}>
                    {card.icon}
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 2 }}>
                  {card.value}
                </Typography>
              </CardContent>
              {/* Colored bottom outline */}
              <Box sx={{ height: 4, width: '100%', bgcolor: card.color, position: 'absolute', bottom: 0 }} />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Charts & Lists Area */}
      <Grid container spacing={3}>
        {/* Left Column: Recharts Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Engagement Analytics (Last 7 Days)
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="impressions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" />
                  <Area type="monotone" dataKey="clicks" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          {/* Upcoming scheduled posts list */}
          <Card>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upcoming Queue
              </Typography>
              <Button size="small" onClick={() => navigate('/scheduler')}>View Full Schedule</Button>
            </Box>
            <Divider />
            {data.upcoming.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No posts scheduled. Build something today!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {data.upcoming.map((post: UpcomingPostSummary, index: number) => (
                  <Fragment key={post._id}>
                    <ListItem sx={{ py: 2, px: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, mr: 2 }}>
                        <Avatar src={post.linkedinAccounts[0]?.avatar} sx={{ width: 36, height: 36 }} />
                        <Box>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600, maxWidth: { xs: 200, sm: 400 }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {post.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            To account: <strong>{post.linkedinAccounts[0]?.name}</strong>
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={new Date(post.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ borderRadius: '6px' }}
                        />
                        <Button size="small" variant="outlined" onClick={() => navigate(`/compose?edit=${post._id}`)}>
                          Edit
                        </Button>
                      </Box>
                    </ListItem>
                    {index < data.upcoming.length - 1 && <Divider />}
                  </Fragment>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        {/* Right Column: Recent Activity Feed */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Publishing Feed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Most recent automated publishing actions.
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {data.activities.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No publishing history logs found.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {data.activities.map((act: ActivityFeedItem) => (
                    <ListItem key={act._id} sx={{ px: 3, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: act.status === 'published' ? 'success.main' : 'error.main', color: '#ffffff' }}>
                          {act.status === 'published' ? <CheckCircleIcon /> : <ErrorIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {act.status === 'published' ? 'Published successfully' : 'Publishing failed'}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 220 }}>
                              "{act.content}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {new Date(act.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
