/**
 * Enhanced Card Component
 *
 * A reusable card component for displaying stats, icons, and titles.
 * Includes interactive hover effects, animations, and customizable backgrounds.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.title - Title text displayed at the top of the card.
 * @param {Array<{ label: string, value: string|number }>} [props.stats=[]] - Array of stat objects to display inside the card.
 * @param {function} [props.onClick] - Optional click handler for the entire card.
 * @param {React.ReactNode} [props.icon] - Optional icon element displayed next to the title.
 * @param {string} [props.customClassName] - Optional custom class name for styling overrides.
 * @param {string} [props.gradientType] - Optional gradient type ('ocean', 'sunset', 'forest', 'lavender', 'custom')
 * @param {string} [props.customGradient] - Custom gradient string when gradientType is 'custom'
 * @param {boolean} [props.hoverEffect=true] - Whether to enable hover effects
 * @param {string} [props.size='medium'] - Card size ('small', 'medium', 'large')
 *
 * @example
 * // Simple stats card with ocean gradient
 * <Card
 *   title="Daily Sales"
 *   stats={[
 *     { label: "Orders", value: 120 },
 *     { label: "Revenue", value: "$1,250" }
 *   ]}
 *   icon={<i className="fas fa-coffee"></i>}
 *   onClick={() => console.log("Card clicked")}
 *   gradientType="ocean"
 * />
 */

import { useState, useEffect } from "react";
import "../../styles/global.styles.css";
import "./Card.utility.css";

const Card = ({
  title,
  stats = [],
  onClick,
  icon,
  customClassName = "",
  gradientType = "",
  customGradient,
  hoverEffect = true,
  size = "medium",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && onClick) {
      onClick();
    }
  };

  return (
    <article
      className={`card-container ${customClassName} ${size} ${
        hoverEffect ? "with-hover" : ""
      }`}
      onClick={onClick}
      onKeyPress={handleKeyPress}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : "article"}
      aria-label={onClick ? `Click to interact with ${title} card` : title}
    >
      <div
        className={`card custom-card ${gradientType} ${
          isMounted ? "mounted" : ""
        }`}
        style={
          gradientType === "custom" && customGradient
            ? { background: customGradient }
            : {}
        }
      >
        <div className="card-body">
          {/* Card header with title and optional icon */}
          <div className="card-header">
            <h3 className="card-title">{title}</h3>
            {icon && <div className="card-icon">{icon}</div>}
          </div>

          {/* Card stats list */}
          <div className="card-stats">
            {stats.length > 0 ? (
              stats.map((stat, index) => (
                <div className="stat-item" key={index}>
                  <span className="stat-label">{stat.label}:</span>
                  <span className="stat-number">{stat.value}</span>
                </div>
              ))
            ) : (
              <span className="no-stats">No stats available</span>
            )}
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
    </article>
  );
};

export default Card;
