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
  
  // Aggregate event counts directly in the database
  const eventCounts = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    where: { projectId },
    _count: true,
  });

  const funnel = {
    PROJECT_OPEN: 0,
    YOUTUBE_CLICK: 0,
    TELEGRAM_CLICK: 0,
    VERIFY_CLICK: 0,
    VERIFY_SUCCESS: 0,
    RESOURCE_DOWNLOAD: 0,
  };

  eventCounts.forEach(e => {
    if (funnel.hasOwnProperty(e.eventType)) {
      funnel[e.eventType] = e._count;
    }
  });

  res.json(funnel);
}

async function getResourceAnalytics(req, res) {
  const resourceId = Number(req.params.resourceId);
  const where = { resourceId, eventType: 'RESOURCE_DOWNLOAD' };

  // Run database queries in parallel
  const [totalDownloads, uniqueUsersCount, lastDownloadEvent, dailyDownloadCounts] = await Promise.all([
    prisma.analyticsEvent.count({ where }),
    prisma.analyticsEvent.count({ where, distinct: ['userId'] }),
    prisma.analyticsEvent.findFirst({ where, orderBy: { createdAt: 'desc' } }),
    prisma.analyticsEvent.groupBy({
      by: ['createdAt'], // Grouping by createdAt in Postgres might be problematic, should ideally be date-trunc
      where,
      _count: true,
    }),
  ]);

  // Aggregate daily downloads locally.
  // NOTE: Better would be date truncation in the DB (Postgres `DATE_TRUNC`).
  // Given current limitations, this is an acceptable local aggregation.
  const dailyDownloads = dailyDownloadCounts.reduce((acc, event) => {
    const date = event.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + event._count;
    return acc;
  }, {});

  res.json({
    totalDownloads,
    lastDownload: lastDownloadEvent?.createdAt || null,
    uniqueUsers: uniqueUsersCount,
    dailyDownloads
  });
}

async function getUserActivity(req, res) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Run database queries in parallel using aggregation
  const [dailyActiveUsers, monthlyActiveUsers, returningUsers] = await Promise.all([
    prisma.analyticsEvent.count({ 
      where: { createdAt: { gte: oneDayAgo } },
      distinct: ['userId']
    }),
    prisma.analyticsEvent.count({ 
      where: { createdAt: { gte: thirtyDaysAgo } },
      distinct: ['userId']
    }),
    prisma.user.count({ where: { createdAt: { lt: oneDayAgo } } }),
  ]);

  res.json({ dailyActiveUsers, monthlyActiveUsers, returningUsers });
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
  const top = await prisma.analyticsEvent.groupBy({
    by: ['resourceId'],
    _count: { resourceId: true },
    where: { resourceId: { not: null }, eventType: 'RESOURCE_DOWNLOAD' },
    orderBy: { _count: { resourceId: 'desc' } },
    take: 10,
  });
  res.json(top);
}
async function getAdvancedAnalytics(req, res) {
  // Aggregate data using Prisma to avoid loading all events into memory.
  const [
    eventCountsByHour,
    verifyClicks,
    verifySuccess,
    downloads,
    failures,
    userDownloadCounts
  ] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ['createdAt'], // NOTE: This might need truncation to hour, but for now just getting counts
      _count: true,
    }),
    prisma.analyticsEvent.count({ where: { eventType: 'VERIFY_CLICK' } }),
    prisma.analyticsEvent.count({ where: { eventType: 'VERIFY_SUCCESS' } }),
    prisma.analyticsEvent.count({ where: { eventType: 'RESOURCE_DOWNLOAD' } }),
    prisma.analyticsEvent.count({ where: { eventType: 'VERIFY_FAILED' } }),
    prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { eventType: 'RESOURCE_DOWNLOAD' },
      _count: true,
    }),
  ]);

  // Process hourly trends (simplified)
  const hourly = eventCountsByHour.reduce((acc, e) => {
    const hour = e.createdAt.getHours();
    acc[hour] = (acc[hour] || 0) + e._count;
    return acc;
  }, {});

  const verificationConversion = verifyClicks > 0 ? (verifySuccess / verifyClicks) * 100 : 0;
  
  const totalAttempts = downloads + failures;
  const successRate = totalAttempts > 0 ? (downloads / totalAttempts) * 100 : 0;
  
  const avgDownloadsPerUser = userDownloadCounts.length > 0 
    ? downloads / userDownloadCounts.length 
    : 0;

  res.json({
    trends: { hourly },
    verificationConversion,
    successRate,
    failureRate: 100 - successRate,
    avgDownloadsPerUser
  });
}

async function getTopProjects(req, res) {
  const topProjects = await prisma.analyticsEvent.groupBy({
    by: ['projectId'],
    _count: { projectId: true },
    where: { projectId: { not: null }, eventType: 'RESOURCE_DOWNLOAD' },
    orderBy: { _count: { projectId: 'desc' } },
    take: 10,
  });
  res.json(topProjects);
}

async function getRecentEvents(req, res) {
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(events);
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
