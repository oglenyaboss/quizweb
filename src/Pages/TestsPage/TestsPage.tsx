import FeaturedItem from "../MainPage/Components/FeaturedItem";
import "./TestsPage.css";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "../../Misc/Firebase";
import { query, onSnapshot } from "firebase/firestore";
import React from "react";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import TestContext from "../../Misc/TestsContext";

export default function TestsPage() {
  const [loading, setLoading] = React.useState(false);
  const { testData } = React.useContext(TestContext);

  const addTest = async (
    name: string,
    category: string,
    picture: string,
    description: string,
    questions: Array<any>
  ) => {
    try {
      const docRef = await addDoc(collection(db, "tests"), {
        name,
        category,
        picture,
        description,
        questions,
        users: [],
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const changeLoading = () => {
    setLoading(false);
  };

  const testsItems = testData.map((test: any) => {
    if (test.visible === false) {
      return null;
    } else {
      return (
        <Link key={test.id} to={"/tests/" + test.id}>
          <FeaturedItem
            title={test.name}
            image={"/src/assets/CategoryPictures/" + test.category + ".jpeg"}
          />
        </Link>
      );
    }
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
        </div>
      )}
    </div>
  );
}
