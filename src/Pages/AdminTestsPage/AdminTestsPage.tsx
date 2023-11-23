import FeaturedItem from "../MainPage/Components/FeaturedItem";
import "../TestsPage/TestsPage.css";
import { doc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../Misc/Firebase";
import React from "react";
import { Button, Spin, Popconfirm } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import TestContext from "../../Misc/TestsContext";
import { useNavigate } from "react-router-dom";

export default function TestsPage() {
  const [loading] = React.useState(false);
  const { testData } = React.useContext(TestContext);
  const [testId, setTestId] = React.useState<string>("");
  const navigate = useNavigate();
  const today = new Date();

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
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const testsItems = testData.map((test: any) => {
    const image = "/src/assets/CategoryPictures/" + test.category + ".jpeg";

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
            image={image}
            badge={test.id === testId}
          />
        </a>
      </Popconfirm>
    );
  });

  return (
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
          <h1 className={"tests--page--title"}>Выберите тему🗒️</h1>
          <p className={"tests--page--subtitle"}>Избранная категория❤️</p>
          <div className="featured--item--container">{testsItems}</div>
          <div className={"tests--page--buttons"}>
            <Button
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
  );
}
