const Playlist = require("../models/Playlist");
const Video = require("../models/Video");
const asyncHandler = require("../utils/asyncHandler");
const {
  extractPlaylistId,
  getPlaylistDetails,
  getPlaylistVideos,
} = require("../utils/youtubeService");

const addPlaylist = asyncHandler(async (req, res) => {
  const { playlistUrl } = req.body;
  const cleanPlaylistUrl = String(playlistUrl || "").trim();

  if (!cleanPlaylistUrl) {
    const error = new Error("Invalid playlist link");
    error.statusCode = 400;
    throw error;
  }

  const youtubePlaylistId = extractPlaylistId(cleanPlaylistUrl);
  const existing = await Playlist.findOne({
    user: req.user._id,
    youtubePlaylistId,
  });

  if (existing) {
    const error = new Error("Playlist already added");
    error.statusCode = 409;
    throw error;
  }

  const playlistDetails = await getPlaylistDetails(youtubePlaylistId);
  const videos = await getPlaylistVideos(youtubePlaylistId);

  const totalDurationSeconds = videos.reduce(
    (sum, video) => sum + (video.durationSeconds || 0),
    0
  );

  const playlist = await Playlist.create({
    user: req.user._id,
    youtubePlaylistId,
    title: playlistDetails.title,
    description: playlistDetails.description,
    thumbnailUrl: playlistDetails.thumbnailUrl,
    totalDurationSeconds,
  });

  if (videos.length > 0) {
    await Video.insertMany(
      videos.map((video) => ({
        ...video,
        playlist: playlist._id,
      }))
    );
  }

  res.status(201).json({
    success: true,
    message: "Playlist imported successfully",
    data: { playlistId: playlist._id },
  });
});

const getPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: playlists,
  });
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.playlistId,
    user: req.user._id,
  });

  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }

  const videos = await Video.find({ playlist: playlist._id }).sort({ position: 1 });

  res.json({
    success: true,
    data: {
      playlist,
      videos,
    },
  });
});

module.exports = {
  addPlaylist,
  getPlaylists,
  getPlaylistById,
};
