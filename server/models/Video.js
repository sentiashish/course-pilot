const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
      index: true,
    },
    youtubeVideoId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    position: {
      type: Number,
      required: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 1,
      min: 0.25,
      max: 5,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

videoSchema.index({ playlist: 1, youtubeVideoId: 1 }, { unique: true });

module.exports = mongoose.model("Video", videoSchema);
