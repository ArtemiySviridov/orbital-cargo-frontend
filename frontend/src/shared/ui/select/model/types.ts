// export interface IOption {
//   title: string;
//   value: string;
// }

// export interface SelectProps {
//   selected: IOption | null;
//   options: IOption[];
//   placeholder?: string;
//   label?: string;
//   onChange?: (selected: IOption['value']) => void;
//   onClose?: () => void;
// }

// export interface OptionProps {
//   option: IOption;
//   selectedValue?: IOption['value']; 
//   onClick: (option: IOption) => void;
// }
export interface IOption {
  value: string;
  title: string;
}

export interface SelectProps {
  options: IOption[];
  selected?: IOption;
  placeholder?: string;
  label?: string;
  onChange?: (option: IOption) => void;
  onClose?: () => void;
}

export interface OptionProps {
  option: IOption;
  selectedValue?: string;
  onClick: (option: IOption) => void;
}