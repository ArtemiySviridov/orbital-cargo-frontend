import { useId, type InputHTMLAttributes } from "react";
import './Input.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, ...props }: InputProps) => {
  const inputId = useId();
  return (
    <div className="input">
      <label className="input__label" htmlFor={inputId}>
        {label}
      </label>
      <input autoComplete="off" id={inputId} className={`input__inner${error ? " input__inner--error" : ""}`} {...props} />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
};

export default Input;