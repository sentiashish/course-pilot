import { secondsToHuman } from "../utils/helpers";

const VideoCard = ({ video, onToggleComplete, onWeightChange }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{video.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Duration: {secondsToHuman(video.durationSeconds)}
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Done
          <input
            type="checkbox"
            checked={video.isCompleted}
            onChange={(event) => onToggleComplete(video._id, event.target.checked)}
          />
        </label>
      </div>

      <div className="mt-3">
        <label className="text-sm text-slate-600 dark:text-slate-300">Weight</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
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
