import React from "react";
import { Button, Modal, Radio, Space, Spin, Tooltip, message } from "antd";
import "../TestPage/TestPage.css";
import { useParams } from "react-router-dom";
import TestContext from "../../Misc/TestsContext";
import AuthContext from "../../Misc/AuthContext";
import { LoadingOutlined } from "@ant-design/icons";
import { useTransition, animated } from "react-spring";
import math from "../../assets/CategoryPictures/Математика📏.jpeg";
import right from "../../assets/CategoryPictures/right.jpeg";
import coding from "../../assets/CategoryPictures/Программирование💻.jpeg";

export default function TestPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [value, setValue] = React.useState("");
  const { testData, setTestData } = React.useContext(TestContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [testState, setTestState] = React.useState<any>({
    isStarted: false,
    isFinished: false,
    right: 0,
    wrong: 0,
  });
  const { id } = useParams();
  const [test, setTest] = React.useState<any>({});
  const [time, setTime] = React.useState(0); // 20 minutes in seconds
  const { authData, setAuthData } = React.useContext(AuthContext);
  const [imgSrc, setImgSrc] = React.useState<any>("");

  React.useEffect(() => {
    if (testState.isFinished) {
      Modal.success({
        title: "Тест завершён",
        content: (
          <>
            <p>
              Правильных ответов: <strong>{testState.right}</strong>
            </p>
            <p>
              Неправильных ответов: <strong>{testState.wrong}</strong>
            </p>
          </>
        ),
        onOk() {
          setTestState((prevTestState: any) => ({
            ...prevTestState,
            isFinished: false,
            isStarted: false,
            right: 0,
            wrong: 0,
          }));
          setCurrentQuestionIndex(0);
          setAuthData((prevAuthData: any) => ({
            ...prevAuthData,
            stats: {
              ...prevAuthData.stats,
              testsPassed: prevAuthData.stats.testsPassed + 1,
              correctAnswers:
                prevAuthData.stats.correctAnswers + testState.right,
              fastestTest:
                prevAuthData.stats.fastestTest === 0
                  ? test?.time - time
                  : Math.min(prevAuthData.stats.fastestTest, test?.time - time),
              wrongAnswers: prevAuthData.stats.wrongAnswers + testState.wrong,
            },
            achievements: prevAuthData.achievements.map((achievement: any) => {
              if (
                achievement.name === "Тестер" &&
                prevAuthData.stats.testsPassed >= 10 &&
                prevAuthData.stats.testsPassed < 20
              ) {
                return {
                  ...achievement,
                  locked: false,
                };
              } else if (
                achievement.name === "Супер тестер" &&
                prevAuthData.stats.testsPassed >= 20 &&
                prevAuthData.stats.testsPassed < 50
              ) {
                return {
                  ...achievement,
                  locked: false,
                };
              } else if (
                achievement.name === "Самый быстрый!" &&
                time < 60 &&
                time > 0
              ) {
                return {
                  ...achievement,
                  locked: false,
                };
              } else if (
                achievement.name === "Первый тест" &&
                prevAuthData.stats.testsPassed === 1
              ) {
                return {
                  ...achievement,
                  locked: false,
                };
              } else if (
                achievement.name === "Безупречно!" &&
                testState.wrong === 0
              ) {
                return {
                  ...achievement,
                  locked: false,
                };
              } else return achievement;
            }),
          }));
          // authData.stats.testsPassed >= 10 && authData.stats.testsPassed < 20;
          // setAuthData((prevAuthData: any) => ({
          //   ...prevAuthData,
          //   achievements: [
          //     ...prevAuthData.achievements,
          //     {
          //       name: "Тестер",
          //       description: "Пройти 10 тестов",
          //       locked: false,
          //     },
          //   ],
          // }));
          // authData.stats.testsPassed >= 20 && authData.stats.testsPassed < 50;
          // setAuthData((prevAuthData: any) => ({
          //   ...prevAuthData,
          //   achievements: [
          //     ...prevAuthData.achievements,
          //     {
          //       name: "Супер тестер",
          //       description: "Пройти 20 тестов",
          //       locked: false,
          //     },
          //   ],
          // }));
          // time < 60 && time > 0;
          // setAuthData((prevAuthData: any) => ({
          //   ...prevAuthData,
          //   achievements: [
          //     ...prevAuthData.achievements,
          //     {
          //       name: "Самый быстрый!",
          //       description: "Пройти тест быстрее 1 минуты",
          //       locked: false,
          //     },
          //   ],
          // }));
          setTestData((prevTestData: any) => {
            const newTestData = [...prevTestData];
            const testIndex = newTestData.findIndex(
              (test: any) => test?.id === id
            );
            if (
              !newTestData[testIndex].users.some(
                (user: any) => user?.id === authData.uid
              )
            ) {
              console.log("pushing");
              newTestData[testIndex].users.push({
                id: authData.uid,
                rightCount: testState.right,
                wrongCount: testState.wrong,
                time: test?.time - time,
                name: authData.firstName + " " + authData.lastName,
                rightPercentage: Math.floor(
                  (testState.right / test?.questions.length) * 100
                ),
                group: authData.group,
              });
            }
            console.log(newTestData[testIndex].users);
            return newTestData;
          });
        },
      });
    }
  }, [testState]);

  React.useEffect(() => {
    setTest(testData.find((test: any) => test?.id === id));
  }, [testData, id]);

  React.useEffect(() => {
    setTime(test?.time);
  }, [test]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (testState.isStarted) {
      timer = setInterval(() => {
        setTime((prevTime: number) => prevTime - 1);
      }, 1000);
    } else {
      setTime(test?.time); // reset the time to the test time
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [testState.isStarted, test?.time]);

  const handleAnswer = () => {
    if (value === "") {
      messageApi.open({
        type: "error",
        content: "Выберите ответ",
      });
      return;
    }
    if (
      test?.questions?.[currentQuestionIndex]?.answers.find(
        (answer: any) => answer.text === value
      ).isCorrect === true
    ) {
      setTestState((prevTestState: any) => ({
        ...prevTestState,
        right: prevTestState.right + 1,
      }));
      messageApi.open({
        type: "success",
        content: "Правильный ответ",
      });
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setTestState((prevTestState: any) => ({
        ...prevTestState,
        wrong: prevTestState.wrong + 1,
      }));
      messageApi.open({
        type: "error",
        content: "Неправильный ответ",
      });
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setValue("");
  };

  const categoryImage = () => {
    switch (test?.category) {
      case "Математика📏":
        console.log("math");
        return math;
      case "Правоведение📚":
        return right;
      case "Программирование💻":
        return coding;
    }
  };

  React.useEffect(() => {
    let newImgSrc;
    if (testState.isStarted) {
      newImgSrc = test?.questions?.[currentQuestionIndex]?.picture
        ? test?.questions?.[currentQuestionIndex]?.picture
        : test
        ? categoryImage()
        : undefined;
    } else {
      newImgSrc = test ? categoryImage() : undefined;
    }
    setImgSrc(newImgSrc);
  }, [testState.isStarted, currentQuestionIndex, test]);

  React.useEffect(() => {
    if (categoryImage() === imgSrc) {
      return;
    }
    setLoading(true);
  }, [imgSrc]);

  const transitions = useTransition(
    test?.questions?.[currentQuestionIndex]?.question,
    {
      from: { opacity: 0, transform: "translate3d(100%,0,0)" },
      enter: { opacity: 1, transform: "translate3d(0%,0,0)", delay: 500 },
      leave: { opacity: 0, transform: "translate3d(-50%,0,0)" },
    }
  );

  const answers = test?.questions?.[currentQuestionIndex]?.answers;

  const answerTransitions = useTransition(answers, {
    from: { opacity: 0, transform: "translate3d(100%,0,0)" },
    enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
    keys: (index) => index,
    trail: 500,
  });

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const secondTransitions = useTransition(seconds, {
    from: {
      position: "absolute" as const,
      opacity: 0,
      transform: "translate3d(0,-40px,0)",
    },
    enter: { opacity: 1, transform: "translate3d(0,0px,0)" },
    leave: { opacity: 0, transform: "translate3d(0,40px,0)" },
    keys: seconds,
  });

  const questionCountTransitions = useTransition(currentQuestionIndex, {
    from: {
      position: "absolute",
      opacity: 0,
      transform: "translate3d(0,-40px,0)",
    },
    enter: { opacity: 1, transform: "translate3d(0,0px,0)" },
    leave: { opacity: 0, transform: "translate3d(0,40px,0)" },
    keys: currentQuestionIndex,
  });

  return (
    <>
      {contextHolder}
      <div className={"right--body--section"}>
        <div className={"test--page--top--section"}>
          <div className={"test--page--top--section--left"}>
            <h1 className={"test--page--top--section--left--title"}>
              {test?.name}
            </h1>
            <p className={"test--page--top--section--left--description"}>
              {testState.isStarted
                ? "Ответьте на вопросы снизу"
                : "Прочтите следующие инструкции"}
            </p>
          </div>
          <div className={"test--page--top--section--right--timer"}>
            <strong>{minutes}:</strong>
            <div style={{ position: "relative", display: "inline-block" }}>
              {secondTransitions((style, item) => (
                <animated.strong style={style}>
                  {item < 10 ? "0" : ""}
                  {item}
                </animated.strong>
              ))}
            </div>
          </div>
        </div>
        <div className={"test--page--middle--section"}>
          <div className={"test--page--middle--section--left"}>
            <animated.div
              className={"test--page--middle--section--left--image"}
            >
              <Spin
                spinning={loading}
                indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />}
              >
                <img
                  className={"test--image"}
                  src={imgSrc}
                  onLoad={() => {
                    setLoading(false);
                  }}
                />
              </Spin>
            </animated.div>
          </div>
          <div className={"test--page--middle--section--right"}>
            {testState.isStarted ? (
              <div className={"test--page--middle--section--right--count"}>
                <h3
                  style={{
                    marginRight: "0.5vw",
                  }}
                >
                  Вопрос
                </h3>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    alignItems: "center",
                    width: "1vw",
                    height: "5px",
                    marginRight: "0.5vw",
                  }}
                >
                  {questionCountTransitions((style, item) => (
                    <animated.h3
                      style={{
                        ...style,
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                      {item + 1}
                    </animated.h3>
                  ))}
                </div>
                <h3>{`из ${test?.questions?.length}`}</h3>
              </div>
            ) : null}
            <div
              className={
                "test--page--middle--section--right--question--container"
              }
            >
              {testState.isStarted ? (
                transitions((style, item) => (
                  <animated.p
                    style={style}
                    className={"test--page--middle--section--right--question"}
                  >
                    {item}
                  </animated.p>
                ))
              ) : (
                <>
                  <p className="test--page--middle--section--description">
                    <strong>Дата добавления:</strong> {test?.date}
                  </p>
                  <p className="test--page--middle--section--description">
                    <strong>Время на тест:</strong> {test?.time / 60} минут
                  </p>
                  <p className="test--page--middle--section--description">
                    <strong>Категория:</strong> {test?.category}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={"test--page--bottom--section"}>
          {testState.isStarted ? (
            <Radio.Group buttonStyle={"solid"}>
              <Space direction="vertical">
                {answerTransitions((style, item) => (
                  <animated.div style={style}>
                    <Radio.Button
                      onChange={() => setValue(item.text)}
                      value={item.text}
                    >
                      {item.text}
                    </Radio.Button>
                  </animated.div>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <p>
              {`Этот тест состоит из ${test?.questions?.length} вопросов с
              множественным выбором. Чтобы успешно пройти тесты, важно хорошо
              разбираться в темах. Имейте в виду следующее: Отведённое время -
              вам нужно выполнить каждую из ваших попыток за один присест, так
              как на каждую попытку вам отведено ${
                test?.time / 60
              } минут. Ответы
              - Вы можете просмотреть свои варианты ответов и сравнить их с
              правильными ответами после вашей последней попытки. Чтобы начать,
              нажмите кнопку "Старт". Когда закончите, нажмите кнопку
              "Завершить".`}
            </p>
          )}
        </div>
        <div className={"test--page--bottom--section--buttons"}>
          {testState.isStarted ? (
            currentQuestionIndex === test?.questions.length - 1 ? (
              <Button
                className={"test--page--button"}
                type="primary"
                size="large"
                onClick={() => {
                  handleAnswer();
                  setTestState((prevTestState: any) => ({
                    ...prevTestState,
                    isFinished: true,
                    isStarted: false,
                  }));
                }}
              >
                Завершить
              </Button>
            ) : (
              <Button
                className={"test--page--button"}
                type="primary"
                size="large"
                onClick={() => {
                  handleAnswer();
                }}
              >
                Следующий вопрос
              </Button>
            )
          ) : (
            <>
              <Tooltip
                title={
                  !test?.users?.some((user: any) => user.id === authData.uid)
                    ? "Вы ещё не прошли этот тест"
                    : "Показать результаты"
                }
                placement={"top"}
              >
                <Button
                  className={"test--page--button"}
                  type="primary"
                  size="large"
                  disabled={
                    !test?.users?.some((user: any) => user.id === authData.uid)
                  }
                  onClick={() => {
                    Modal.info({
                      title: "Ваши результаты",
                      content: (
                        <>
                          <p>
                            Правильных ответов:{" "}
                            <strong>
                              {
                                test?.users?.find(
                                  (user: any) => user.id === authData.uid
                                ).rightCount
                              }
                            </strong>
                          </p>
                          <p>
                            Неправильных ответов:{" "}
                            <strong>
                              {
                                test?.users?.find(
                                  (user: any) => user.id === authData.uid
                                ).wrongCount
                              }
                            </strong>
                          </p>
                          <p>
                            Время:{" "}
                            <strong>
                              {Math.floor(
                                test?.users?.find(
                                  (user: any) => user.id === authData.uid
                                ).time / 60
                              )}
                              :
                              {test?.users?.find(
                                (user: any) => user.id === authData.uid
                              ).time %
                                60 <
                              10
                                ? "0"
                                : ""}
                              {test?.users?.find(
                                (user: any) => user.id === authData.uid
                              ).time % 60}
                            </strong>
                          </p>
                          <p>
                            Процент правильных ответов:{" "}
                            <strong>
                              {
                                test?.users?.find(
                                  (user: any) => user.id === authData.uid
                                ).rightPercentage
                              }
                              %
                            </strong>
                          </p>
                        </>
                      ),
                    });
                  }}
                >
                  Показать результаты
                </Button>
              </Tooltip>
              <Tooltip
                title={
                  test?.users?.some((user: any) => user.id === authData.uid)
                    ? "Вы уже прошли этот тест"
                    : "Нажмите, чтобы начать тест"
                }
                placement={"top"}
              >
                <Button
                  onClick={() => {
                    setTestState((prevTestState: any) => ({
                      ...prevTestState,
                      isStarted: true,
                    }));
                  }}
                  className={"test--page--button"}
                  type="primary"
                  size="large"
                  style={{ marginLeft: 20 }}
                  // disabled={
                  //   testState.isFinished ||
                  //   test?.users?.some((user: any) => user.id === authData.uid)
                  // }
                >
                  Старт
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </>
  );
}
