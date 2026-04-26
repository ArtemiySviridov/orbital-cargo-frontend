import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";

interface AddCargoToCellButtonProps {
  cargoId: string;
}

const AddCargoToCellButton = ({ cargoId }: AddCargoToCellButtonProps) => {
  const handleAddCargo = (id: string) => {
    console.log(id);
  };

  return (
    <Button
      icon={<Plus size={22} />}
      variant="primary"
      onClick={() => handleAddCargo(cargoId)}
    />
  );
}

export default AddCargoToCellButton;