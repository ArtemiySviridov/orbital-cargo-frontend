
import { cells } from "@/entities/lift-cell/model/types";
import "./LiftGrid.scss";
import LiftCell from "@/entities/lift-cell/ui/LiftCell";

const LiftGrid = () => {
  return (
    <div className="lift-grid">
      {cells.map((cell) => (
        <LiftCell
          key={cell.id}
          id={cell.id}
          size={cell.size}
          style={cell.style}
        />
      ))}
    </div>
  );
};

export default LiftGrid;