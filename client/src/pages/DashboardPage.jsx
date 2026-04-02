import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import Sidebar from "../components/Sidebar";
import VideoCard from "../components/VideoCard";
import api from "../services/api";
import { secondsToHuman } from "../utils/helpers";

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

const getPlaylistIdFromUrl = (playlistUrl) => {
  try {
    const parsed = new URL(playlistUrl);
    const listId = parsed.searchParams.get("list");
    return listId;
  } catch {
    return null;
  }
};

const ProgressTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      <strong>{point.name}</strong>
      <p>{point.value}% complete</p>
    </div>
  );
};

const DashboardPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(45);
  const [videoQuery, setVideoQuery] = useState("");
  const [videoFilter, setVideoFilter] = useState("all");

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [playlistData, setPlaylistData] = useState({ playlist: null, videos: [] });
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist._id === selectedPlaylistId),
    [playlists, selectedPlaylistId]
  );

  const progressChartData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        name: "Raw",
        value: Number(analytics.rawProgressPercent || 0),
        color: "#16a34a",
      },
      {
        name: "True",
        value: Number(analytics.trueProgressPercent || 0),
        color: "#2563eb",
      },
    ];
  }, [analytics]);

  const filteredVideos = useMemo(() => {
    const query = videoQuery.trim().toLowerCase();

    return (playlistData.videos || []).filter((video) => {
      const matchesQuery = !query || video.title.toLowerCase().includes(query);
      const matchesFilter =
        videoFilter === "all" ||
        (videoFilter === "done" && video.isCompleted) ||
        (videoFilter === "pending" && !video.isCompleted);

      return matchesQuery && matchesFilter;
    });
  }, [playlistData.videos, videoFilter, videoQuery]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/playlists");
        const items = response.data.data || [];
        setPlaylists(items);
        if (items.length > 0) {
          setSelectedPlaylistId(items[0]._id);
        }
      } catch (nextError) {
        setError(getErrorMessage(nextError));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedPlaylistId) {
        setPlaylistData({ playlist: null, videos: [] });
        setAnalytics(null);
        return;
      }

      try {
        const [playlistResponse, analyticsResponse] = await Promise.all([
          api.get(`/playlists/${selectedPlaylistId}`),
          api.get(`/progress/playlist/${selectedPlaylistId}`),
        ]);

        setPlaylistData(playlistResponse.data.data);
        setAnalytics(analyticsResponse.data.data);
        setDailyStudyMinutes(analyticsResponse.data.data.dailyStudyMinutes);
      } catch (nextError) {
        setError(getErrorMessage(nextError));
      }
    };

    loadDetails();
  }, [selectedPlaylistId]);

  const refreshPlaylists = async (nextSelectedId = null) => {
    const response = await api.get("/playlists");
    const items = response.data.data || [];
    setPlaylists(items);

    const fallbackId = items[0]?._id || "";
    setSelectedPlaylistId(nextSelectedId || selectedPlaylistId || fallbackId);
  };

  const handleAddPlaylist = async (event) => {
    event.preventDefault();
    const cleanUrl = playlistUrl.trim();
    if (!cleanUrl) {
      return;
    }

    if (!getPlaylistIdFromUrl(cleanUrl)) {
      setError("Please paste a valid YouTube playlist URL containing a list parameter.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post("/playlists", { playlistUrl: cleanUrl });
      const nextPlaylistId = response.data.data.playlistId;
      setPlaylistUrl("");
      await refreshPlaylists(nextPlaylistId);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (videoId, isCompleted) => {
    setError("");
    try {
      await api.patch(`/progress/video/${videoId}`, { isCompleted });

      setPlaylistData((prev) => ({
        ...prev,
        videos: prev.videos.map((video) =>
          video._id === videoId ? { ...video, isCompleted } : video
        ),
      }));

      if (selectedPlaylistId) {
        const analyticsResponse = await api.get(`/progress/playlist/${selectedPlaylistId}`);
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  const handleWeightChange = async (videoId, weight) => {
    if (!Number.isFinite(weight) || weight < 0.25 || weight > 5) {
      return;
    }

    setPlaylistData((prev) => ({
      ...prev,
      videos: prev.videos.map((video) => (video._id === videoId ? { ...video, weight } : video)),
    }));

    try {
      await api.patch(`/progress/video/${videoId}`, { weight });
      if (selectedPlaylistId) {
        const analyticsResponse = await api.get(`/progress/playlist/${selectedPlaylistId}`);
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  const handleStudyMinutesUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      await api.patch("/progress/study-minutes", { dailyStudyMinutes: Number(dailyStudyMinutes) });
      if (selectedPlaylistId) {
        const analyticsResponse = await api.get(`/progress/playlist/${selectedPlaylistId}`);
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)} />

          <section className="dashboard-content">
            <section className="panel">
              <h2>Import playlist</h2>
              <form className="form-grid" onSubmit={handleAddPlaylist}>
                <div className="field">
                  <label htmlFor="playlist-url">YouTube playlist URL</label>
                  <input
                    id="playlist-url"
                    type="url"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    value={playlistUrl}
                    onChange={(event) => setPlaylistUrl(event.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Importing..." : "Import playlist"}
                </button>
              </form>
            </section>

            {error && <p className="error-text">{error}</p>}

            {loading ? (
              <section className="panel">
                <p className="muted">Loading dashboard...</p>
              </section>
            ) : (
              <>
                <section className="grid-two">
                  <article className="panel">
                    <h3>Your playlists</h3>
                    {playlists.length === 0 ? (
                      <p className="muted">No playlists yet. Add one to begin.</p>
                    ) : (
                      <div className="playlist-list">
                        {playlists.map((playlist) => (
                          <button
                            key={playlist._id}
                            type="button"
                            className={`playlist-item ${
                              playlist._id === selectedPlaylistId ? "active" : ""
                            }`}
                            onClick={() => setSelectedPlaylistId(playlist._id)}
                          >
                            <strong>{playlist.title}</strong>
                            <p className="muted">
                              {secondsToHuman(playlist.totalDurationSeconds)} total
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </article>

                  <article className="panel">
                    <h3>Study pace</h3>
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="study-minutes">Daily study minutes</label>
                        <input
                          id="study-minutes"
                          type="number"
                          min="5"
                          max="720"
                          value={dailyStudyMinutes}
                          onChange={(event) => setDailyStudyMinutes(Number(event.target.value))}
                        />
                      </div>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={handleStudyMinutesUpdate}
                        disabled={saving}
                      >
                        Save study target
                      </button>
                    </div>
                  </article>
                </section>

                {selectedPlaylist && analytics && (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>{analytics.title}</h3>
                        <p className="muted">{analytics.predictionMessage}</p>
                      </div>
                      {playlistData.playlist?.thumbnailUrl ? (
                        <img
                          className="playlist-thumb"
                          src={playlistData.playlist.thumbnailUrl}
                          alt={analytics.title}
                        />
                      ) : null}
                    </div>

                    <div className="stats-grid">
                      <article className="stat-card">
                        <p className="muted">Completed</p>
                        <strong>
                          {analytics.completedCount}/{analytics.totalCount}
                        </strong>
                      </article>
                      <article className="stat-card">
                        <p className="muted">Remaining Time</p>
                        <strong>{secondsToHuman(analytics.remainingDurationSeconds)}</strong>
                      </article>
                      <article className="stat-card">
                        <p className="muted">Streak</p>
                        <strong>{analytics.streakCount} day(s)</strong>
                      </article>
                      <article className="stat-card">
                        <p className="muted">ETA</p>
                        <strong>{analytics.estimatedDaysRemaining} day(s)</strong>
                      </article>
                    </div>

                    <div className="grid-two analytics-layout">
                      <div className="form-grid">
                        <ProgressBar label="Raw progress" value={analytics.rawProgressPercent} />
                        <ProgressBar
                          label="True progress"
                          value={analytics.trueProgressPercent}
                          tone="info"
                        />
                      </div>
                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={progressChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip content={<ProgressTooltip />} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                              {progressChartData.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {analytics.suggestions?.length > 0 && (
                      <ul className="suggestion-list">
                        {analytics.suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {playlistData.videos?.length > 0 && (
                  <section className="panel">
                    <div className="panel-head">
                      <h3>Videos</h3>
                      <p className="muted">{filteredVideos.length} shown</p>
                    </div>

                    <div className="video-controls">
                      <input
                        className="video-search"
                        type="search"
                        placeholder="Search video title"
                        value={videoQuery}
                        onChange={(event) => setVideoQuery(event.target.value)}
                      />
                      <select
                        className="video-filter"
                        value={videoFilter}
                        onChange={(event) => setVideoFilter(event.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>

                    <div className="video-grid">
                      {filteredVideos.map((video) => (
                        <VideoCard
                          key={video._id}
                          video={video}
                          onToggleComplete={handleToggleComplete}
                          onWeightChange={handleWeightChange}
                        />
                      ))}
                      {filteredVideos.length === 0 && (
                        <p className="muted">No videos match the current filter.</p>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
