import UserInfoBottomItem from "./Components/UserInfoBottomItem.tsx";
import FeaturedItem from "./Components/FeaturedItem.tsx";
import "./MainPage.css";
import React from "react";
import AuthContext from "../../Misc/AuthContext.tsx";
import { Link } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../Misc/Firebase.tsx";
import { doc, setDoc } from "firebase/firestore";
import { Spin, Tooltip, notification } from "antd";
import TestContext from "../../Misc/TestsContext.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import Achievement from "./Components/Achievement.tsx";
import ach1 from "../../assets/achievements/1.png";
import ach2 from "../../assets/achievements/2.png";
import ach3 from "../../assets/achievements/3.png";
import ach4 from "../../assets/achievements/4.png";
import ach5 from "../../assets/achievements/5.png";
import ach6 from "../../assets/achievements/6.png";
import defaultProfilePic from "../../assets/default-profile.png";

export default function MainPage() {
  const { authData, setAuthData } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(true);
  const { testData } = React.useContext(TestContext);
  const [api, contextHolder] = notification.useNotification();
  const [notifiedTestIds, setNotifiedTestIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const storedIds = localStorage.getItem("notifiedTestIds");
    if (storedIds) {
      setNotifiedTestIds(JSON.parse(storedIds));
    }
  }, []);

  React.useEffect(() => {
    if (!loading) {
      testData.forEach((test) => {
        if (test.visible === false) {
          return;
        }
        if (!notifiedTestIds.includes(test.id)) {
          api.success({
            message: "New test added",
            description: `A new test has been added: ${test.name}.`,
          });
          setNotifiedTestIds((prevIds) => {
            const newIds = [...prevIds, test.id];
            localStorage.setItem("notifiedTestIds", JSON.stringify(newIds));
            return newIds;
          });
        }
      });
    }
  }, [testData, api, loading, notifiedTestIds]);

  const handleUpload = async (file: File, userId: string) => {
    const storageRef = ref(storage, "profilePictures/" + userId);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error(error);
      },
      async () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          setAuthData((prev) => ({ ...prev, profilePicUrl: downloadURL }));
          console.log(authData);
          await setDoc(doc(db, "users", userId), {
            ...authData,
            profilePicUrl: downloadURL,
          });
          console.log("File available at", downloadURL);
        });
      }
    );
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file, authData.uid);
    }
  };

  const testsItems = testData.slice(-4).map((test: any) => {
    if (test.visible === false) {
      return null;
    } else {
      return (
        <Link key={test.id} to={"/tests/" + test.id}>
          <FeaturedItem
            title={test.name}
            name={test.name}
            description={test.description}
            category={test.category}
            fastest={test.fastest}
            finished={test.finished}
            correct={test.correct}
          />
        </Link>
      );
    }
  });

  const achievementsItems = authData.achievements.map((achievement: any) => {
    let image;
    switch (achievement.name) {
      case "Первый вход":
        image = ach1;
        break;
      case "Первый тест":
        image = ach2;
        break;
      case "Безупречно!":
        image = ach3;
        break;
      case "Самый быстрый":
        image = ach4;
        break;
      case "Тестер":
        image = ach5;
        break;
      case "Супер тестер":
        image = ach6;
        break;
    }
    return (
      <Achievement
        key={achievement.name}
        name={achievement.name}
        description={achievement.description}
        locked={achievement.locked}
        img={image}
      />
    );
  });

  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  return (
    <>
      {contextHolder}
      <div className={"right--body--section"}>
        <div className={"right--body--section--top"}>
          <div className={"info--body--section"}>
            <div className={"info--body--left--section"}>
              <div className={"user--logo--container"}>
                <Spin
                  spinning={loading}
                  indicator={<LoadingOutlined style={{ fontSize: 30 }} />}
                >
                  <label htmlFor="file--input">
                    <Tooltip
                      title={"Нажмите, чтобы изменить фото"}
                      placement={"top"}
                    >
                      <img
                        className={"user--info--logo"}
                        src={profilePic}
                        alt={"user--logo"}
                        onLoad={() => {
                          setLoading(false);
                        }}
                      />
                    </Tooltip>
                  </label>
                </Spin>
              </div>
            </div>
            <input
              id={"file--input"}
              type={"file"}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className={"info--body--right--section"}>
              <div className={"user--info--top"}>
                <h1 className={"user--name--body"}>
                  {authData.firstName + " " + authData.lastName}
                </h1>
                <h3 className={"user--group--body"}>{authData.group}</h3>
              </div>
              <div className={"user--info--bottom"}>
                <UserInfoBottomItem
                  title={"Тестов пройдено"}
                  count={authData.stats.testsPassed}
                />
                <UserInfoBottomItem
                  title={"Правильных ответов"}
                  count={authData.stats.correctAnswers}
                />
                <UserInfoBottomItem
                  title={"Самый быстрый тест"}
                  count={authData.stats.fastestTest}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={"right--body--section--bottom"}>
          <div className={"achievements--body--section"}>
            <h1 className={"achievements--body--section--title"}>Достижения</h1>
            <div className={"achievements--body--section--container"}>
              {achievementsItems}
            </div>
          </div>
          <div className={"featured--body--section"}>
            <div className={"featured--body--top"}>
              <h1 className={"featured--body--title"}>Избранная категория</h1>
              <Link to={"/tests"} className={"featured--body--showall"}>
                Показать всё
              </Link>
            </div>
            <div className={"featured--body--container"}>{testsItems}</div>
          </div>
        </div>
      </div>
    </>
  );
}
