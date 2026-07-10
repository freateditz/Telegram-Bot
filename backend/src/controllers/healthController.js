function healthCheck(req, res) {
  res.json({ ok: true, service: "backend", status: "healthy" });
}

module.exports = {
  healthCheck,
};