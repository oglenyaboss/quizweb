import "./Styles/Menu.css";
import { NavLink } from "react-router-dom";
import AuthContext from "../AuthContext";
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
          👋🏻 Что нового
        </NavLink>
        <NavLink
          to="/support"
          className={({ isActive }) =>
            [isActive ? "button--active" : "button"].join(" ")
          }
        >
          🎧 Поддержка
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            [isActive ? "button--active" : "button"].join(" ")
          }
        >
          🔔 Уведомления
        </NavLink>
        {authData.permissions === "admin" ? (
          <NavLink
            to="/admin/tests"
            className={({ isActive }) =>
              [isActive ? "button--active" : "button"].join(" ")
            }
          >
            Тесты 📝
          </NavLink>
        ) : null}
        <div className={"exit--button--container"}>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              [isActive ? "button--active" : "button"].join(" ")
            }
          >
            🚪 Выйти
          </NavLink>
        </div>
      </div>
    </>
  );
}
