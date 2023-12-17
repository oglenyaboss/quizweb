import React from "react";
import "./Styles/App.css";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Layout from "./Misc/Layout";
import TestPage from "./Pages/TestPage/TestPage";
import TestsPage from "./Pages/TestsPage/TestsPage";
import MainPage from "./Pages/MainPage/MainPage";
import SupportPage from "./Pages/SupportPage/SupportPage";
import NotificationsPage from "./Pages/NotificationsPage/NotificationsPage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import AuthContext from "./Misc/AuthContext";
import TestContext from "./Misc/TestsContext";
import { ConfigProvider, Modal } from "antd";
import { auth, db } from "./Misc/Firebase";
import {
  doc,
  onSnapshot,
  collection,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import AdminTestsPage from "./Pages/AdminTestsPage/AdminTestsPage";
import AdminTestPage from "./Pages/AdminTestPage/AdminTestPage";
import { debounce } from "lodash";
import CryptoJS from "crypto-js";
import ErrorPage from "./Pages/404/MobileErrorPage";
import { AuthData } from "./Misc/AuthContext";
import UserLicense from "./Misc/UserLicense";
import StateContext from "./Misc/StateContext";

function App() {
  const navigate = useNavigate();
  const [authData, setAuthData] = React.useState<{
    firstName: string;
    lastName: string;
    group: string;
    uid: string;
    profilePicUrl: string;
    permissions: string;
    stats: {
      testsPassed: number;
      correctAnswers: number;
      fastestTest: number;
    };
    achievements: { name: string; description: string; locked: boolean }[];
    timeStamp: number;
  }>({
    firstName: "",
    lastName: "",
    group: "",
    uid: "",
    permissions: "user",
    profilePicUrl: "/src/assets/default-profile.png",
    stats: {
      testsPassed: 0,
      correctAnswers: 0,
      fastestTest: 0,
    },
    achievements: [],
    timeStamp: Date.now(),
  });

  const secretKey = "idcboutyou";

  const [testData, setTestData] = React.useState<any>([]);

  const [state, setState] = React.useState({
    primaryColor: "#8692a6",
    backgroundColor: "#fbf9f9",
    textColor: "#696f79",
    buttonColor: "#8692a6",
    buttonTextColor: "#FFF",
    secondaryBackgroundColor: "#FFF",
    shadow: "0 1vw 4vh 0.3vw #ededed",
  });

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--active-bg",
      state.primaryColor
    );
    document.documentElement.style.setProperty(
      "--background-color",
      state.backgroundColor
    );
    document.documentElement.style.setProperty("--text-color", state.textColor);
    document.documentElement.style.setProperty(
      "--secondary-background-color",
      state.secondaryBackgroundColor
    );
    document.documentElement.style.setProperty("--shadow", state.shadow);
    document.documentElement.style.setProperty(
      "--button-color",
      state.buttonColor
    );
    document.documentElement.style.setProperty(
      "--button-text-color",
      state.buttonTextColor
    );
  }, [state]);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tests"), (querySnapshot) => {
      const tests: any = [];
      querySnapshot.forEach((doc: any) => {
        tests.push({ ...doc.data(), id: doc.id });
      });
      setTestData(tests);
      console.log("Current tests in DB: ");
      console.log(tests);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const updateFirebase = debounce(async () => {
      try {
        for (const test of testData) {
          if (test.id) {
            await updateDoc(doc(db, "tests", test.id), {
              ...test,
              users: test.users,
            });
          }
        }
      } catch (error) {
        console.error("Error updating Firebase: ", error);
      }
    }, 2500);
    updateFirebase();
    return () => {
      updateFirebase.cancel();
    };
  }, [testData]);

  React.useEffect(() => {
    console.log(authData);
    if (authData.uid) {
      if (localStorage.getItem("authData")) {
        try {
          const ciphertext = CryptoJS.AES.encrypt(
            JSON.stringify({ ...authData }),
            secretKey
          ).toString();
          localStorage.setItem("authData", ciphertext);
        } catch (e) {
          console.log("Error encrypting data: ", e);
        }
      }
      const docRef = doc(db, "users", authData.uid);
      getDoc(docRef)
        .then((doc) => {
          if (doc.exists()) {
            const firebaseData = doc.data();
            if (firebaseData.timeStamp < authData.timeStamp) {
              updateDoc(docRef, {
                ...authData,
                timestamp: Date.now(),
              })
                .then(() => console.log("Document successfully updated!"))
                .catch((error) =>
                  console.error("Error updating document: ", error)
                );
            } else if (firebaseData.timeStamp > authData.timeStamp) {
              setAuthData(firebaseData as AuthData);
            }
          } else {
            if (
              window.location.pathname !== "/userlicense" &&
              window.location.pathname !== "/login" &&
              window.location.pathname !== "/404"
            ) {
              Modal.error({
                title: "Ошибка",
                content: "Пользователь не найден в базе данных.",
                onOk: () => {
                  auth.signOut();
                  navigate("/login");
                },
              });
            }
          }
        })
        .catch((error) => console.error("Error getting document: ", error));
    }
  }, [authData]);
  React.useEffect(() => {
    const stateFromLocalStorage = localStorage.getItem("state");
    if (stateFromLocalStorage) {
      setState(JSON.parse(stateFromLocalStorage));
      console.log("State loaded from local storage: ", stateFromLocalStorage);
    }
    const authDataFromLocalStorage = localStorage.getItem("authData");
    if (authDataFromLocalStorage) {
      try {
        const bytes = CryptoJS.AES.decrypt(
          authDataFromLocalStorage.toString(),
          secretKey
        );
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        setAuthData(decryptedData);
      } catch (e) {
        console.log("Error decrypting data: ", e);
      }
    }
  }, []);

  React.useEffect(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("iPhone") && userAgent.includes("Safari")) {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.style.height = "90vh";
      }
    }
  }, []);

  return (
    <StateContext.Provider value={{ state, setState }}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: state.primaryColor,
            colorText: state.primaryColor,
            fontFamily: "Poppins, sans-serif",
            colorWarning: "#ff4d4f",
            colorBgContainer: state.backgroundColor,
            colorBorder: state.secondaryBackgroundColor,
            boxShadow: state.shadow,
            colorPrimaryBg: state.backgroundColor,
            colorBorderBg: state.secondaryBackgroundColor,
            colorBgBase: state.backgroundColor,
            colorTextBase: state.textColor,
            colorBgTextActive: state.backgroundColor,
          },
          components: {
            Skeleton: {
              borderRadius: 30,
            },
            Button: {
              colorText: state.buttonTextColor,
              borderRadius: 30,
              borderRadiusLG: 30,
            },
            Switch: {
              handleBg: state.primaryColor,
            },
            Message: {
              borderRadius: 30,
            },
            Radio: {
              borderRadius: 30,
              controlHeight: 50,
              fontSize: 20,
              radioSize: 30,
              colorBorder: state.primaryColor,
            },
            Modal: {
              borderRadius: 30,
            },
            Input: {
              borderRadius: 30,
              paddingBlock: 10,
              colorText: state.primaryColor,
              colorTextPlaceholder: state.primaryColor,
            },
            Select: {
              borderRadius: 30,
            },
          },
        }}
      >
        <AuthContext.Provider value={{ authData, setAuthData }}>
          <TestContext.Provider value={{ testData, setTestData }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to={"/home"} />} />
                <Route path="/tests/:id" element={<TestPage />} />
                <Route path="/tests" element={<TestsPage />} />
                <Route path="/home" element={<MainPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/admin/tests" element={<AdminTestsPage />} />
                <Route path="/admin/tests/:id" element={<AdminTestPage />} />
              </Route>
              <Route path="*" element={<ErrorPage />} />
              <Route path="/userlicense" element={<UserLicense />} />
            </Routes>
          </TestContext.Provider>
        </AuthContext.Provider>
      </ConfigProvider>
    </StateContext.Provider>
  );
}

export default App;
