import "./Styles/MobileHeader.css";
import AuthContext from "../../../Misc/AuthContext.tsx";
import React from "react";
import defaultProfilePic from "../../../assets/default-profile.png";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import Achievement from "../../../Pages/MainPage/Components/Achievement.tsx";
export default function Header() {
  const { authData } = React.useContext(AuthContext);
  const [modalVisible, setModalVisible] = React.useState(false);
  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  const navigate = useNavigate();

  const achievementsItems = authData.achievements.map((achievement) => {
    return (
      <Achievement
        name={achievement.name}
        description={achievement.description}
        locked={achievement.locked}
      />
    );
  });

  return (
    <>
      <header>
        <div className="header--container">
          <div className={"user--info"}>
            <img
              className={"user--logo"}
              src={profilePic}
              alt={"user--logo"}
              onClick={() => {
                setModalVisible(true);
              }}
            />
            <Modal
              visible={modalVisible}
              onCancel={() => {
                setModalVisible(false);
              }}
              closable={false}
              okText={"Выйти"}
              cancelText={"Закрыть"}
              onOk={() => {
                localStorage.removeItem("authData");
                localStorage.removeItem("userData");
                navigate("/login");
              }}
              okButtonProps={{
                danger: true,
              }}
            >
              <div>
                <p>Имя: {authData.firstName}</p>
                <p>Фамилия: {authData.lastName}</p>
                <p>Группа: {authData.group}</p>
                <p>
                  Роль:{" "}
                  {authData.permissions === "user" ? "пользователь" : "админ"}
                </p>
                <p>Достижения:</p>
                <div className={"achievements--container"}>
                  {achievementsItems}
                </div>
              </div>
            </Modal>
            <h2 className={"user--name"}>
              {authData.firstName + " " + authData.lastName}
            </h2>
          </div>
          <h1 className={"title"}>Quiz</h1>
        </div>
      </header>
    </>
  );
}
