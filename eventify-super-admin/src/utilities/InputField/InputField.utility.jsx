/**
 * InputField Component
 *
 * A flexible and reusable input field component that supports:
 * - Standard text/password/email inputs with floating labels
 * - Dropdown (select) inputs
 * - Multiline textarea inputs
 *
 * Includes customizable props for styling, validation, and behavior.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} [props.value] - Current value of the input field.
 * @param {function} props.onChange - Change handler for the input.
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {Object} [props.style] - Custom styles for the wrapper container.
 * @param {Object} [props.inputStyle] - Custom styles for the input element.
 * @param {boolean} [props.secureTextEntry=false] - If true, renders input type password.
 * @param {boolean} [props.editable=true] - Whether the input is editable.
 * @param {Array<{ value: string, label: string }>} [props.dropdownOptions] - Options for a dropdown input.
 * @param {string} [props.selectedValue] - Current value for dropdown selection.
 * @param {function} [props.onValueChange] - Change handler for dropdown selection.
 * @param {string} [props.bgColor] - Background color override for the input.
 * @param {string} [props.textColor] - Text color override for the input.
 * @param {string|number} [props.width] - Custom width for the input container.
 * @param {string} [props.label] - Floating label text or dropdown placeholder.
 * @param {string} [props.type="text"] - Input type (text, password, email, etc.).
 * @param {boolean} [props.fullWidth=false] - If true, input stretches full width.
 * @param {boolean} [props.required=false] - Whether input is required.
 * @param {boolean} [props.multiline=false] - If true, renders textarea.
 * @param {number} [props.rows=3] - Row count for textarea.
 *
 * @example
 * // Standard input with floating label
 * <InputField
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   required
 * />
 *
 * @example
 * // Dropdown input
 * <InputField
 *   label="Select Category"
 *   dropdownOptions={[
 *     { value: "coffee", label: "Coffee" },
 *     { value: "tea", label: "Tea" }
 *   ]}
 *   selectedValue={category}
 *   onValueChange={(e) => setCategory(e.target.value)}
 * />
 */

import "../../styles/global.styles.css";
import "./InputField.utility.css";

const InputField = ({
  icon,
  value,
  onChange,
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  editable = true,
  dropdownOptions,
  selectedValue,
  onValueChange,
  bgColor,
  textColor,
  width,
  label,
  type,
  fullWidth = false,
  required = false,
  multiline = false,
  rows = 3,
}) => {
  return (
    <section id="input-field">
      <div
        className="custom-input-wrapper"
        style={{ ...style, width: width || "100%" }}
      >
        {dropdownOptions ? (
          <div className="input-container no-float">
            {icon && <span className="input-icon">{icon}</span>}
            <select
              className="custom-input"
              value={selectedValue}
              onChange={onValueChange}
              required={required}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                width: fullWidth ? "100%" : "auto",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            >
              <option value="" disabled>
                {label || placeholder}
              </option>
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : multiline ? (
          <div className="input-container no-float">
            {icon && <span className="input-icon">{icon}</span>}
            <textarea
              value={value}
              onChange={onChange}
              placeholder={label || placeholder}
              required={required}
              rows={rows}
              className="custom-input"
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
          </div>
        ) : (
          <div className={`input-container ${value ? "has-value" : ""}`}>
            {icon && <span className="input-icon">{icon}</span>}
            <input
              id={label}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              type={type || (secureTextEntry ? "password" : "text")}
              className="custom-input"
              required={required}
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
            <label htmlFor={label} className="floating-label">
              {label}
            </label>
          </div>
        )}
      </div>
    </section>
  );
};

export default InputField;
