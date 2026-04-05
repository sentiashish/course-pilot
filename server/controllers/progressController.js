const User = require("../models/User");
const Playlist = require("../models/Playlist");
const Video = require("../models/Video");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const {
  calculatePlaylistMetrics,
  estimateCompletionDays,
  updateStreak,
} = require("../utils/progressUtils");

const updateVideoProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { isCompleted, weight } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    const error = new Error("Invalid video identifier");
    error.statusCode = 400;
    throw error;
  }

  const video = await Video.findById(videoId).populate("playlist");
  if (!video) {
    const error = new Error("Video not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(video.playlist.user) !== String(req.user._id)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (typeof weight !== "undefined") {
    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight) || numericWeight < 0.25 || numericWeight > 5) {
      const error = new Error("weight must be between 0.25 and 5");
      error.statusCode = 400;
      throw error;
    }

    video.weight = numericWeight;
  }

  if (typeof isCompleted === "boolean") {
    const wasCompleted = video.isCompleted;
    video.isCompleted = isCompleted;
    video.completedAt = isCompleted ? new Date() : null;

    if (!wasCompleted && isCompleted) {
      const streakResult = updateStreak(
        req.user.lastStudyDate,
        req.user.streakCount,
        video.completedAt
      );

      await User.findByIdAndUpdate(req.user._id, {
        streakCount: streakResult.streakCount,
        lastStudyDate: streakResult.lastStudyDate,
      });
    }
  }

  await video.save();

  res.json({
    success: true,
    message: "Video progress updated",
  });
});

const getPlaylistAnalytics = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.playlistId)) {
    const error = new Error("Invalid playlist identifier");
    error.statusCode = 400;
    throw error;
  }

  const playlist = await Playlist.findOne({
    _id: req.params.playlistId,
    user: req.user._id,
  });

  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }

  const videos = await Video.find({ playlist: playlist._id });
  const metrics = calculatePlaylistMetrics(videos);

  const daysRemaining = estimateCompletionDays(
    metrics.remainingDurationSeconds,
    req.user.dailyStudyMinutes
  );

  const suggestions = [];
  if (daysRemaining > 7) {
    suggestions.push("Increase daily study time by 15-20 minutes to reduce completion time.");
  }

  if (metrics.trueProgressPercent < metrics.rawProgressPercent) {
    suggestions.push("Focus on high-weight videos first to improve true progress faster.");
  }

  res.json({
    success: true,
    data: {
      playlistId: playlist._id,
      title: playlist.title,
      ...metrics,
      dailyStudyMinutes: req.user.dailyStudyMinutes,
      estimatedDaysRemaining: daysRemaining,
      predictionMessage: `You will finish this course in ${daysRemaining} day(s) at current pace.`,
      streakCount: req.user.streakCount,
      suggestions,
    },
  });
});

const updateDailyStudyMinutes = asyncHandler(async (req, res) => {
  const { dailyStudyMinutes } = req.body;
  const numericDailyStudyMinutes = Number(dailyStudyMinutes);

  if (!Number.isFinite(numericDailyStudyMinutes) || numericDailyStudyMinutes < 5 || numericDailyStudyMinutes > 720) {
    const error = new Error("dailyStudyMinutes must be between 5 and 720");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { dailyStudyMinutes: numericDailyStudyMinutes },
    { new: true }
  );

  res.json({
    success: true,
    data: {
      dailyStudyMinutes: user.dailyStudyMinutes,
    },
  });
});

module.exports = {
  updateVideoProgress,
  getPlaylistAnalytics,
  updateDailyStudyMinutes,
};
