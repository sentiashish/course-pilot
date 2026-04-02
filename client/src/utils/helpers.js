export const secondsToHuman = (seconds = 0) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const classNames = (...values) => values.filter(Boolean).join(" ");
