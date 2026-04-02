const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    youtubePlaylistId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    totalDurationSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

playlistSchema.index({ user: 1, youtubePlaylistId: 1 }, { unique: true });

module.exports = mongoose.model("Playlist", playlistSchema);
