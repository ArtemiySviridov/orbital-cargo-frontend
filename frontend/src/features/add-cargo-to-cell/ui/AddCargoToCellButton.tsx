import { useAppDispatch } from "@/app/store/hooks";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";

interface AddCargoToCellButtonProps {
  cargoId: string;
}

const AddCargoToCellButton = ({ cargoId }: AddCargoToCellButtonProps) => {
  const dispatch = useAppDispatch();

  const handleAddCargo = (cargoId: string) => {
    console.log(cargoId);
  }

  return (
    <Button
      icon={<Plus size={22} />}
      variant="primary"
      onClick={() => handleAddCargo(cargoId)}
    />
  );
}

export default AddCargoToCellButton;