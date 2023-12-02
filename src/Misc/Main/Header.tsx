import { Link } from "react-router-dom";
import "./Styles/Header.css";
import AuthContext from "../../Misc/AuthContext.tsx";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import defaultProfilePic from "../../assets/default-profile.png";
import Lottie from "react-lottie-player";
import EXCLAMATION from "../../assets/Lottie/EXCLAMATION.json";

export default function Header() {
  const { authData } = React.useContext(AuthContext);
  const [lottiePlaying, setLottiePlaying] = React.useState<boolean>(false);
  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  return (
    <>
      <header>
        <Link className="home--button" to="/home">
          <h1 className={"title"}>Квиз</h1>
        </Link>
        <div className={"search--container"}>
          <Input
            className={"search--input"}
            placeholder={"Поиск"}
            prefix={<SearchOutlined />}
            disabled={true}
          />
        </div>
        <Link
          onMouseEnter={() => {
            setLottiePlaying(true);
          }}
          className="begin--button"
          to="/tests"
        >
          Тест
          <Lottie
            animationData={EXCLAMATION}
            style={{ width: "3vw", height: "3vw" }}
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
        </Link>
        <div className={"user--info"}>
          <img className={"user--logo"} src={profilePic} alt={"user--logo"} />
          <h2 className={"user--name"}>
            {authData.firstName + " " + authData.lastName}
          </h2>
        </div>
      </header>
    </>
  );
}
