// Loader.jsx
import "./Loder.css";
const Loader = ({ text = "Loading your workspace" }) => (
  <div className="jd-loader" role="status" aria-label="Loading">
    <div className="jd-stage" aria-hidden="true">
      <span className="jd-letter jd-j">J</span>
      <span className="jd-letter jd-d">D</span>
    </div>
    <div className="jd-shadow-row" aria-hidden="true">
      <div className="jd-shadow" />
      <div className="jd-shadow" />
    </div>
    <div className="jd-dots" aria-hidden="true">
      <div className="jd-dot" />
      <div className="jd-dot" />
      <div className="jd-dot" />
    </div>
    <p className="jd-text">{text}</p>
  </div>
);

export default Loader;