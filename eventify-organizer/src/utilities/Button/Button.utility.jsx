/**
 * Button Component
 *
 * A customizable button component with support for:
 * - Variants (primary, secondary, danger, etc.)
 * - Loading state with spinner
 * - Optional icon
 * - Dynamic sizing (width, height)
 *
 * @component
 * @param {Object} props - Component props.
 * @param {function} props.onPress - Function triggered when the button is clicked.
 * @param {string} props.title - The text label of the button.
 * @param {boolean} [props.loading=false] - Whether to show a loading spinner inside the button.
 * @param {Object} [props.style] - Inline style overrides for the button container.
 * @param {Object} [props.textStyle] - Inline style overrides for the button text.
 * @param {string|number} [props.width] - Custom width of the button (default: "auto").
 * @param {string|number} [props.height] - Custom height of the button (default: "auto").
 * @param {boolean} [props.disabled=false] - Disables the button when true.
 * @param {string} [props.variant="btn-primary"] - CSS variant class for styling (e.g., "btn-primary", "btn-secondary").
 * @param {React.ReactNode} [props.icon] - Optional icon displayed before the text.
 *
 * @example
 * // Primary button with icon
 * <Button
 *   title="Submit"
 *   onPress={() => console.log("Clicked")}
 *   variant="btn-primary"
 *   icon={<i className="fas fa-check"></i>}
 * />
 *
 * @example
 * // Loading button
 * <Button title="Loading..." loading={true} />
 */

import Loader from "../Loader/Loader.utility.jsx";
import "../../styles/global.styles.css";
import "./Button.utility.css";

const Button = ({
  onPress,
  title,
  loading,
  style,
  textStyle,
  width,
  disabled,
  height,
  variant,
  icon,
}) => {
  return (
    <section id="button">
      <button
        className={`custom-button ${variant || "btn-primary"} ${
          disabled ? "disabled" : ""
        }`}
        onClick={onPress}
        style={{
          ...style,
          width: width || "auto",
          height: height || "auto",
        }}
        disabled={disabled}
      >
        {loading ? (
          <Loader loading={loading} size={20} color="#fff" />
        ) : (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              ...textStyle,
            }}
          >
            {icon && <span className="button-icon">{icon}</span>}
            {title}
          </span>
        )}
      </button>
    </section>
  );
};

export default Button;
