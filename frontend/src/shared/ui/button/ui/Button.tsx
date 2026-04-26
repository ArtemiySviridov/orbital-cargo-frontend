import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant: "primary" | "secondary";
  icon?: ReactNode;
}

const Button = ({ text, variant="primary", icon, disabled, className="", ...props }: ButtonProps) => {
  return (
    <button 
      className={`button button--${variant} ${disabled ? "button--disabled" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="button__icon">{icon}</span>}
      {text && <span className="button__text">{text}</span>}
    </button>
  );
};

export default Button;