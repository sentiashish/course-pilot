const express = require("express");
const { youtubeApiKey } = require("../config/env");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    integrations: {
      youtubeConfigured: Boolean(
        youtubeApiKey &&
          !/replace_with|your_.*_key|your_.*_here/i.test(String(youtubeApiKey))
      ),
    },
  });
});

module.exports = router;
