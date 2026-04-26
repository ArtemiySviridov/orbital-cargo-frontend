import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant: "primary" | "secondary" | "disabled";
  icon?: ReactNode;
}

const Button = ({ text, variant="primary", icon, ...props }: ButtonProps) => {
  const isButtonDisabled = variant === "disabled";
  return (
    <button 
      className={`button button--${variant}`}
      {...props}
      disabled={isButtonDisabled}
    >
      {icon && <span className="button__icon">{icon}</span>}
      {text && <span className="button__text">{text}</span>}
    </button>
  );
};

export default Button;