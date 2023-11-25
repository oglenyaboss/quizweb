import React from "react";
import "./Styles/App.css";
import { Routes, Route } from "react-router-dom";
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
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import AdminTestsPage from "./Pages/AdminTestsPage/AdminTestsPage";
import AdminTestPage from "./Pages/AdminTestPage/AdminTestPage";
import { debounce } from "lodash";

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

  const [testData, setTestData] = React.useState<any>([]);

  React.useEffect(() => {
    const updateFirebase = async () => {
      try {
        await setDoc(doc(db, "users", authData.uid), {
          firstName: authData.firstName,
          lastName: authData.lastName,
          group: authData.group,
          uid: authData.uid,
          profilePicUrl: authData.profilePicUrl,
          stats: {
            testsPassed: authData.stats.testsPassed,
            correctAnswers: authData.stats.correctAnswers,
            fastestTest: authData.stats.fastestTest,
          },
          achievements: authData.achievements,
        });
        console.log(authData + " updated authData");
      } catch (e) {
        console.log("Error updating Firebase: ", e);
      }
    };
    if (authData.uid) {
      updateFirebase();
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
            await setDoc(doc(db, "tests", test.id), {
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
    if (authDataFromLocalStorage) {
      setAuthData(JSON.parse(authDataFromLocalStorage));
    }
  }, []);

  const isMobile = window.innerWidth < 768;

  return isMobile ? (
    <div className="mobile">
      <h1 className="mobile--title">Мобильная версия сайта в разработке 😢</h1>
      <img
        width="200"
        height="200"
        src="https://img.icons8.com/emoji/96/hammer-and-wrench.png"
        alt="hammer-and-wrench"
      />
    </div>
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
              <Route path="/tests/:id" element={<TestPage />} />
              <Route path="/tests" element={<TestsPage />} />
              <Route path="/home" element={<MainPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/admin/tests" element={<AdminTestsPage />} />
              <Route path="/admin/tests/:id" element={<AdminTestPage />} />
            </Route>
            <Route path="*" element={<h1>404</h1>} />
          </Routes>
        </TestContext.Provider>
      </AuthContext.Provider>
    </ConfigProvider>
  );
}

export default App;
