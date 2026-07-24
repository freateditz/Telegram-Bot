const prisma = require('../database/prisma');

const trackEvent = async ({ userId, projectId, resourceId, eventType, metadata }) => {
  try {
    if (!userId || !eventType) {
      throw new Error('userId and eventType are required');
    }

    await prisma.analyticsEvent.create({
      data: {
        userId,
        projectId,
        resourceId,
        eventType,
        metadata,
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
