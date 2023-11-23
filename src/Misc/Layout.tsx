import { Outlet } from "react-router-dom";
import Header from "./Main/Header";
import Menu from "./Main/Menu";
import AuthContext from "./AuthContext";
import React from "react";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const { authData } = React.useContext(AuthContext);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  React.useEffect(() => {
    if (
      authData.firstName === "" &&
      authData.lastName === "" &&
      authData.group === ""
    ) {
      setIsModalVisible(true);
    }
  }, []);

  React.useEffect(() => {
    if (isModalVisible) {
      Modal.error({
        content: "Ошибка авторизации",
        title: "Ошибка",
        styles: { mask: { backdropFilter: "blur(5px)" } },
        onOk: () => {
          navigate("/login");
        },
        okText: "Войти",
      });
    }
  }, [isModalVisible]);
  return (
    <>
      <div className={"App"}>
        <Header />
        <div className="body--container">
          <Menu />
          <Outlet />
        </div>
      </div>
    </>
  );
}
