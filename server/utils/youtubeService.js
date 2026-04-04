const axios = require("axios");
const { youtubeApiKey } = require("../config/env");

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = youtubeApiKey;
const PLACEHOLDER_KEY_PATTERN = /replace_with|your_.*_key|your_.*_here/i;

const createAppError = (message, statusCode = 500, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
};

const buildYouTubeRequest = () => ({
  timeout: 10000,
  params: {
    key: YOUTUBE_API_KEY,
  },
});

const ensureYouTubeApiKey = () => {
  if (!YOUTUBE_API_KEY) {
    throw createAppError("API key not configured", 500, "YOUTUBE_API_KEY_MISSING");
  }

  if (PLACEHOLDER_KEY_PATTERN.test(String(YOUTUBE_API_KEY))) {
    throw createAppError("API key not configured", 500, "YOUTUBE_API_KEY_PLACEHOLDER");
  }
};

const normalizeYouTubeError = (error, fallbackMessage) => {
  const reason = error.response?.data?.error?.errors?.[0]?.reason;
  const upstreamMessage = String(error.response?.data?.error?.message || "");

  if (["keyInvalid", "forbidden"].includes(reason) || /api key/i.test(upstreamMessage)) {
    return createAppError("API key not configured", 500, "YOUTUBE_API_KEY_INVALID");
  }

  if (
    [
      "quotaExceeded",
      "dailyLimitExceeded",
      "dailyLimitExceededUnreg",
      "userRateLimitExceeded",
      "rateLimitExceeded",
    ].includes(reason)
  ) {
    return createAppError("YouTube quota exceeded. Please try again later.", 429, "YOUTUBE_QUOTA_EXCEEDED");
  }

  if (["playlistNotFound", "notFound"].includes(reason)) {
    return createAppError("Invalid playlist link", 404, "YOUTUBE_PLAYLIST_NOT_FOUND");
  }

  if (["invalidPlaylistId", "invalidParameter", "badRequest"].includes(reason)) {
    return createAppError("Invalid playlist link", 400, "YOUTUBE_PLAYLIST_INVALID");
  }

  if (error.code === "ECONNABORTED") {
    return createAppError("YouTube request timed out. Please try again.", 504, "YOUTUBE_TIMEOUT");
  }

  return createAppError(fallbackMessage || "Unable to fetch data from YouTube", 502, "YOUTUBE_UPSTREAM_ERROR");
};

const extractPlaylistId = (url) => {
  try {
    const raw = String(url || "").trim();
    if (!raw) {
      throw createAppError("Invalid playlist link", 400, "PLAYLIST_URL_EMPTY");
    }

    // Allow direct playlist IDs as input.
    if (/^[A-Za-z0-9_-]{10,}$/.test(raw) && !raw.includes("http")) {
      return raw;
    }

    const parsed = new URL(raw);
    const hostname = parsed.hostname.toLowerCase();
    const isYouTubeHost =
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com" ||
      hostname === "youtu.be";

    if (!isYouTubeHost) {
      throw createAppError("Invalid playlist link", 400, "PLAYLIST_URL_HOST_INVALID");
    }

    const listId = parsed.searchParams.get("list");
    if (!listId) {
      throw createAppError("Invalid playlist link", 400, "PLAYLIST_URL_LIST_MISSING");
    }

    return listId;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createAppError("Invalid playlist link", 400, "PLAYLIST_URL_INVALID");
  }
};

const parseDurationToSeconds = (isoDuration) => {
  if (typeof isoDuration !== "string") {
    return 0;
  }

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return 0;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
};

const getPlaylistDetails = async (playlistId) => {
  ensureYouTubeApiKey();

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
      ...buildYouTubeRequest(),
      params: {
        ...buildYouTubeRequest().params,
        part: "snippet",
        id: playlistId,
      },
    });

    const playlist = response.data.items?.[0];
    if (!playlist) {
      const error = new Error("Playlist not found on YouTube");
      error.statusCode = 404;
      throw error;
    }

    return {
      title: playlist.snippet.title,
      description: playlist.snippet.description || "",
      thumbnailUrl: playlist.snippet.thumbnails?.high?.url || "",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw normalizeYouTubeError(error, "Unable to load playlist details from YouTube");
  }
};

const getPlaylistVideos = async (playlistId) => {
  ensureYouTubeApiKey();

  let nextPageToken = "";
  const videos = [];

  try {
    do {
      const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        ...buildYouTubeRequest(),
        params: {
          ...buildYouTubeRequest().params,
          part: "snippet,contentDetails",
          playlistId,
          maxResults: 50,
          pageToken: nextPageToken || undefined,
        },
      });

      const items = response.data.items || [];
      items.forEach((item) => {
        const videoId = item.contentDetails?.videoId;
        if (!videoId) {
          return;
        }

        videos.push({
          youtubeVideoId: videoId,
          title: item.snippet?.title || "Untitled Video",
          thumbnailUrl: item.snippet?.thumbnails?.medium?.url || "",
          position: item.snippet?.position ?? videos.length,
        });
      });

      nextPageToken = response.data.nextPageToken || "";
    } while (nextPageToken);
  } catch (error) {
    throw normalizeYouTubeError(error, "Unable to load playlist videos from YouTube");
  }

  const ids = [...new Set(videos.map((video) => video.youtubeVideoId))];

  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    try {
      const durationResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        ...buildYouTubeRequest(),
        params: {
          ...buildYouTubeRequest().params,
          part: "contentDetails",
          id: chunk.join(","),
        },
      });

      const durationMap = new Map(
        (durationResponse.data.items || []).map((item) => [
          item.id,
          parseDurationToSeconds(item.contentDetails?.duration || "PT0S"),
        ])
      );

      videos.forEach((video) => {
        if (durationMap.has(video.youtubeVideoId)) {
          video.durationSeconds = durationMap.get(video.youtubeVideoId);
        }
      });
    } catch (error) {
      throw normalizeYouTubeError(error, "Unable to load video durations from YouTube");
    }
  }

  return videos;
};

module.exports = {
  extractPlaylistId,
  getPlaylistDetails,
  getPlaylistVideos,
};
