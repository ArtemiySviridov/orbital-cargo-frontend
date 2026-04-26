import "./Loader.scss";

interface LoaderProps {
  text?: string;
  size?: "sm" | "md";
}

const Loader = ({ text = "Загрузка данных...", size = "md" }: LoaderProps) => {
  return (
    <div className={`loader loader--${size}`} role="status" aria-live="polite">
      <div className="loader__orbit" aria-hidden="true">
        <span className="loader__planet" />
        <span className="loader__satellite" />
      </div>
      <span className="loader__text">{text}</span>
    </div>
  );
};

export default Loader;
