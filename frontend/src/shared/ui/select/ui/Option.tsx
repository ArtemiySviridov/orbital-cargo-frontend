import type { OptionProps } from "../model/types";
import "./Option.scss";

const Option = ({ option, selectedValue, onClick }: OptionProps) => {
  const isSelected = selectedValue === option.value;

  return (
    <li
      className={`option ${isSelected ? "option--selected" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(option);
      }}
      tabIndex={0}
    >
      {option.title}
    </li>
  );
};

export default Option;