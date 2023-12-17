import FeaturedItem from "../MainPage/Components/FeaturedItem";
import "../TestsPage/TestsPage.css";
import { doc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../Misc/Firebase";
import React from "react";
import { Button, Spin, Popconfirm, message, Upload } from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import TestContext from "../../Misc/TestsContext";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../Misc/AuthContext";

export default function TestsPage() {
  const [loading] = React.useState(false);
  const { testData } = React.useContext(TestContext);
  const [testId, setTestId] = React.useState<string>("");
  const { authData } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const today = new Date();
  const [messageApi, contextHolder] = message.useMessage();

  const addTest = async (
    name: string,
    category: string,
    visible: boolean,
    questions: Array<any>,
    date: string,
    time: number
  ) => {
    try {
      const docRef = await addDoc(collection(db, "tests"), {
        name,
        category,
        visible,
        questions,
        users: [],
        date,
        time,
      });
      setTestId(docRef.id);
      console.log("Document written with ID: ", testId);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteTest = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tests", id));
      const storageRef = ref(storage, "testPictures/" + id);
      await deleteObject(storageRef);
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const testsItems = testData.map((test: any) => {
    return (
      <Popconfirm
        title="Выберите действие"
        okText="Удалить"
        cancelText="Изменить"
        onConfirm={() => {
          deleteTest(test.id);
          navigate("/admin/tests");
        }}
        onCancel={() => {
          navigate(`/admin/tests/${test.id}`);
        }}
      >
        <a>
          <FeaturedItem
            title={test.name}
            category={test.category}
            badge={test.id === testId}
          />
        </a>
      </Popconfirm>
    );
  });

  if (authData.permissions !== "admin") {
    navigate("/home");
    messageApi.error("У вас нет доступа к этой странице");
  }

  return (
    <>
      {contextHolder}
      <div className="right--body--section">
        {loading ? (
          <>
            <Spin
              style={{
                position: "absolute",
                top: "0%",
                left: "0%",
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(5px)",
                zIndex: 100,
              }}
              indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />}
            />
            <div className={"tests--page"}>
              <h1 className={"tests--page--title"}>Выберите тему🗒️</h1>
              <p className={"tests--page--subtitle"}>Избранная категория❤️</p>
              <div className="featured--item--container">{testsItems}</div>
            </div>
          </>
        ) : (
          <div className={"tests--page"}>
            <div className="tests--page--top">
              <h1 className={"tests--page--title"}>Выберите тему🗒️</h1>
              <p className={"tests--page--subtitle"}>Избранная категория❤️</p>
              <div className="featured--item--container">{testsItems}</div>
            </div>
            <div className={"tests--page--buttons"}>
              <Upload
                accept=".txt,.json"
                showUploadList={false}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const json = JSON.parse(e?.target?.result as string);
                      console.log(json.name);
                      addTest(
                        json.name,
                        json.category,
                        false,
                        json.questions,
                        `${today.getFullYear()}-${String(
                          today.getMonth() + 1
                        ).padStart(2, "0")}-${String(today.getDate()).padStart(
                          2,
                          "0"
                        )}`,
                        json.time
                      );
                      message.success("Тест добавлен успешно");
                      navigate(`/admin/tests/${testId}`);
                    } catch (error) {
                      message.error("Неправильный формат файла");
                      console.log(error);
                    }
                  };
                  reader.readAsText(file);
                  return false;
                }}
              >
                <Button
                  type="primary"
                  style={{ marginRight: 20 }}
                  size="large"
                  icon={<UploadOutlined />}
                >
                  Загрузить тесты
                </Button>
              </Upload>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  addTest(
                    "",
                    "Математика📏",
                    false,
                    [],
                    `${today.getFullYear()}-${String(
                      today.getMonth() + 1
                    ).padStart(2, "0")}-${String(today.getDate()).padStart(
                      2,
                      "0"
                    )}`,
                    600
                  );
                }}
              >
                Добавить тест
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
