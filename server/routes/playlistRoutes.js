const express = require("express");
const {
  addPlaylist,
  getPlaylists,
  getPlaylistById,
} = require("../controllers/playlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/", addPlaylist);
router.get("/", getPlaylists);
router.get("/:playlistId", getPlaylistById);

module.exports = router;
