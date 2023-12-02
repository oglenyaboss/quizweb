import React from "react";
import "./Styles/App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Misc/Layout";
import TestPage from "./Pages/TestPage/TestPage";
import TestsPage from "./Pages/TestsPage/TestsPage";
import MainPage from "./Pages/MainPage/MainPage";
import SupportPage from "./Pages/SupportPage/SupportPage";
import NotificationsPage from "./Pages/NotificationsPage/NotificationsPage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import AuthContext from "./Misc/AuthContext";
import TestContext from "./Misc/TestsContext";
import { ConfigProvider } from "antd";
import { db } from "./Misc/Firebase";
import { doc, onSnapshot, collection, updateDoc } from "firebase/firestore";
import AdminTestsPage from "./Pages/AdminTestsPage/AdminTestsPage";
import AdminTestPage from "./Pages/AdminTestPage/AdminTestPage";
import { debounce } from "lodash";
import MobileLoginPage from "./Mobile/Pages/LoginPage/MobileLoginPage";
import MobileLayout from "./Mobile/Misc/MobileLayout";
import MobileMainPage from "./Mobile/Pages/MainPage/MobileMainPage";
import MobileTestsPage from "./Mobile/Pages/TestsPage/MobileTestsPage";
import MobileTestPage from "./Mobile/Pages/TestPage/MobileTestPage";
import MobileNotificationPage from "./Mobile/Pages/NotificationsPage/MobileNotificationsPage";
import CryptoJS from "crypto-js";
import ErrorPage from "./Pages/404/MobileErrorPage";

function App() {
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
  });

  const secretKey = "idcboutyou";

  const [testData, setTestData] = React.useState<any>([]);

  React.useEffect(() => {
    const updateFirebase = async () => {
      try {
        await updateDoc(doc(db, "users", authData.uid), {
          firstName: authData.firstName,
          lastName: authData.lastName,
          group: authData.group,
          uid: authData.uid,
          profilePicUrl: authData.profilePicUrl,
          permissions: authData.permissions,
          stats: {
            testsPassed: authData.stats.testsPassed,
            correctAnswers: authData.stats.correctAnswers,
            fastestTest: authData.stats.fastestTest,
          },
          achievements: authData.achievements,
        });
        console.log(authData);
        console.log("updated authData");
      } catch (e) {
        console.log("Error updating Firebase: ", e);
      }
    };
    if (authData.uid) {
      updateFirebase();
      if (localStorage.getItem("authData")) {
        try {
          const ciphertext = CryptoJS.AES.encrypt(
            JSON.stringify(authData),
            secretKey
          ).toString();
          localStorage.setItem("authData", ciphertext);
        } catch (e) {
          console.log("Error encrypting data: ", e);
        }
      }
    }
  }, [authData, authData.achievements]);

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
    const authDataFromLocalStorage = localStorage.getItem("authData");
    console.log(authDataFromLocalStorage);
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

  const isMobile = window.innerWidth < 768;

  React.useEffect(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("iPhone") && userAgent.includes("Safari")) {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.style.height = "90vh";
      }
    }
  }, []);

  return isMobile ? (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#8692a6",
          colorText: "#8692a6",
          fontFamily: "Poppins, sans-serif",
          colorWarning: "#ff4d4f",
        },
        components: {
          Button: {
            borderRadius: 30,
            borderRadiusLG: 30,
          },
          Radio: {
            borderRadius: 30,
            controlHeight: 50,
            fontSize: 20,
            radioSize: 30,
          },
          Modal: {
            borderRadius: 30,
          },
          Input: {
            borderRadius: 30,
            paddingBlock: 10,
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
            <Route path="/login" element={<MobileLoginPage />} />
            <Route path="/" element={<MobileLayout />}>
              <Route index element={<Navigate to={"/home"} />} />
              <Route path="/home" element={<MobileMainPage />} />
              <Route path="/tests" element={<MobileTestsPage />} />
              <Route path="/tests/:id" element={<MobileTestPage />} />
              <Route
                path="/notifications"
                element={<MobileNotificationPage />}
              />
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </TestContext.Provider>
      </AuthContext.Provider>
    </ConfigProvider>
  ) : (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#8692a6",
          colorText: "#8692a6",
          fontFamily: "Poppins, sans-serif",
          colorWarning: "#ff4d4f",
        },
        components: {
          Button: {
            borderRadius: 30,
            borderRadiusLG: 30,
          },
          Radio: {
            borderRadius: 30,
            controlHeight: 50,
            fontSize: 20,
            radioSize: 30,
          },
          Modal: {
            borderRadius: 30,
          },
          Input: {
            borderRadius: 30,
            paddingBlock: 10,
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
          </Routes>
        </TestContext.Provider>
      </AuthContext.Provider>
    </ConfigProvider>
  );
}

export default App;
