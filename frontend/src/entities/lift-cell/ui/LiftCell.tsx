import "./LiftCell.scss";

interface LiftCellProps {
  id: string;
  size: string;
  style: string;
}

const LiftCell = (props: LiftCellProps) => {
  const {
    id,
    size,
    style,
  } = props;
  return (
    <button className={`lift-cell cell--${style}`}>
      <span className="lift-cell__size">{size}</span>
      <span className="lift-cell__weight">{id}</span>
    </button>
  );
};

export default LiftCell