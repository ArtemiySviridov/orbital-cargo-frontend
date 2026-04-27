import { Button } from "@/shared/ui/button";
import { Package } from "lucide-react";

const EndLiftLoadingButton = () => {
  return (
    <Button
      text="Закончить загрузку"
      icon={<Package size={22} />}
      variant="secondary"
      disabled
    />
  );
};

export default EndLiftLoadingButton;