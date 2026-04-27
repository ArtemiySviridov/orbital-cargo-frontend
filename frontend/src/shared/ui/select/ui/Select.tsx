import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";

import "./Select.scss";
import type { IOption, SelectProps } from "../model/types";
import Option from "./Option";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

const Select = ({
  selected,
  options,
  placeholder = "Выберите...",
  label,
  onChange,
  onClose,
  disabled = false,
}: SelectProps) => {
  const selectId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  /* 🔒 Закрытие по клику вне */
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        if (isOpen) onClose?.();
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isOpen, onClose]);

  /* ⌨️ Закрытие по ESC */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOptionClick = (option: IOption) => {
    setIsOpen(false);
    onChange?.(option);
  };

  const handleSelectClick: MouseEventHandler<HTMLDivElement> = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="select-wrapper">
      {label && <label htmlFor={selectId}>{label}</label>}

      <div
        id={selectId}
        className={`select${disabled ? " select--disabled" : ""}`}
        ref={rootRef}
        data-is-active={isOpen}
        onClick={handleSelectClick}
      >
        <div className="select__arrow-icon">
          <ChevronDown size={20} />
        </div>

        <div
          className="select__placeholder"
          data-selected={!!selected}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
        >
          {selected?.title || placeholder}
        </div>

        {isOpen &&
        createPortal(
          <ul className="select-dropdown" style={dropdownStyles}>
            {options.map((option) => (
              <Option
                key={option.value}
                option={option}
                selectedValue={selected?.value}
                onClick={handleOptionClick}
              />
            ))}
          </ul>,
          document.body
        )}
      </div>
    </div>
  );
};

export default Select;