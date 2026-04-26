import { Select } from "@/shared/ui/select";

import "./SelectDestination.scss";

interface SelectDestinationProps {
  destination: string;
  setDestination: (value: string) => void;
}

const SelectDestination = (props: SelectDestinationProps) => {
  const {
    destination,
    setDestination,
  } = props;

  const liftDestinations = [
    {title: "На орбиту", value: "01"},
    {title: "На Землю", value: "02"},
  ];

  const selectedDestination = liftDestinations.find((item) => item.title === destination);

  return (
    <div className="select-destination">
      <h3 className="h3 select-destination__title">Направление доставки</h3>
      <Select
        options={liftDestinations}
        selected={selectedDestination || null}
        onChange={(selectedDestination) => setDestination(selectedDestination)}
        placeholder="Выберите направление"
      />
    </div>
  );
};

export default SelectDestination