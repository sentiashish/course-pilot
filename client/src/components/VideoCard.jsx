import { Loader2, Check } from "lucide-react";
import { secondsToHuman } from "../utils/helpers";

const VideoCard = ({ video, onToggleComplete, onWeightChange, loadingVideoId }) => {
  const isLoading = loadingVideoId === video._id;
  const isCompleted = video.isCompleted;

  return (
    <article className={`video-card ${isLoading ? "loading" : ""} ${isCompleted ? "completed" : ""}`}>
      <div className="video-card-content">
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-duration">{secondsToHuman(video.durationSeconds)}</p>
        </div>

        <div className="video-controls">
          <div className="video-weight-control">
            <label htmlFor={`weight-${video._id}`} className="weight-label">Weight</label>
            <div className="weight-input-group">
              <input
                id={`weight-${video._id}`}
                className="video-weight-input"
                type="number"
                min="0.25"
                max="5"
                step="0.25"
                value={video.weight}
                onChange={(event) => onWeightChange(video._id, Number(event.target.value))}
                disabled={isLoading}
                title={`Weight: ${video.weight}x`}
              />
              {isLoading && <Loader2 size={14} className="spinner" />}
            </div>
          </div>

          <button
            className={`video-done-button ${isCompleted ? "marked" : ""}`}
            onClick={() => onToggleComplete(video._id, !isCompleted)}
            disabled={isLoading}
            type="button"
            title={isCompleted ? "Mark as pending" : "Mark as completed"}
            aria-pressed={isCompleted}
          >
            {isLoading ? (
              <Loader2 size={16} className="spinner" />
            ) : isCompleted ? (
              <Check size={16} />
            ) : (
              <span className="empty-circle" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
