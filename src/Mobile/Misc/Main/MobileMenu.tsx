import "./Styles/MobileMenu.css";
import { NavLink } from "react-router-dom";
import AuthContext from "../../../Misc/AuthContext.tsx";
import React from "react";

export default function Menu() {
  const { authData } = React.useContext(AuthContext);
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
