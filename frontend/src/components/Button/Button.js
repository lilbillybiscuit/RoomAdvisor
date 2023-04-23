import "./Button.css";
import React from "react";

const STYLES = ["btn--primary", "btn--outline", "btn--test"];

const SIZES = ["btn--small", "btn--medium", "btn--large"];

export const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize,
  disabled,
}) => {
  const checkButtonStyle = STYLES.includes(buttonStyle)
    ? buttonStyle
    : STYLES[0];

  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

  const disabledClass = disabled ? "disabled" : "";

  return (
    <button
      className={`bttn ${checkButtonStyle} ${checkButtonSize} ${disabledClass}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
