import { Link } from "react-router-dom";
import "./Styles/Header.css";
import AuthContext from "../../Misc/AuthContext.tsx";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

export default function Header() {
  const { authData } = React.useContext(AuthContext);

  return (
    <>
      <header>
        <Link className="home--button" to="/home">
          <h1 className={"title"}>Quiz</h1>
        </Link>
        <div className={"search--container"}>
          <Input
            className={"search--input"}
            placeholder={"Поиск"}
            prefix={<SearchOutlined />}
            disabled={true}
          />
        </div>
        <Link className="begin--button" to="/tests">
          Тест❗
        </Link>
        <div className={"user--info"}>
          <img
            className={"user--logo"}
            src={authData.profilePicUrl}
            alt={"user--logo"}
          />
          <h2 className={"user--name"}>
            {authData.firstName + " " + authData.lastName}
          </h2>
        </div>
      </header>
    </>
  );
}
