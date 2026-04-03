import { Play, Zap, TrendingUp, Calendar } from "lucide-react";

const EmptyPlaylistState = ({ onCtaClick }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Play size={48} strokeWidth={1.5} />
      </div>

      <h3 className="empty-state-heading">Start your learning journey</h3>
      <p className="empty-state-description">
        Import a YouTube playlist to begin tracking your progress and staying accountable to your study goals.
      </p>

      <div className="empty-state-benefits">
        <article className="benefit-item">
          <div className="benefit-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <strong>Track Progress</strong>
            <p>See raw vs. true progress with weighted video importance</p>
          </div>
        </article>

        <article className="benefit-item">
          <div className="benefit-icon">
            <Zap size={20} />
          </div>
          <div>
            <strong>Stay Motivated</strong>
            <p>Build streaks and see your estimated completion date</p>
          </div>
        </article>

        <article className="benefit-item">
          <div className="benefit-icon">
            <Calendar size={20} />
          </div>
          <div>
            <strong>Smart Pacing</strong>
            <p>Set daily study minutes and get pace recommendations</p>
          </div>
        </article>
      </div>

      <button className="btn btn-primary empty-state-cta" onClick={onCtaClick}>
        Import your first playlist
      </button>
    </div>
  );
};

export default EmptyPlaylistState;
