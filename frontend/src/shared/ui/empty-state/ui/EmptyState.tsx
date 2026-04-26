import emptyEmblem from "@/shared/assets/images/empty-emblem.svg";

import "./EmptyState.scss";

interface EmptyStateProps {
  text: string;
}

const EmptyState = ({ text }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <img 
        className="empty-state__empty-emblem"
        src={emptyEmblem}
        alt="Empty: there is no data"
      />
      <span className="empty-state__message">{text}</span>
    </div>
  );
};

export default EmptyState;