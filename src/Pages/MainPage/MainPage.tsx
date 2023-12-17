import UserInfoBottomItem from "./Components/UserInfoBottomItem.tsx";
import FeaturedItem from "./Components/FeaturedItem.tsx";
import "./MainPage.css";
import React from "react";
import AuthContext from "../../Misc/AuthContext.tsx";
import { Link } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../Misc/Firebase.tsx";
import { doc, setDoc } from "firebase/firestore";
import { Tooltip, notification, Skeleton } from "antd";
import TestContext from "../../Misc/TestsContext.tsx";
import Achievement from "./Components/Achievement.tsx";
import defaultProfilePic from "../../assets/default-profile.png";
import NotificationSound from "../../assets/Sounds/Metal Mallet Ping.mp3";

export default function MainPage() {
  const { authData, setAuthData } = React.useContext(AuthContext);
  const { testData } = React.useContext(TestContext);
  const [api, contextHolder] = notification.useNotification();
  const [notifiedTestIds, setNotifiedTestIds] = React.useState<string[]>([]);
  const audio = new Audio(NotificationSound);
  const [loadedImages, setLoadedImages] = React.useState<number>(0);
  const totalImages = 2;

  const changeLoadedImages = () => {
    setLoadedImages((prev) => prev + 1);
  };

  React.useEffect(() => {
    const storedIds = localStorage.getItem("notifiedTestIds");
    if (storedIds) {
      setNotifiedTestIds(JSON.parse(storedIds));
    }
  }, []);

  React.useEffect(() => {
    if (loadedImages === totalImages) {
      testData.forEach((test) => {
        if (test.visible === false) {
          return;
        }
        if (!notifiedTestIds.includes(test.id)) {
          api.success({
            message: "Новый тест!",
            description: `Новый тест был добавлен: ${test?.name}.`,
          });
          audio.play();
          setNotifiedTestIds((prevIds) => {
            const newIds = [...prevIds, test.id];
            localStorage.setItem("notifiedTestIds", JSON.stringify(newIds));
            return newIds;
          });
        }
      });
    }
  }, [testData, api, loadedImages, notifiedTestIds]);

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
          setAuthData((prev) => ({
            ...prev,
            profilePicUrl: downloadURL,
            timeStamp: Date.now(),
          }));
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

  const testsItems = testData.slice(0, 4).map((test: any) => {
    if (test.visible === false) {
      return null;
    } else if (test?.group !== authData.group) {
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
            onLoad={changeLoadedImages}
          />
        </Link>
      );
    }
  });

  const achievementsItems = authData.achievements.map((achievement: any) => {
    return (
      <Achievement
        key={achievement.name}
        name={achievement.name}
        description={achievement.description}
        locked={achievement.locked}
      />
    );
  });

  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  if (window.innerWidth < 768) {
    return loadedImages < totalImages - 1 ? (
      <>
        <div className={"user--info--main"}>
          <Skeleton.Avatar
            active
            style={{ width: "35vw", height: "17vh", borderRadius: "30px" }}
            shape={"square"}
            className={"user--info--logo"}
          />
          <div className="user--info--names">
            <Skeleton.Input
              active
              className="user--name"
              style={{
                marginLeft: "5vw",
                marginTop: "1vh",
                height: "2vh",
              }}
            />
            <Skeleton.Input
              active
              className="user--group"
              style={{
                marginLeft: "5vw",
                marginTop: "1vh",
                height: "2vh",
              }}
            />
          </div>
        </div>
        <div className="main--page--middle">
          <div className="main--page--bottom">
            <div className="main--page--bottom--top">
              <Skeleton.Input
                active
                className="featured--tests--title"
                style={{
                  height: "2vh",
                }}
              />
              <Link to={"/tests"}>
                <Tooltip title="Все тесты">
                  <Skeleton.Input
                    active
                    className="all--tests"
                    style={{
                      height: "2vh",
                    }}
                  />
                </Tooltip>
              </Link>
            </div>
            <div className="featured--tests">
              <Skeleton.Avatar
                style={{
                  width: "39vw",
                  height: "13.5vh",
                  borderRadius: "30px",
                }}
                className="ffeatured--item--image"
                shape="square"
                active
              />
              <Skeleton.Avatar
                style={{
                  width: "39vw",
                  height: "13.5vh",
                  borderRadius: "30px",
                }}
                className="ffeatured--item--image"
                shape="square"
                active
              />
              <Skeleton.Avatar
                style={{
                  width: "39vw",
                  height: "13.5vh",
                  borderRadius: "30px",
                }}
                className="ffeatured--item--image"
                shape="square"
                active
              />
              <Skeleton.Avatar
                style={{
                  width: "39vw",
                  height: "13.5vh",
                  borderRadius: "30px",
                }}
                className="ffeatured--item--image"
                shape="square"
                active
              />
            </div>
          </div>
        </div>
        <div
          className="preload"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -9999,
          }}
        >
          {testsItems}
        </div>
      </>
    ) : (
      <>
        {contextHolder}
        <div className={"user--info--main"}>
          <label htmlFor="file">
            <img
              className={"user--logo--main"}
              src={profilePic}
              alt={"user--logo"}
              onLoad={() => {
                setLoadedImages((prev) => prev + 1);
              }}
            />
          </label>
          <div className="user--info--names">
            <h2 className={"user--name"}>
              {authData.firstName + " " + authData.lastName}
            </h2>
            <h3 className={"user--group"}>{authData.group}</h3>
          </div>

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            className={"inputfile"}
            onChange={handleFileChange}
          />
        </div>
        <div className="main--page--middle">
          <div className="main--page--bottom">
            <div className="main--page--bottom--top">
              <h2 className={"featured--tests--title"}>Последние тесты</h2>
              <Link to={"/tests"}>
                <Tooltip title="Все тесты">
                  <p className={"all--tests"}>Все тесты</p>
                </Tooltip>
              </Link>
            </div>
            <div className="featured--tests">{testsItems}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="content--container">
      {loadedImages < totalImages ? (
        <>
          <div className={"right--body--section"}>
            <div className={"right--body--section--top"}>
              <div className={"info--body--section"}>
                <div className={"info--body--left--section"}>
                  <div className={"user--logo--container"}>
                    <Skeleton.Avatar
                      active
                      style={{ width: "22vw", height: "25vh" }}
                      shape={"square"}
                      className={"user--info--logo"}
                    />
                  </div>
                </div>
                <div className={"info--body--right--section"}>
                  <div
                    className={"user--info--top"}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Skeleton.Input active className="user--name--body" />
                    <Skeleton.Input active className="user--group--body" />
                  </div>
                  <div className={"user--info--bottom"}>
                    <Skeleton.Input active className="user--info--stats" />
                    <Skeleton.Input active className="user--info--stats" />
                    <Skeleton.Input active className="user--info--stats" />
                  </div>
                </div>
              </div>
            </div>
            <div className={"right--body--section--bottom"}>
              <div className={"achievements--body--section"}>
                <h1 className={"achievements--body--section--title"}>
                  Достижения
                </h1>
                <div className={"achievements--body--section--container"}>
                  <Skeleton.Avatar
                    active
                    shape="square"
                    style={{
                      width: "33vw",
                      height: "35vh",
                      borderRadius: "2vw",
                    }}
                  />
                </div>
              </div>
              <div className={"featured--body--section"}>
                <div className={"featured--body--top"}>
                  <h1 className={"featured--body--title"}>
                    Избранная категория
                  </h1>
                  <Link to={"/tests"} className={"featured--body--showall"}>
                    Показать всё
                  </Link>
                </div>
                <div className={"featured--body--container"}>
                  <Skeleton.Avatar
                    active
                    style={{
                      width: "33vw",
                      height: "35vh",
                      borderRadius: "2vw",
                    }}
                    shape={"square"}
                    className={"user--info--logo"}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="preloader--container"
            style={{
              position: "absolute",
              left: "-9999px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            <img
              className={"user--info--logo"}
              src={profilePic}
              alt={"user--logo"}
              onLoad={() => {
                setLoadedImages((prev) => prev + 1);
              }}
            />
            {testsItems}
          </div>
        </>
      ) : (
        <>
          {contextHolder}
          <div className={"right--body--section"}>
            <div className={"right--body--section--top"}>
              <div className={"info--body--section"}>
                <div className={"info--body--left--section"}>
                  <div className={"user--logo--container"}>
                    <label htmlFor="file--input">
                      <Tooltip
                        title={"Нажмите, чтобы изменить фото"}
                        placement={"top"}
                      >
                        <img
                          className={"user--info--logo"}
                          src={profilePic}
                          alt={"user--logo"}
                        />
                      </Tooltip>
                    </label>
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
                      userId={authData.uid}
                    />
                    <UserInfoBottomItem
                      title={"Правильных ответов"}
                      count={authData.stats.correctAnswers}
                      userId={authData.uid}
                    />
                    <UserInfoBottomItem
                      title={"Самый быстрый тест"}
                      count={authData.stats.fastestTest}
                      userId={authData.uid}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={"right--body--section--bottom"}>
              <div className={"achievements--body--section"}>
                <h1 className={"achievements--body--section--title"}>
                  Достижения
                </h1>
                <div className={"achievements--body--section--container"}>
                  {achievementsItems}
                </div>
              </div>
              <div className={"featured--body--section"}>
                <div className={"featured--body--top"}>
                  <h1 className={"featured--body--title"}>
                    Избранная категория
                  </h1>
                  <Link to={"/tests"} className={"featured--body--showall"}>
                    Показать всё
                  </Link>
                </div>
                <div className={"featured--body--container"}>{testsItems}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
