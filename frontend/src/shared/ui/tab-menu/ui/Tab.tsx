import { NavLink } from "react-router";
import "./Tab.scss";
import type { TabProps } from "../model/types";

const Tab = (props: TabProps) => {
  const {
    text,
    link,
  } = props;

  return (
    <NavLink className="tab" to={link}>
      {text}
    </NavLink>
  );
};

export default Tab;
