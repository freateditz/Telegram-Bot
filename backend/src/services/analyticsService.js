const prisma = require('../database/prisma');

const trackEvent = async ({ userId, projectId, resourceId, eventType, metadata }) => {
  try {
    if (!userId || !eventType) {
      throw new Error('userId and eventType are required');
    }

    // Resolve or upsert the User record so that AnalyticsEvent.userId stores the internal
    // 32-bit User.id instead of raw Telegram ID which can exceed signed 32-bit integer limits (> 2.14B).
    const telegramId = String(userId).trim();
    const user = await prisma.user.upsert({
      where: { telegramId },
      create: { telegramId },
      update: {},
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        projectId: projectId ? Number(projectId) : null,
        resourceId: resourceId ? Number(resourceId) : null,
        eventType,
        metadata: metadata || null,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  trackEvent,
};
