const analyticsService = require('../services/analyticsService');
const prisma = require('../database/prisma');

function health(req, res) {
  res.json({ ok: true, service: "analytics", status: "healthy" });
}

async function track(req, res) {
  const { userId, projectId, resourceId, eventType, metadata } = req.body;
  
  // Fire and forget, don't wait for completion to respond.
  analyticsService.trackEvent({ userId, projectId, resourceId, eventType, metadata });
  
  res.json({ success: true });
}

async function getOverview(req, res) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayUsers, newUsers, returningUsers, downloads, verifyClicks, verifySuccess] = await Promise.all([
    prisma.analyticsEvent.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: today } } }), // Simplified: assuming unique daily events = returning
    prisma.analyticsEvent.count({ where: { eventType: 'RESOURCE_DOWNLOAD' } }),
    prisma.analyticsEvent.count({ where: { eventType: 'VERIFY_CLICK' } }),
    prisma.analyticsEvent.count({ where: { eventType: 'VERIFY_SUCCESS' } }),
  ]);

  res.json({
    todayUsers,
    newUsers,
    returningUsers,
    downloads,
    verifyClicks,
    verifySuccess,
    youtubeClicks: 0, // Placeholder
    telegramClicks: 0, // Placeholder
  });
}

async function getDaily(req, res) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyEvents = await prisma.analyticsEvent.groupBy({
    by: ['createdAt'],
    _count: true,
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  res.json(dailyEvents);
}

async function getProjects(req, res) {
  const projects = await prisma.analyticsEvent.groupBy({
    by: ['projectId'],
    _count: { projectId: true },
    where: { projectId: { not: null } },
  });
  res.json(projects);
}

async function getProjectAnalytics(req, res) {
  const projectId = Number(req.params.projectId);
  const events = await prisma.analyticsEvent.findMany({
    where: { projectId },
  });

  const funnel = {
    PROJECT_OPEN: events.filter(e => e.eventType === 'PROJECT_OPEN').length,
    YOUTUBE_CLICK: events.filter(e => e.eventType === 'YOUTUBE_CLICK').length,
    TELEGRAM_CLICK: events.filter(e => e.eventType === 'TELEGRAM_CLICK').length,
    VERIFY_CLICK: events.filter(e => e.eventType === 'VERIFY_CLICK').length,
    VERIFY_SUCCESS: events.filter(e => e.eventType === 'VERIFY_SUCCESS').length,
    RESOURCE_DOWNLOAD: events.filter(e => e.eventType === 'RESOURCE_DOWNLOAD').length,
  };

  res.json(funnel);
}

async function getResourceAnalytics(req, res) {
  const resourceId = Number(req.params.resourceId);
  const events = await prisma.analyticsEvent.findMany({
    where: { resourceId, eventType: 'RESOURCE_DOWNLOAD' },
    orderBy: { createdAt: 'asc' }
  });

  const uniqueUsers = new Set(events.map(e => e.userId)).size;
  const lastDownload = events.length > 0 ? events[events.length - 1].createdAt : null;

  // Aggregate daily downloads
  const dailyDownloads = events.reduce((acc, event) => {
    const date = event.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalDownloads: events.length,
    lastDownload,
    uniqueUsers,
    dailyDownloads
  });
}

async function getUserActivity(req, res) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const activeEvents = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } }
  });

  const dailyUsers = new Set(activeEvents.filter(e => e.createdAt >= oneDayAgo).map(e => e.userId)).size;
  const monthlyUsers = new Set(activeEvents.map(e => e.userId)).size;
  const returningUsers = await prisma.user.count({ where: { createdAt: { lt: oneDayAgo } } });

  res.json({ dailyActiveUsers: dailyUsers, monthlyActiveUsers: monthlyUsers, returningUsers });
}

async function getTopDownloaders(req, res) {
  const top = await prisma.analyticsEvent.groupBy({
    by: ['userId'],
    _count: { userId: true },
    where: { eventType: 'RESOURCE_DOWNLOAD' },
    orderBy: { _count: { userId: 'desc' } },
    take: 10,
  });
  res.json(top);
}

async function searchUser(req, res) {
  const user = await prisma.user.findUnique({
    where: { telegramId: req.params.telegramId },
    include: { pendingProject: true }
  });
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const lastSeen = await prisma.analyticsEvent.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
  });

  res.json({...user, lastSeen: lastSeen?.createdAt});
}

async function getTopDownloadedResources(req, res) {
...
async function getAdvancedAnalytics(req, res) {
  const events = await prisma.analyticsEvent.findMany();
  
  // 1. Time Trends
  const hourly = events.reduce((acc, e) => {
    const hour = e.createdAt.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  
  // 2. Verification Conversion
  const verifyClicks = events.filter(e => e.eventType === 'VERIFY_CLICK').length;
  const verifySuccess = events.filter(e => e.eventType === 'VERIFY_SUCCESS').length;
  const verificationConversion = verifyClicks > 0 ? (verifySuccess / verifyClicks) * 100 : 0;
  
  // 3. Success/Failure Rates (simplified example)
  const downloads = events.filter(e => e.eventType === 'RESOURCE_DOWNLOAD').length;
  const failures = events.filter(e => e.eventType === 'VERIFY_FAILED').length;
  const totalAttempts = downloads + failures;
  const successRate = totalAttempts > 0 ? (downloads / totalAttempts) * 100 : 0;
  
  // 4. Avg Downloads per User
  const userDownloads = events.filter(e => e.eventType === 'RESOURCE_DOWNLOAD').reduce((acc, e) => {
    acc[e.userId] = (acc[e.userId] || 0) + 1;
    return acc;
  }, {});
  const avgDownloadsPerUser = Object.keys(userDownloads).length > 0 
    ? downloads / Object.keys(userDownloads).length 
    : 0;

  res.json({
    trends: { hourly },
    verificationConversion,
    successRate,
    failureRate: 100 - successRate,
    avgDownloadsPerUser
  });
}

module.exports = {
  health,
  track,
  getOverview,
  getDaily,
  getProjects,
  getProjectAnalytics,
  getResourceAnalytics,
  getUserActivity,
  getTopDownloaders,
  searchUser,
  getTopDownloadedResources,
  getTopProjects,
  getAdvancedAnalytics,
  getRecentEvents,
};
