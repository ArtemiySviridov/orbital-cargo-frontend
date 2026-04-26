import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { PackagePlus } from "lucide-react";

import "./CreateCargo.scss";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { cargoActions, selectNewCargoForm } from "@/entities/cargo/model/cargoSlice";

const CreateCargo = () => {
  const dispatch = useAppDispatch();
  const { name, weight, size } = useAppSelector(selectNewCargoForm);

  const cargoSizes = [
    {title: "S", value: "01"},
    {title: "M", value: "02"},
    {title: "L", value: "03"},
  ];

  const selectedSize = cargoSizes.find((item) => item.title === size);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(cargoActions.addCargo());
  }

  return (
    <div className="create-cargo" onSubmit={handleSubmit}>
      <h3 className="h3 create-cargo__title">Добавление грузов</h3>
      <fieldset className="create-cargo__fields">
        <Input 
          label="Название"
          value={name}
          onChange={(event) => dispatch(cargoActions.setNewCargoName(event.target.value))}
        />
        <div className="fields__fields-block">
          <Input
            label="Вес (кг)"
            placeholder="Вес (кг)"
            type="number"
            value={weight}
            onChange={(event) => dispatch(cargoActions.setNewCargoWeight(event.target.value))}
          />
          <Select
            options={cargoSizes}
            selected={selectedSize || null}
            label="Размер (м3)"
            onChange={(selectedSize) => dispatch(cargoActions.setNewCargoSize(selectedSize))}
            placeholder="Размер груза"
          />
          <Button icon={<PackagePlus size={24} />} type="submit" variant="primary" onClick={handleSubmit} />
        </div>
      </fieldset>
    </div>
  );
};

export default CreateCargo;