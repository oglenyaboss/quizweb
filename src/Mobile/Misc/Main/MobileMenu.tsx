import "./Styles/MobileMenu.css";
import { NavLink } from "react-router-dom";

export default function Menu() {
  return (
    <>
      <div className={"buttons--container"}>
        <NavLink
          className={({ isActive }) =>
            [isActive ? "button--active" : "button"].join(" ")
          }
          to="/home"
        >
          👋🏻
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            [isActive ? "button--active" : "button"].join(" ")
          }
        >
          🔔
        </NavLink>
        <NavLink
          to="/tests"
          className={({ isActive }) =>
            [isActive ? "button--active" : "button"].join(" ")
          }
        >
          📝
        </NavLink>
      </div>
    </>
  );
}
