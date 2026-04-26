import type { ICargo } from "../../model/types";
import type { ReactNode } from "react";

import "./CargoCard.scss";

interface CargoCardProps {
  type: "creating" | "loading"
  cargo: ICargo;
  buttonSlot?: ReactNode;
}

const CargoCard = (props: CargoCardProps) => {
  const {
    type,
    cargo: {
      name,
      status, 
      weight,
      size,
      applicationNumber,
    },
    buttonSlot,
  } = props;
  return (
    <div className="cargo-card">
      { type === "creating" ? (
        <>
          <div className="cargo-card__name-status-block">
            <span>{name}</span>
            <span>{status}</span>
          </div>
          <span>{weight}</span>
          <span>{size}</span>
        </>
      ) : (
        <>
          <div className="cargo-card__loading">
            <div className="loading__info">
              <strong>{name}</strong>
              <div className="info__number-weight">
                <span>{applicationNumber}</span>
                <span>{weight}</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      {buttonSlot}
    </div>
  );
};

export default CargoCard;