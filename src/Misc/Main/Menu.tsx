import "./Styles/Menu.css";
import { NavLink } from "react-router-dom";
import AuthContext from "../AuthContext";
import React from "react";
import { Modal } from "antd";
import Lottie from "react-lottie-player";
import HELLO from "../../assets/Lottie/HELLO.json";

export default function Menu() {
  const { authData } = React.useContext(AuthContext);
  const [lottiePlaying, setLottiePlaying] = React.useState(true);

  return (
    <>
      <div className={"buttons--container"}>
        <NavLink
          className={({ isActive }) =>
            [isActive ? "button--active" : "button"].join(" ")
          }
          to="/home"
          onClick={() => {
            console.log("asdas");
            setLottiePlaying(true);
          }}
          onMouseEnter={() => {
            setLottiePlaying(true);
          }}
        >
          <Lottie
            animationData={HELLO}
            style={{ width: "2vw", height: "2vw" }}
            className={"menu--lottie"}
            onComplete={() => {
              console.log("complete");
            }}
            play={lottiePlaying}
            onLoopComplete={() => {
              console.log("loop");
              setLottiePlaying(false);
            }}
          />
          Что нового
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
          <a
            className="button"
            onClick={() => {
              Modal.confirm({
                title: "Вы уверены?",
                content: "Вы действительно хотите выйти?",
                okText: "Выйти",
                cancelText: "Отмена",
                styles: {
                  mask: {
                    backdropFilter: "blur(5px)",
                  },
                },
                okButtonProps: {
                  danger: true,
                },
                onOk: () => {
                  localStorage.removeItem("authData");
                  localStorage.removeItem("userData");
                  window.location.href = "/login";
                },
              });
            }}
          >
            🚪 Выйти
          </a>
        </div>
      </div>
    </>
  );
}
