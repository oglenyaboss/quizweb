import FeaturedItem from "./Components/FeaturedItem.tsx";
import "./MobileMainPage.css";
import React from "react";
import AuthContext from "../../../Misc/AuthContext.tsx";
import { Link } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../../Misc/Firebase.tsx";
import { doc, setDoc } from "firebase/firestore";
import { Spin, Tooltip, notification } from "antd";
import TestContext from "../../../Misc/TestsContext.tsx";
import defaultProfilePic from "../../../assets/default-profile.png";

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
            message: "Новый тест!",
            description: `Новый тест был добавлен: ${test?.name}.`,
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
          />
        </Link>
      );
    }
  });

  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  return (
    <>
      {contextHolder}
      <div className={"user--info--main"}>
        <Spin spinning={loading}>
          <label htmlFor="file">
            <img
              className={"user--logo--main"}
              src={profilePic}
              alt={"user--logo"}
              onLoad={() => setLoading(false)}
            />
          </label>
        </Spin>
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
