import "./MobileLoginPage.css";
import React from "react";
import AuthContext from "../../../Misc/AuthContext";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Input, Modal, Button, Select, Drawer, Form, Checkbox } from "antd";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db, auth } from "../../../Misc/Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { message } from "antd";
import { AuthData } from "../../../Misc/AuthContext";
import backgroundImage from "../../../assets/login--background.png";
import profilePicture from "../../../assets/default-profile.png";

export default function LoginPage() {
  const authContext = React.useContext(AuthContext);
  if (!AuthContext) {
    throw new Error(
      "authContext is undefined, please ensure it is provided via AuthContext.Provider"
    );
  }
  const { setAuthData } = authContext;
  const [showSignUp, setShowSignUp] = React.useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [userAuthData, setUserAuthData] = React.useState<any>({});
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const user = localStorage.getItem("userData");
    console.log(user);
    if (user) {
      setUserAuthData(JSON.parse(user));
      console.log(userAuthData);
    }
    setLoading(false);
  }, []);
  if (loading) {
    return;
  }

  const showDrawer = () => {
    setShowSignUp(true);
  };

  const closeDrawer = () => {
    setShowSignUp(false);
  };

  const formItemLayout = {};

  const tailFormItemLayout = {};

  const handleSignUp = async (values: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        await setDoc(userDoc, {
          firstName: values.firstName,
          lastName: values.lastName,
          group: values.group,
          uid: user.uid,
          profilePicUrl: profilePicture,
          permissions: "user",
          stats: {
            testsPassed: 0,
            correctAnswers: 0,
            fastestTest: 0,
          },
          achievements: [
            {
              name: "Первый вход",
              description: "Вы впервые вошли в аккаунт",
              locked: false,
            },
            {
              name: "Первый тест",
              description: "Вы впервые прошли тест",
              locked: true,
            },
            {
              name: "Безупречно!",
              description: "Вы прошли тест без ошибок",
              locked: true,
            },
            {
              name: "Самый быстрый",
              description: "Вы прошли тест быстрее минуты",
              locked: true,
            },
            {
              name: "Тестер",
              description: "Вы прошли 10 тестов",
              locked: true,
            },
            {
              name: "Супер тестер",
              description: "Вы прошли 20 тестов",
              locked: true,
            },
          ],
        });
        Modal.success({
          title: "Успешно",
          content: "Вы успешно зарегистрировались",
          styles: {
            mask: {
              backdropFilter: "blur(10px)",
            },
          },
          onOk: () => {
            setShowSignUp(false);
          },
        });
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "auth/email-already-in-use") {
          Modal.error({
            title: "Ошибка",
            content: "Пользователь с такой электронной почтой уже существует",
            styles: {
              mask: {
                backdropFilter: "blur(10px)",
              },
            },
            onOk: () => {
              setShowSignUp(false);
            },
          });
        }
      }
      console.log(error);
    }
  };

  const handleLogIn = async (values: any) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          console.log("User data:", userDocSnap.data());
          setAuthData(userDocSnap.data() as AuthData);
          if (values.remember) {
            localStorage.setItem("userData", JSON.stringify(values));
            localStorage.setItem(
              "authData",
              JSON.stringify(userDocSnap.data())
            );
            console.log("Saved to local storage");
            console.log(localStorage.getItem("userData"));
          } else {
            localStorage.removeItem("userData");
            localStorage.removeItem("authData");
            console.log("Removed from local storage");
          }
          messageApi.open({
            type: "success",
            content: "Вы успешно вошли в аккаунт",
          });
          setTimeout(() => {
            navigate("/home");
          }, 1000);
        } else {
          console.log("No such document!");
        }
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "auth/invalid-login-credentials") {
          Modal.error({
            title: "Ошибка",
            content: "Проверьте правильность введенных данных",
            styles: {
              mask: {
                backdropFilter: "blur(10px)",
              },
            },
          });
          console.log(error);
        } else {
          Modal.error({
            title: "Ошибка",
            content: "Что-то пошло не так",
            styles: {
              mask: {
                backdropFilter: "blur(10px)",
              },
            },
          });
          console.log(error);
        }
      }
    }
  };

  const email: string = userAuthData.email;
  const password: string = userAuthData.password;

  console.log(email);

  return (
    <>
      {contextHolder}
      <div className={"login--page"}>
        <img src={backgroundImage} className={"login--page--background"} />
        <div className={"login--page--container"}>
          <div className={"login--page--right--content"}>
            <h1 className={"login--page--right--title"}>Войти в аккаунт</h1>
            <p className={"login--page--right--subtitle"}>
              Используя логин и пароль
            </p>
            <Form
              name="normal_login"
              className="login-form"
              initialValues={{
                email: email,
                password: password,
                remember: true,
              }}
              onFinish={handleLogIn}
            >
              <Form.Item
                name="email"
                style={{ width: "100%" }}
                rules={[
                  {
                    type: "email",
                    message: "Вы ввели неверный формат электронной почты!",
                  },
                  { required: true, message: "Введите электронную почту!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Email"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Введите пароль!" }]}
                style={{ width: "100%" }}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Запомнить меня?</Checkbox>
                </Form.Item>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login--page--right--form--button"
                  loading={isLoading}
                >
                  Войти
                </Button>
              </Form.Item>
            </Form>

            <Button
              onClick={showDrawer}
              className={"login--page--right--form--button--sign-up"}
            >
              Зарегистрироваться
            </Button>
            <Drawer
              title="Создание нового аккаунта"
              width={"100vw"}
              onClose={closeDrawer}
              open={showSignUp}
              styles={{
                body: {
                  paddingBottom: 80,
                },
              }}
            >
              <Form
                layout="vertical"
                {...formItemLayout}
                form={form}
                name="register"
                onFinish={handleSignUp}
                scrollToFirstError
                style={{ height: "100%" }}
              >
                <Form.Item
                  name={"firstName"}
                  label="Имя"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите свое имя",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={"lastName"}
                  label="Фамилия"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите свою фамилию",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={"group"}
                  label="Группа"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, выберите свою группу",
                    },
                  ]}
                >
                  <Select
                    placeholder="Выберите группу"
                    style={{ borderRadius: 30 }}
                  >
                    <Select.Option value="БИН21-01">БИН21-01</Select.Option>
                    <Select.Option value="БИМ21-01">БИМ21-01</Select.Option>
                    <Select.Option value="БПА21-01">БПА21-01</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={"email"}
                  label="Электронная почта"
                  rules={[
                    {
                      type: "email",
                      message: "Неверный формат электронной почты",
                    },
                    {
                      required: true,
                      message: "Пожалуйста, введите свою электронную почту",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={"password"}
                  label="Пароль"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите пароль",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name={"confirm"}
                  label="Подтвердите пароль"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, подтвердите пароль",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Пароли не совпадают"));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Пожалуйста, подтвердите соглашение")
                            ),
                    },
                  ]}
                  {...tailFormItemLayout}
                >
                  <Checkbox>
                    Я прочитал <a href="">соглашение</a>
                  </Checkbox>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                  <Button type="primary" htmlType="submit">
                    Зарегистрироваться
                  </Button>
                </Form.Item>
              </Form>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
}
