import Tab from "./Tab";
import "./TabMenu.scss";
import { useAppSelector } from "@/app/store/hooks";
import { selectAuth } from "@/entities/auth";

const TabMenu = () => {
  const { user } = useAppSelector(selectAuth);
  const role = user?.role;

  if (role === "admin") {
    return (
      <nav className="tab-menu">
        <Tab text="Панель оператора" link="/operator-panel" />
      </nav>
    );
  }

  return (
    <nav className="tab-menu">
      <Tab text="Все заказы" link="/applications" />
      <Tab text="Загрузка лифта" link="/fill-lift" />
    </nav>
  );
};

export default TabMenu;