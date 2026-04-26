export interface ApplicationFormButtonsProps {
  type: "edit" | "create";
  isLoading?: boolean;
  onSave?: () => void;
  onDelete?: () => void;
  isSaveLoading?: boolean;
  isDeleteLoading?: boolean;
  canDelete?: boolean;
}
