const asyncHandler = require("../utils/asyncHandler");
const verificationService = require("../services/verificationService");

const getPrompt = asyncHandler(async (req, res) => {
    const payload = await verificationService.getVerificationPrompt();
    res.json(payload);
});

const getStatus = asyncHandler(async (req, res) => {
    const payload = await verificationService.getVerificationStatus(req.params.userId);
    res.json(payload);
});

const checkMember = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};

    if (!userId) {
        return res.status(400).json({ ok: false, error: "userId is required" });
    }

    const joined = await verificationService.isChannelMember(userId);

    res.json({ ok: true, joined });
});

const markVerified = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};

    if (!userId) {
        return res.status(400).json({ ok: false, error: "userId is required" });
    }

    const item = await verificationService.markVerified(userId);

    res.json({ ok: true, item });
});

const unverify = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};

    if (!userId) {
        return res.status(400).json({ ok: false, error: "userId is required" });
    }

    await verificationService.markUnverified(userId);

    res.json({ ok: true });
});

module.exports = {
    getPrompt,
    getStatus,
    checkMember,
    markVerified,
    unverify,
};