import { useId, type InputHTMLAttributes } from "react";
import './Input.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string,
}

const Input = ({ label, ...props }: InputProps) => {
  const inputId = useId();
  return (
    <div className="input">
      <label className="input__label" htmlFor={inputId}>
        {label}
      </label>
      <input autoComplete="off" id={inputId} className="input__inner" {...props} />
    </div>
  );
};

export default Input;