import { Button } from "@/shared/ui/button";
import { RotateCcw, Save, Trash2 } from "lucide-react";

import "./ApplicationFormButtons.scss";
import type { ApplicationFormButtonsProps } from "../model/types";

const ApplicationFormButtons = (props: ApplicationFormButtonsProps) => {
  const {
    type,
  } = props;

  const isCreate = type === "create";

  return (
    <div className="application-form-buttons">
      { isCreate ? (
        <Button text="Создать" variant="primary" />
      ) : (
        <>
          <Button
            text="Сохранить"
            variant="primary"
            icon={<Save size={24} />}
          />
          <Button
            text="Отменить изменения"
            variant="secondary"
            icon={<RotateCcw size={24} />}
          />
          <Button
            text="Удалить"
            variant="secondary"
            icon={<Trash2 size={24} />}
          />
        </>
      )}
    </div>
  );
};

export default ApplicationFormButtons;