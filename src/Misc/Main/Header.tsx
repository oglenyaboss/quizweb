import { Link } from "react-router-dom";
import "./Styles/Header.css";
import AuthContext from "../../Misc/AuthContext.tsx";
import React from "react";
import { Input, Modal, Button, Form, Select, Row, Col, Switch } from "antd";
import defaultProfilePic from "../../assets/default-profile.png";
import Lottie from "react-lottie-player";
import EXCLAMATION from "../../assets/Lottie/EXCLAMATION.json";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../Misc/Firebase";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Achievement from "../../Pages/MainPage/Components/Achievement.tsx";
import StateContext from "../StateContext.tsx";

export default function Header() {
  const { authData, setAuthData } = React.useContext(AuthContext);
  const [lottiePlaying, setLottiePlaying] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const [changeOpen, setChangeOpen] = React.useState<boolean>(false);
  const { state, setState } = React.useContext(StateContext);
  const navigate = useNavigate();
  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  async function deleteCurrentUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await user.delete();
        console.log("User deleted");
      } catch (error) {
        console.error("Error deleting user: ", error);
      }
    } else {
      console.log("No user is signed in");
    }
  }
  const [modalVisible, setModalVisible] = React.useState(false);

  const achievementsItems = authData.achievements.map((achievement) => {
    return (
      <Achievement
        name={achievement.name}
        description={achievement.description}
        locked={achievement.locked}
      />
    );
  });

  if (window.innerWidth < 768) {
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
                footer={[
                  <Switch
                    style={{ marginRight: "10px" }}
                    checkedChildren="Светлая"
                    unCheckedChildren="Темная"
                    defaultChecked={state.primaryColor === "#8692a6"}
                    onChange={(checked) => {
                      setState({
                        ...state,
                        primaryColor: checked ? "#8692a6" : "#FFBE98",
                        backgroundColor: checked ? "#fbf9f9" : "#8692a6",
                        secondaryBackgroundColor: checked ? "#fff" : "#696f79",
                        buttonColor: checked ? "#8692a6" : "#8692a6",
                        buttonTextColor: checked ? "#fff" : "#FFBE98",
                        textColor: checked ? "#696f79" : "#FFBE98",
                        shadow: checked
                          ? "0 1vw 4vh 0.3vw #ededed"
                          : "0 1vw 4vh 0.3vw #3d3d3d",
                      });
                    }}
                  />,

                  <Button
                    type="primary"
                    onClick={() => {
                      setModalVisible(false);
                    }}
                  >
                    Закрыть
                  </Button>,
                  <Button
                    danger
                    type="primary"
                    onClick={() => {
                      localStorage.removeItem("authData");
                      localStorage.removeItem("userData");
                      navigate("/login");
                    }}
                  >
                    Выйти
                  </Button>,
                ]}
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
            <h1
              style={{
                color: state.primaryColor,
              }}
              className={"title"}
            >
              Квиз
            </h1>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <header>
        <Link className="home--button" to="/home">
          <h1
            style={{
              color: state.primaryColor,
            }}
            className={"title"}
          >
            Квиз
          </h1>
        </Link>

        <Link
          style={{
            backgroundColor: state.primaryColor,
          }}
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
          <Modal
            title="Изменить профиль"
            open={changeOpen}
            onOk={() => {
              setChangeOpen(false);
            }}
            onCancel={() => {
              setChangeOpen(false);
            }}
            footer={null}
          >
            <Form
              onFinish={(values) => {
                setAuthData({
                  ...authData,
                  firstName: values.firstName,
                  lastName: values.lastName,
                });
                setChangeOpen(false);
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Имя"
                    name="firstName"
                    rules={[{ required: true, message: "Введите имя" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    label="Фамилия"
                    name="lastName"
                    rules={[{ required: true, message: "Введите фамилию" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label="Группа"
                    name="group"
                    rules={[{ required: true, message: "Выберите группу" }]}
                  >
                    <Select
                      defaultValue={authData.group}
                      onChange={(value) => {
                        setAuthData({
                          ...authData,
                          group: value,
                        });
                      }}
                    >
                      <Select.Option value="БИН21-01">БИН21-01</Select.Option>
                      <Select.Option value="БИМ21-01">БИМ21-01</Select.Option>
                      <Select.Option value="БПА21-01">БИН21-01</Select.Option>
                      <Select.Option value="СТОМ">СТОМ</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Изменить
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
          <Modal
            title="Информация о пользователе"
            visible={open}
            onOk={() => {
              setOpen(false);
            }}
            onCancel={() => {
              setOpen(false);
              localStorage.setItem("state", JSON.stringify(state));
              console.log("State updated: ", state);
            }}
            footer={[
              <Switch
                style={{ marginRight: "10px" }}
                checkedChildren="Светлая"
                unCheckedChildren="Темная"
                defaultChecked={state.primaryColor === "#8692a6"}
                onChange={(checked) => {
                  setState({
                    ...state,
                    primaryColor: checked ? "#8692a6" : "#FFBE98",
                    backgroundColor: checked ? "#fbf9f9" : "#8692a6",
                    secondaryBackgroundColor: checked ? "#fff" : "#696f79",
                    buttonColor: checked ? "#8692a6" : "#8692a6",
                    buttonTextColor: checked ? "#fff" : "#FFBE98",
                    textColor: checked ? "#696f79" : "#FFBE98",
                    shadow: checked
                      ? "0 1vw 4vh 0.3vw #ededed"
                      : "0 1vw 4vh 0.3vw #3d3d3d",
                  });
                }}
              />,
              <Button
                type="primary"
                key={"change"}
                onClick={() => {
                  setOpen(false);
                  setChangeOpen(true);
                }}
              >
                Изменить профиль
              </Button>,
              <Button
                type="primary"
                danger
                onClick={() => {
                  Modal.confirm({
                    styles: {
                      mask: {
                        backdropFilter: "blur(5px)",
                      },
                    },
                    title: "Вы уверены?",
                    content:
                      "После удаления профиля вы не сможете его восстановить",
                    onOk: async () => {
                      await deleteDoc(doc(db, "users", authData.uid));
                      navigate("/login");
                      localStorage.removeItem("authData");
                      localStorage.removeItem("userData");
                      deleteCurrentUser();
                    },
                    onCancel() {},
                    okText: "Удалить",
                    cancelText: "Отмена",
                  });
                }}
              >
                Удалить профиль
              </Button>,
            ]}
          >
            <p>Имя: {authData.firstName}</p>
            <p>Фамилия: {authData.lastName}</p>
            <p>Роль: {authData.permissions}</p>
          </Modal>
          <img
            className={"user--logo"}
            src={profilePic}
            alt={"user--logo"}
            onClick={() => {
              setOpen(true);
            }}
          />
          <h2 className={"user--name"}>
            {authData.firstName + " " + authData.lastName}
          </h2>
        </div>
      </header>
    </>
  );
}
