import { Select } from "@/shared/ui/select";
import type { OrderDirection } from "@/entities/application";

import "./SelectDestination.scss";

interface SelectDestinationProps {
  destination: OrderDirection | "";
  setDestination: (value: OrderDirection) => void;
  disabled?: boolean;
}

const SelectDestination = (props: SelectDestinationProps) => {
  const {
    destination,
    setDestination,
    disabled,
  } = props;

  const liftDestinations: { title: string; value: OrderDirection }[] = [
    { title: "На орбиту", value: "to_orbit" },
    { title: "На Землю", value: "to_earth" },
  ];

  const selectedDestination = liftDestinations.find((item) => item.value === destination);

  return (
    <div className="select-destination">
      <h3 className="h3 select-destination__title">Направление доставки</h3>
      <Select
        options={liftDestinations}
        selected={selectedDestination}
        onChange={(option) => setDestination(option.value as OrderDirection)}
        placeholder="Выберите направление"
        disabled={disabled}
      />
    </div>
  );
};

export default SelectDestination