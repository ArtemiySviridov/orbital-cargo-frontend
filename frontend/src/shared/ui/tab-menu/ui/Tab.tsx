import { Link } from "react-router";
import "./Tab.scss";
import type { TabProps } from "../model/types";

const Tab = (props: TabProps) => {
  const {
    text,
    link,
  } = props;

  return (
    <Link className="tab" to={link}>
      {text}
    </Link>
  );
};

export default Tab;