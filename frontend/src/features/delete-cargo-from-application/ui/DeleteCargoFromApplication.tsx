import { useAppDispatch } from "@/app/store/hooks";
import { cargoActions } from "@/entities/cargo/model/cargoSlice";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";

import "./DeleteCargoFromApplication.scss";

interface DeleteCargoFromApplicationButtonProps {
  cargoId: string;
}

const DeleteCargoFromApplicationButton = ({ cargoId }: DeleteCargoFromApplicationButtonProps) => {
  const dispatch = useAppDispatch();

  const handleDeleteCargoById = (cargoId: string) => {
    dispatch(cargoActions.deleteCargoById(cargoId));
  }

  return (
    <Button
      icon={<X size={22} />}
      variant="secondary"
      onClick={() => handleDeleteCargoById(cargoId)}
    />
  );
};

export default DeleteCargoFromApplicationButton;