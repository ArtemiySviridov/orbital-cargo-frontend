import { Button } from "@/shared/ui/button";
import { Save, Trash2 } from "lucide-react";

import "./ApplicationFormButtons.scss";
import type { ApplicationFormButtonsProps } from "../model/types";

const ApplicationFormButtons = (props: ApplicationFormButtonsProps) => {
  const {
    type,
    isLoading,
    onSave,
    onDelete,
    isSaveLoading,
    isDeleteLoading,
    canDelete,
  } = props;

  const isCreate = type === "create";

  return (
    <div className="application-form-buttons">
      {isCreate ? (
        <Button
          text={isLoading ? "Создание…" : "Создать"}
          variant={isLoading ? "disabled" : "primary"}
          type="submit"
        />
      ) : (
        <>
          <Button
            text={isSaveLoading ? "Сохранение…" : "Сохранить"}
            variant={isSaveLoading ? "disabled" : "primary"}
            icon={<Save size={24} />}
            type="button"
            onClick={onSave}
          />
          {canDelete && (
            <Button
              text={isDeleteLoading ? "Удаление…" : "Удалить заявку"}
              variant={isDeleteLoading ? "disabled" : "secondary"}
              icon={<Trash2 size={24} />}
              type="button"
              onClick={onDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationFormButtons;
