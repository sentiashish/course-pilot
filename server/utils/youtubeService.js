const axios = require("axios");

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const extractPlaylistId = (url) => {
  try {
    const parsed = new URL(url);
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
  const response = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
    params: {
      part: "snippet",
      id: playlistId,
      key: process.env.YOUTUBE_API_KEY,
    },
  });

  const playlist = response.data.items?.[0];
  if (!playlist) {
    throw new Error("Playlist not found on YouTube");
  }

  return {
    title: playlist.snippet.title,
    description: playlist.snippet.description || "",
    thumbnailUrl: playlist.snippet.thumbnails?.high?.url || "",
  };
};

const getPlaylistVideos = async (playlistId) => {
  let nextPageToken = "";
  const videos = [];

  do {
    const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: "snippet,contentDetails",
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken || undefined,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const items = response.data.items || [];
    items.forEach((item, index) => {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) {
        return;
      }

      videos.push({
        youtubeVideoId: videoId,
        title: item.snippet?.title || "Untitled Video",
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url || "",
        position: item.snippet?.position ?? videos.length + index,
      });
    });

    nextPageToken = response.data.nextPageToken || "";
  } while (nextPageToken);

  const ids = videos.map((video) => video.youtubeVideoId);

  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const durationResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: "contentDetails",
        id: chunk.join(","),
        key: process.env.YOUTUBE_API_KEY,
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
  }

  return videos;
};

module.exports = {
  extractPlaylistId,
  getPlaylistDetails,
  getPlaylistVideos,
};
