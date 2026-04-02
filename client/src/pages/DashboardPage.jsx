import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import Sidebar from "../components/Sidebar";
import VideoCard from "../components/VideoCard";
import api from "../services/api";
import { secondsToHuman } from "../utils/helpers";

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

const DashboardPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(45);

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
    if (!playlistUrl.trim()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post("/playlists", { playlistUrl: playlistUrl.trim() });
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
                            <p className="muted">{secondsToHuman(playlist.totalDurationSeconds)}</p>
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
                          onChange={(event) => setDailyStudyMinutes(event.target.value)}
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
                    <h3>{analytics.title}</h3>
                    <p className="muted">{analytics.predictionMessage}</p>
                    <div className="form-grid" style={{ marginTop: "12px" }}>
                      <ProgressBar label="Raw progress" value={analytics.rawProgressPercent} />
                      <ProgressBar
                        label="True progress"
                        value={analytics.trueProgressPercent}
                        colorClass="bg-sky-500"
                      />
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
                    <h3>Videos</h3>
                    <div className="video-grid">
                      {playlistData.videos.map((video) => (
                        <VideoCard
                          key={video._id}
                          video={video}
                          onToggleComplete={handleToggleComplete}
                          onWeightChange={handleWeightChange}
                        />
                      ))}
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
