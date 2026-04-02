import { secondsToHuman } from "../utils/helpers";

const VideoCard = ({ video, onToggleComplete, onWeightChange }) => {
  return (
    <article className="video-card">
      <div className="video-head">
        <div>
          <h3 className="video-title">{video.title}</h3>
          <p className="video-meta">
            Duration: {secondsToHuman(video.durationSeconds)}
          </p>
        </div>
        <label className="video-done-toggle">
          Done
          <input
            type="checkbox"
            checked={video.isCompleted}
            onChange={(event) => onToggleComplete(video._id, event.target.checked)}
          />
        </label>
      </div>

      <div className="video-weight">
        <label>Weight</label>
        <input
          className="video-weight-input"
          type="number"
          min="0.25"
          max="5"
          step="0.25"
          value={video.weight}
          onChange={(event) => onWeightChange(video._id, Number(event.target.value))}
        />
      </div>
    </article>
  );
};

export default VideoCard;
