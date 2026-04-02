const calculatePlaylistMetrics = (videos = []) => {
  const safeVideos = Array.isArray(videos) ? videos : [];

  const totalDurationSeconds = safeVideos.reduce(
    (sum, video) => sum + (video.durationSeconds || 0),
    0
  );

  const watchedDurationSeconds = safeVideos.reduce(
    (sum, video) => sum + (video.isCompleted ? video.durationSeconds || 0 : 0),
    0
  );

  const totalWeightedPoints = safeVideos.reduce(
    (sum, video) => sum + (video.weight || 1),
    0
  );

  const completedWeightedPoints = safeVideos.reduce(
    (sum, video) => sum + (video.isCompleted ? video.weight || 1 : 0),
    0
  );

  const rawProgressPercent =
    totalDurationSeconds > 0
      ? Number(((watchedDurationSeconds / totalDurationSeconds) * 100).toFixed(2))
      : 0;

  const trueProgressPercent =
    totalWeightedPoints > 0
      ? Number(((completedWeightedPoints / totalWeightedPoints) * 100).toFixed(2))
      : 0;

  const remainingDurationSeconds = Math.max(
    totalDurationSeconds - watchedDurationSeconds,
    0
  );

  return {
    totalDurationSeconds,
    watchedDurationSeconds,
    remainingDurationSeconds,
    rawProgressPercent,
    trueProgressPercent,
    totalWeightedPoints,
    completedWeightedPoints,
  };
};

const estimateCompletionDays = (remainingSeconds, dailyStudyMinutes) => {
  const safeDailyMinutes = Math.max(Number(dailyStudyMinutes) || 0, 1);
  const dailyStudySeconds = safeDailyMinutes * 60;
  return Math.ceil(remainingSeconds / dailyStudySeconds);
};

const updateStreak = (lastStudyDate, currentStreak, completionDate = new Date()) => {
  if (!lastStudyDate) {
    return { streakCount: 1, lastStudyDate: completionDate };
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const previous = new Date(lastStudyDate);
  previous.setHours(0, 0, 0, 0);

  const current = new Date(completionDate);
  current.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((current - previous) / oneDayMs);

  if (diffDays === 0) {
    return { streakCount: currentStreak || 1, lastStudyDate };
  }

  if (diffDays === 1) {
    return { streakCount: (currentStreak || 0) + 1, lastStudyDate: completionDate };
  }

  return { streakCount: 1, lastStudyDate: completionDate };
};

module.exports = {
  calculatePlaylistMetrics,
  estimateCompletionDays,
  updateStreak,
};
