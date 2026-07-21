const prisma = require("../database/prisma");
const HttpError = require("../utils/httpError");

/**
 * Channel CRUD. Channels are the source Telegram chats that hold
 * project file messages — the bot reads a message directly from a
 * channel via `copyMessage` and never needs to re-upload the file.
 */

const CHANNEL_ID_REGEX = /^-100\d{6,}$/;

function normalizeChannelId(raw) {
  if (raw === null || raw === undefined) return null;
  return String(raw).trim();
}

function normalizeUsername(raw) {
  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

async function listChannels() {
  return prisma.channel.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { projects: true } },
    },
  });
}

async function getChannel(id) {
  return prisma.channel.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });
}

async function getActiveChannel(id) {
  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    throw new HttpError(404, "Channel not found");
  }
  if (!channel.isActive) {
    throw new HttpError(400, "Channel is inactive");
  }
  return channel;
}

async function createChannel(payload) {
  const name = String(payload.name || "").trim();
  const channelId = normalizeChannelId(payload.channelId);
  const username = normalizeUsername(payload.username);
  const isActive = payload.isActive !== undefined ? Boolean(payload.isActive) : true;

  if (!name) {
    throw new HttpError(400, "Channel name is required");
  }
  if (!channelId) {
    throw new HttpError(400, "Channel ID is required");
  }
  if (!CHANNEL_ID_REGEX.test(channelId)) {
    throw new HttpError(
      400,
      "Channel ID must be a numeric chat id starting with -100 (e.g. -1002948573940)"
    );
  }

  const existing = await prisma.channel.findFirst({
    where: { OR: [{ name }, { channelId }] },
  });
  if (existing) {
    if (existing.name === name) {
      throw new HttpError(409, "A channel with this name already exists");
    }
    throw new HttpError(409, "A channel with this channelId already exists");
  }

  return prisma.channel.create({
    data: { name, channelId, username, isActive },
  });
}

async function updateChannel(id, payload) {
  const existing = await prisma.channel.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "Channel not found");
  }

  const data = {};

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw new HttpError(400, "Channel name cannot be empty");
    }
    const conflict = await prisma.channel.findFirst({
      where: { name, NOT: { id } },
    });
    if (conflict) {
      throw new HttpError(409, "A channel with this name already exists");
    }
    data.name = name;
  }

  if (payload.channelId !== undefined) {
    const channelId = normalizeChannelId(payload.channelId);
    if (!channelId) {
      throw new HttpError(400, "Channel ID cannot be empty");
    }
    if (!CHANNEL_ID_REGEX.test(channelId)) {
      throw new HttpError(
        400,
        "Channel ID must be a numeric chat id starting with -100 (e.g. -1002948573940)"
      );
    }
    const conflict = await prisma.channel.findFirst({
      where: { channelId, NOT: { id } },
    });
    if (conflict) {
      throw new HttpError(409, "A channel with this channelId already exists");
    }
    data.channelId = channelId;
  }

  if (payload.username !== undefined) {
    data.username = normalizeUsername(payload.username);
  }

  if (payload.isActive !== undefined) {
    data.isActive = Boolean(payload.isActive);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  return prisma.channel.update({
    where: { id },
    data,
    include: { _count: { select: { projects: true } } },
  });
}

async function deleteChannel(id) {
  const existing = await prisma.channel.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "Channel not found");
  }

  // Refuse to delete if any project still references this channel —
  // the project's `copyMessage` would silently break otherwise.
  const projectCount = await prisma.project.count({ where: { channelId: id } });
  if (projectCount > 0) {
    throw new HttpError(
      409,
      `Channel is referenced by ${projectCount} project(s). Reassign or delete those projects first.`
    );
  }

  return prisma.channel.delete({ where: { id } });
}

module.exports = {
  listChannels,
  getChannel,
  getActiveChannel,
  createChannel,
  updateChannel,
  deleteChannel,
};
