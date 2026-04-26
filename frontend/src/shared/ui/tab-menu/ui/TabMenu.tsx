
import Tab from "./Tab";
import "./TabMenu.scss";

const TabMenu = () => {
  return (
    <nav className="tab-menu">
      <Tab text="Все заказы" link="/applications" />
      <Tab text="Загрузка лифта" link="/fill-lift" />
    </nav>
  );
};

export default TabMenu;