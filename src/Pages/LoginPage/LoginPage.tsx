import "./LoginPage.css";
import React from "react";
import AuthContext from "../../Misc/AuthContext";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Input, Modal, Button, Select, Drawer, Form, Checkbox } from "antd";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db, auth } from "../../Misc/Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { message } from "antd";
import backgroundImage from "../../assets/login--background.png";
import profilePicture from "../../assets/default-profile.png";
import CryptoJS from "crypto-js";
import { AuthData } from "../../Misc/AuthContext";
import { Quotes } from "../../Misc/Quotes";
import Vector from "../../assets/Quiz Game Vector.svg";
import Quote from "../../assets/Quiz Game Community.png";
import BrightSound from "../../assets/Sounds/Metal Mallet Ping.mp3";
import NegativeSound from "../../assets/Sounds/Bright.mp3";
import { Link } from "react-router-dom";

type LoginStatus =
  | ""
  | "validating"
  | "success"
  | "error"
  | "warning"
  | undefined;

export default function LoginPage() {
  if (!AuthContext) {
    throw new Error(
      "authContext is undefined, please ensure it is provided via AuthContext.Provider"
    );
  }
  const [showSignUp, setShowSignUp] = React.useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [userAuthData, setUserAuthData] = React.useState<any>({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const secretKey = "idcboutyou";
  const [loginStatus, setLoginStatus] = React.useState<LoginStatus>("");
  const { setAuthData } = React.useContext(AuthContext);
  const randomQuote = React.useMemo(() => {
    const randomIndex = Math.floor(Math.random() * Quotes.length);
    return Quotes[randomIndex];
  }, []);
  const positiveSound = new Audio(BrightSound);
  const negativeSound = new Audio(NegativeSound);

  React.useEffect(() => {
    const bytes = localStorage.getItem("userData");
    if (bytes) {
      try {
        const userData = JSON.parse(
          CryptoJS.AES.decrypt(bytes, secretKey).toString(CryptoJS.enc.Utf8)
        );
        setUserAuthData(userData);
      } catch (error) {
        console.log(error);
      }
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
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        setLoginStatus(undefined);
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
          timeStamp: Date.now(),
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
        positiveSound.play();
        setIsLoading(false);
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
          okText: "Отлично!",
        });
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "auth/email-already-in-use") {
          setIsLoading(false);
          negativeSound.play();
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
    setLoginStatus("validating");
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
          const authData = userDocSnap.data();
          const userData = {
            email: values.email,
            password: values.password,
            remember: values.remember,
          };
          setUserAuthData(userData);
          setAuthData(authData as AuthData);
          if (values.remember) {
            const ciphertext = CryptoJS.AES.encrypt(
              JSON.stringify(values),
              secretKey
            ).toString();
            localStorage.setItem("userData", ciphertext);
            const encryptedAuthData = CryptoJS.AES.encrypt(
              JSON.stringify(userDocSnap.data()),
              secretKey
            ).toString();
            localStorage.setItem("authData", encryptedAuthData);
          } else {
            localStorage.removeItem("userData");
            localStorage.removeItem("authData");
          }
          positiveSound.play();
          messageApi.open({
            type: "success",
            content: "Вы успешно вошли в аккаунт",
          });
          setLoginStatus("success");
          setTimeout(() => {
            navigate("/home");
          }, 1000);
        } else {
          console.log("No such document!");
        }
      }
    } catch (error) {
      setIsLoading(false);
      setLoginStatus("error");
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "auth/invalid-login-credentials") {
          negativeSound.play();
          Modal.error({
            title: "Ошибка",
            content: "Проверьте правильность введенных данных",
            styles: {
              mask: {
                backdropFilter: "blur(10px)",
              },
            },
            okText: "Я исправлюсь!",
          });
          console.log(error);
        } else {
          negativeSound.play();
          Modal.error({
            title: "Ошибка",
            content: "Что-то пошло не так",
            style: {
              backdropFilter: "blur(10px)",
            },
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

  if (window.innerWidth < 768)
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
                  style={{ width: "100%", maxWidth: "70%" }}
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
                  style={{ width: "100%", maxWidth: "70%" }}
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
                          return Promise.reject(
                            new Error("Пароли не совпадают")
                          );
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

  return (
    <>
      {contextHolder}
      <div className={"login--page"}>
        <div className={"login--page--left"}>
          <div className="login--page--left--profile--container">
            <img
              className={"login--page--left--profile--picture--quote"}
              src={Quote}
            />
            <p className={"login--page--left--quote"}>{randomQuote.quote}</p>
            <p className="login--page--left--author">{randomQuote.author}</p>
            <img
              className={"login--page--left--profile--picture"}
              src={Vector}
            />
          </div>
          <img
            className={"login--page--left--background"}
            src={backgroundImage}
          />
        </div>
        <div className={"login--page--right"}>
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
                hasFeedback
                validateStatus={loginStatus}
                name="email"
                style={{ width: "100%", maxWidth: "100vw" }}
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
                  placeholder="Почта"
                />
              </Form.Item>
              <Form.Item
                hasFeedback
                name="password"
                rules={[
                  { required: true, message: "Введите пароль!" },
                  { min: 6, message: "Пароль должен быть не менее 6 символов" },
                ]}
                style={{ width: "100%" }}
                validateStatus={loginStatus}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Пароль"
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
              width={"50vw"}
              onClose={closeDrawer}
              open={showSignUp}
              styles={{
                mask: {
                  backdropFilter: "blur(5px)",
                },
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
                  <Input placeholder="Введите имя" />
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
                  <Input placeholder="Введите фамилию" />
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
                    <Select.Option value="СТОМ">СТОМ</Select.Option>
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
                  <Input placeholder="Введите почту" />
                </Form.Item>
                <Form.Item
                  name={"password"}
                  label="Пароль"
                  rules={[
                    {
                      required: true,
                      message: "Пожалуйста, введите пароль",
                    },
                    {
                      min: 6,
                      message: "Пароль должен быть не менее 6 символов",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Введите пароль" />
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
                  <Input.Password placeholder="Подтвердите пароль" />
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
                    Я прочитал <Link to={"/userlicense"}>соглашение</Link>
                  </Checkbox>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                  <Button type="primary" htmlType="submit" loading={isLoading}>
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
