const express = require("express");
const {
  updateVideoProgress,
  getPlaylistAnalytics,
  updateDailyStudyMinutes,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.patch("/video/:videoId", updateVideoProgress);
router.get("/playlist/:playlistId", getPlaylistAnalytics);
router.patch("/study-minutes", updateDailyStudyMinutes);

module.exports = router;
