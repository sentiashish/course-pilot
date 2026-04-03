const axios = require("axios");
const { youtubeApiKey } = require("../config/env");

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = youtubeApiKey;

const buildYouTubeRequest = () => ({
  timeout: 10000,
  params: {
    key: YOUTUBE_API_KEY,
  },
});

const ensureYouTubeApiKey = () => {
  if (!YOUTUBE_API_KEY) {
    const error = new Error("YouTube API key is not configured");
    error.statusCode = 500;
    throw error;
  }
};

const normalizeYouTubeError = (error, fallbackMessage) => {
  if (error.response?.data?.error?.message) {
    const nextError = new Error(error.response.data.error.message);
    nextError.statusCode = error.response.status || 502;
    return nextError;
  }

  const nextError = new Error(fallbackMessage);
  nextError.statusCode = error.code === "ECONNABORTED" ? 504 : 502;
  return nextError;
};

const extractPlaylistId = (url) => {
  try {
    const parsed = new URL(String(url).trim());
    const listId = parsed.searchParams.get("list");
    if (!listId) {
      throw new Error("Invalid YouTube playlist URL");
    }
    return listId;
  } catch (error) {
    throw new Error("Invalid playlist URL format");
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
