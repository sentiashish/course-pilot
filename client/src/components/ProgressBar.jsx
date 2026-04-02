const ProgressBar = ({ label, value, tone = "success" }) => {
  const safeValue = Math.max(0, Math.min(Number(value || 0), 100));

  return (
    <div className="progress-item">
      <div className="progress-head">
        <span className="progress-label">{label}</span>
        <span className="progress-value">{safeValue}%</span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${tone}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
