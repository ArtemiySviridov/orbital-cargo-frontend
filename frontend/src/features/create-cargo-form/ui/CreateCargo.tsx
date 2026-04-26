import { useState, type FormEvent } from "react";
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

  const [errors, setErrors] = useState({ name: "", weight: "", size: "" });

  const cargoSizes = [
    { title: "S", value: "s" },
    { title: "M", value: "m" },
    { title: "L", value: "l" },
  ];

  const selectedSize = cargoSizes.find((item) => item.value === size);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors = {
      name: name.trim() ? "" : "Введите название",
      weight: weight.trim() ? "" : "Введите вес",
      size: size.trim() ? "" : "Выберите размер",
    };
    setErrors(newErrors);
    if (newErrors.name || newErrors.weight || newErrors.size) return;
    dispatch(cargoActions.addCargo());
  };

  return (
    <div className="create-cargo" onSubmit={handleSubmit}>
      <h3 className="h3 create-cargo__title">Добавление грузов</h3>
      <fieldset className="create-cargo__fields">
        <Input
          label="Название"
          value={name}
          error={errors.name}
          onChange={(event) => {
            dispatch(cargoActions.setNewCargoName(event.target.value));
            if (errors.name) setErrors((e) => ({ ...e, name: "" }));
          }}
        />
        <div className="fields__fields-block">
          <Input
            label="Вес (кг)"
            placeholder="Вес (кг)"
            type="number"
            value={weight}
            error={errors.weight}
            onChange={(event) => {
              dispatch(cargoActions.setNewCargoWeight(event.target.value));
              if (errors.weight) setErrors((e) => ({ ...e, weight: "" }));
            }}
          />
          <div>
            <Select
              options={cargoSizes}
              selected={selectedSize}
              label="Размер (м3)"
              onChange={(option) => {
                dispatch(cargoActions.setNewCargoSize(option.value));
                if (errors.size) setErrors((e) => ({ ...e, size: "" }));
              }}
              placeholder="Размер груза"
            />
            {errors.size && <span className="create-cargo__error">{errors.size}</span>}
          </div>
          <Button icon={<PackagePlus size={24} />} type="submit" variant="primary" onClick={handleSubmit} />
        </div>
      </fieldset>
    </div>
  );
};

export default CreateCargo;
