import React from "react";
import {
  Button,
  Input,
  Modal,
  message,
  InputNumber,
  DatePicker,
  Select,
  Spin,
  Table,
  Tooltip,
  Tour,
} from "antd";
const { TextArea } = Input;
import "../TestPage/TestPage.css";
import { useParams } from "react-router-dom";
import TestContext, { TestData, Test } from "../../Misc/TestsContext";
import AuthContext from "../../Misc/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../Misc/Firebase";
import { LoadingOutlined } from "@ant-design/icons";
import type { FilterValue } from "antd/es/table/interface";
import math from "../../assets/CategoryPictures/Математика📏.jpeg";
import right from "../../assets/CategoryPictures/right.jpeg";
import coding from "../../assets/CategoryPictures/Программирование💻.jpeg";

export default function TestPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [loadingImg, setLoadingImg] = React.useState(false);
  const { testData, setTestData } = React.useContext(TestContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [testState, setTestState] = React.useState<any>({
    isStarted: false,
    isFinished: false,
  });
  const { id } = useParams();
  const [test, setTest] = React.useState<any>({});
  const [time, setTime] = React.useState(0); // 20 minutes in seconds
  const { authData, setAuthData } = React.useContext(AuthContext);
  const [, setFilteredInfo] = React.useState<
    Record<string, FilterValue | null>
  >({});
  const [tourOpen, setTourOpen] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState<any>("");

  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLImageElement>(null);
  const ref3 = React.useRef<HTMLDivElement>(null);
  const ref5 = React.useRef<HTMLInputElement>(null);
  const ref6 = React.useRef<HTMLDivElement>(null);
  const ref7 = React.useRef<HTMLDivElement>(null);
  const ref8 = React.useRef<HTMLButtonElement>(null);
  const ref9 = React.useRef<HTMLButtonElement>(null);

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
              fastestTest: prevAuthData.stats.fastestTest > time ? time : 0,
              wrongAnswers: prevAuthData.stats.wrongAnswers + testState.wrong,
            },
          }));
          setTestData((prevTestData: any) => {
            const newTestData = [...prevTestData];
            const testIndex = newTestData.findIndex(
              (test: any) => test?.id === id
            );
            if (!newTestData[testIndex].users.includes(authData.uid)) {
              console.log("pushing");
              newTestData[testIndex].users.push(authData.uid);
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

  const handleUpload = (file: any, testId: string, questionIndex: number) => {
    const storageRef = ref(
      storage,
      "testPictures/" + testId + "/" + questionIndex
    );

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
          setTestData((prevTestData: any) => {
            const newTestData = [...prevTestData];
            const testIndex = newTestData.findIndex(
              (test: any) => test?.id === id
            );
            newTestData[testIndex].questions[questionIndex].picture =
              downloadURL;
            return newTestData;
          });
          console.log("File available at", downloadURL);
        });
      }
    );
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    questionIndex: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file, test?.id, questionIndex);
    }
  };

  const categoryImage = () => {
    switch (test?.category) {
      case "Математика📏":
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
    if (imgSrc === categoryImage()) {
      return;
    }
    setLoadingImg(true);
  }, [imgSrc]);

  const tourSteps = [
    {
      title: "Название теста",
      description: "Введите название теста",
      target: () => ref1?.current!,
      nextButtonProps: {
        children: "Далее",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Изображение теста",
      description: "Нажмите на изображение, чтобы изменить его",
      target: () => ref2?.current!,
      nextButtonProps: {
        children: "Далее",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Время",
      description: "Введите время",
      target: () => ref5?.current!,
      nextButtonProps: {
        children: "Далее",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Категория",
      description: "Выберите категорию",
      target: () => ref6?.current!,
      nextButtonProps: {
        children: "Далее",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Результаты",
      description: "Посмотрите результаты учеников",
      target: () => ref8?.current!,
      nextButtonProps: {
        children: "Далее",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Старт",
      description: "Нажмите, чтобы начать тест",
      target: () => ref9?.current!,
      nextButtonProps: {
        children: "Перейти к вопросам",
        onClick: () => {
          setTestState((prevTestState: any) => ({
            ...prevTestState,
            isStarted: true,
          }));
          setTestData((prevTestData: any) => {
            const newTestData = [...prevTestData];
            const testIndex = newTestData.findIndex(
              (test: any) => test?.id === id
            );
            newTestData[testIndex].questions.length === 0
              ? newTestData[testIndex].questions.push({
                  question: "",
                  picture: "",
                  answers: [
                    {
                      text: "",
                      isCorrect: false,
                    },
                    {
                      text: "",
                      isCorrect: false,
                    },
                    {
                      text: "",
                      isCorrect: false,
                    },
                    {
                      text: "",
                      isCorrect: false,
                    },
                  ],
                  correctAnswer: "",
                  // add more fields as needed
                })
              : null;
            return newTestData;
          });
        },
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Вопрос",
      description: "Введите вопрос",
      target: () => ref3?.current!,
      nextButtonProps: {
        children: "Далее",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
    {
      title: "Ответы",
      description: "Введите ответы",
      target: () => ref7?.current!,
      nextButtonProps: {
        children: "Завершить",
      },
      prevButtonProps: {
        children: "Назад",
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <div className={"right--body--section"}>
        <div className={"test--page--top--section"}>
          <div className={"test--page--top--section--left"}>
            <h1 className={"test--page--top--section--left--title"}>
              {testState.isStarted ? (
                test?.name
              ) : (
                <div ref={ref1}>
                  <Input
                    value={test?.name}
                    onChange={(e) => {
                      setTestData((prevTestData: TestData[]) => {
                        const newTestData = [...prevTestData];
                        const testIndex = newTestData.findIndex(
                          (test: Test) => test?.id === id
                        );
                        newTestData[testIndex].name = e.target.value;
                        return newTestData;
                      });
                    }}
                  />
                </div>
              )}
            </h1>
            <p className={"test--page--top--section--left--description"}>
              {testState.isStarted
                ? "Ответьте на вопросы снизу"
                : "Прочтите следующие инструкции"}
            </p>
          </div>
          <div className={"test--page--top--section--right"}>
            <div className={"test--page--top--section--right--timer"}>
              Таймер:{" "}
              <strong>
                {Math.floor(time / 60)}:{time % 60 < 10 ? "0" : ""}
                {time % 60}{" "}
              </strong>{" "}
              минут
            </div>
          </div>
        </div>
        <div className={"test--page--middle--section"}>
          <div className={"test--page--middle--section--left"}>
            <div className={"test--page--middle--section--left--image"}>
              <label htmlFor="file--input">
                <Spin
                  spinning={loadingImg}
                  indicator={<LoadingOutlined style={{ fontSize: 30 }} />}
                >
                  <Tooltip
                    title={"Нажмите, чтобы изменить фото"}
                    placement={"top"}
                  >
                    <img
                      ref={ref2}
                      className={"test--image"}
                      onLoad={() => {
                        setLoadingImg(false);
                      }}
                      src={imgSrc}
                    />
                  </Tooltip>
                </Spin>
              </label>
              {testState.isStarted ? (
                <input
                  id={"file--input"}
                  type={"file"}
                  style={{ display: "none" }}
                  onChange={(event) => {
                    handleFileChange(event, currentQuestionIndex);
                  }}
                />
              ) : null}
            </div>
          </div>
          <div className={"test--page--middle--section--right"}>
            {testState.isStarted ? (
              <div className={"test--page--middle--section--right--count"}>
                <h3
                  className={"test--page--middle--section--right--count--title"}
                >
                  {`Вопрос ${currentQuestionIndex + 1} из ${
                    test?.questions?.length
                  }`}
                </h3>
              </div>
            ) : null}
            <div
              className={
                "test--page--middle--section--right--question--container"
              }
            >
              {testState.isStarted ? (
                <p className={"test--page--middle--section--right--question"}>
                  {
                    <div ref={ref3}>
                      <TextArea
                        placeholder="Введите вопрос"
                        style={{ width: "30vw" }}
                        maxLength={100}
                        value={test?.questions[currentQuestionIndex]?.question}
                        onChange={(e) => {
                          setTestData((prevTestData: any) => {
                            const newTestData = [...prevTestData];
                            const testIndex = newTestData.findIndex(
                              (test: any) => test?.id === id
                            );
                            newTestData[testIndex].questions[
                              currentQuestionIndex
                            ].question = e.target.value;
                            return newTestData;
                          });
                        }}
                      />
                    </div>
                  }
                </p>
              ) : (
                <>
                  <p className="test--page--middle--section--description">
                    <strong>Дата добавления:</strong>{" "}
                    {
                      <DatePicker
                        defaultValue={test?.date}
                        placeholder="Дата"
                        onChange={(dateString) => {
                          setTestData((prevTestData: TestData[]) => {
                            const newTestData = [...prevTestData];
                            const testIndex = newTestData.findIndex(
                              (test: TestData) => test?.id === id
                            );
                            if (dateString !== null) {
                              newTestData[testIndex].date =
                                dateString.format("YYYY-MM-DD"); // convert Dayjs object to string
                            } else {
                              newTestData[testIndex].date = ""; // handle null case
                            }
                            return newTestData;
                          });
                        }}
                      />
                    }
                  </p>
                  <p className="test--page--middle--section--description">
                    <strong>Время на тест:</strong>{" "}
                    <div ref={ref5}>
                      <InputNumber
                        value={time}
                        step={60}
                        onChange={(value) => {
                          setTestData((prevTestData: any) => {
                            const newTestData = [...prevTestData];
                            const testIndex = newTestData.findIndex(
                              (test: any) => test?.id === id
                            );
                            newTestData[testIndex].time = value;
                            return newTestData;
                          });
                        }}
                      />{" "}
                    </div>
                    секунд
                  </p>
                  <p className="test--page--middle--section--description">
                    <strong>Категория:</strong>{" "}
                    {
                      <div ref={ref6}>
                        <Select
                          value={test?.category}
                          style={{ width: 200 }}
                          placeholder="Категория"
                          options={[
                            {
                              value: "Математика📏",
                              label: "Математика📏",
                            },
                            {
                              value: "Правоведение📚",
                              label: "Правоведение📚",
                            },
                            {
                              value: "Программирование💻",
                              label: "Программирование💻",
                            },
                          ]}
                          onChange={(value) => {
                            setTestData((prevTestData: any) => {
                              const newTestData = [...prevTestData];
                              const testIndex = newTestData.findIndex(
                                (test: any) => test?.id === id
                              );
                              newTestData[testIndex].category = value;
                              return newTestData;
                            });
                          }}
                        />
                      </div>
                    }
                  </p>
                  <p className="test--page--middle--section--description">
                    <strong>Группа:</strong>{" "}
                    {
                      <div>
                        <Select
                          value={test?.group}
                          style={{ width: 200 }}
                          placeholder="Группа"
                          options={[
                            {
                              value: "БИН21-01",
                              label: "БИН21-01",
                            },
                            {
                              value: "БИМ21-01",
                              label: "БИМ21-01",
                            },
                            {
                              value: "БПА21-01",
                              label: "БПА21-01",
                            },
                          ]}
                          onChange={(value) => {
                            setTestData((prevTestData: any) => {
                              const newTestData = [...prevTestData];
                              const testIndex = newTestData.findIndex(
                                (test: any) => test?.id === id
                              );
                              newTestData[testIndex].group = value;
                              return newTestData;
                            });
                          }}
                        />
                      </div>
                    }
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={"test--page--bottom--section"}>
          {testState.isStarted ? (
            <div ref={ref7} className={"test--page--bottom--section--answers"}>
              <Input
                value={
                  test?.questions?.[currentQuestionIndex]?.answers?.[0].text
                }
                style={{ width: "30vw" }}
                placeholder="Введите первый ответ"
                onChange={(value) => {
                  setTestData((prevTestData: any) => {
                    const newTestData = [...prevTestData];
                    const testIndex = newTestData.findIndex(
                      (test: any) => test?.id === id
                    );
                    newTestData[testIndex].questions[
                      currentQuestionIndex
                    ].answers[0].text = value.target.value;
                    return newTestData;
                  });
                }}
              />
              <Input
                value={
                  test?.questions?.[currentQuestionIndex]?.answers?.[1].text
                }
                style={{ width: "30vw", marginTop: "2vh" }}
                placeholder="Введите второй ответ"
                onChange={(value) => {
                  setTestData((prevTestData: any) => {
                    const newTestData = [...prevTestData];
                    const testIndex = newTestData.findIndex(
                      (test: any) => test?.id === id
                    );
                    newTestData[testIndex].questions[
                      currentQuestionIndex
                    ].answers[1].text = value.target.value;
                    return newTestData;
                  });
                }}
              />
              <Input
                value={
                  test?.questions?.[currentQuestionIndex]?.answers?.[2].text
                }
                style={{ width: "30vw", marginTop: "2vh" }}
                placeholder="Введите третий ответ"
                onChange={(value) => {
                  setTestData((prevTestData: any) => {
                    const newTestData = [...prevTestData];
                    const testIndex = newTestData.findIndex(
                      (test: any) => test?.id === id
                    );
                    newTestData[testIndex].questions[
                      currentQuestionIndex
                    ].answers[2].text = value.target.value;
                    return newTestData;
                  });
                }}
              />
              <Input
                value={
                  test?.questions?.[currentQuestionIndex]?.answers?.[3].text
                }
                style={{ width: "30vw", marginTop: "2vh" }}
                placeholder="Введите четвертый ответ"
                onChange={(value) => {
                  setTestData((prevTestData: any) => {
                    const newTestData = [...prevTestData];
                    const testIndex = newTestData.findIndex(
                      (test: any) => test?.id === id
                    );
                    newTestData[testIndex].questions[
                      currentQuestionIndex
                    ].answers[3].text = value.target.value;
                    return newTestData;
                  });
                }}
              />
              <Select
                defaultValue={"Выберите правильный ответ"}
                placeholder="Выберите правильный ответ"
                style={{ width: "30vw", marginTop: "2vh" }}
                options={
                  test?.questions?.[currentQuestionIndex]?.answers
                    ? test?.questions?.[currentQuestionIndex]?.answers.map(
                        (answer: any, index: number) => ({
                          value: index,
                          label: answer.text,
                        })
                      )
                    : []
                }
                onChange={(value) => {
                  setTestData((prevTestData: any) => {
                    const newTestData = [...prevTestData];
                    const testIndex = newTestData.findIndex(
                      (test: any) => test?.id === id
                    );
                    newTestData[testIndex].questions[
                      currentQuestionIndex
                    ].answers.forEach((answer: any) => {
                      answer.isCorrect = false;
                    });
                    newTestData[testIndex].questions[
                      currentQuestionIndex
                    ].answers[value].isCorrect = true;
                    value === "";
                    return newTestData;
                  });
                }}
              />
            </div>
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
            <>
              <Button
                className={"test--page--button"}
                type="primary"
                size="large"
                onClick={() => {
                  setLoadingImg(true);
                  Modal.info({
                    title: "Вы действительно ходите выложить тест?",
                    onOk: () => {
                      if (
                        test?.questions[currentQuestionIndex].answers.every(
                          (answer: any) => answer.isCorrect === false
                        )
                      ) {
                        messageApi.error("Выберите правильный ответ");
                      } else if (
                        test?.questions[currentQuestionIndex].answers.some(
                          (answer: any) => answer.text === ""
                        ) ||
                        test?.questions[currentQuestionIndex].question === ""
                      ) {
                        messageApi.error("Заполните все ответы");
                      } else {
                        setTimeout(() => {
                          setTestData((prevTestData: any) => {
                            const newTestData = [...prevTestData];
                            const testIndex = newTestData.findIndex(
                              (test: any) => test?.id === id
                            );
                            newTestData[testIndex].visible = true;
                            return newTestData;
                          });
                          messageApi.success("Тест успешно добавлен");
                          setLoadingImg(false);
                        }, 2500);
                      }
                    },
                  });
                }}
              >
                Завершить
              </Button>
              {currentQuestionIndex !== 0 && (
                <Button
                  className="test--page--button"
                  type="primary"
                  size="large"
                  style={{ marginLeft: "2vw" }}
                  onClick={() => {
                    setCurrentQuestionIndex(
                      (prevIndex: number) => prevIndex - 1
                    );
                  }}
                >
                  Предыдущий вопрос
                </Button>
              )}
              <Button
                className={"test--page--button"}
                type="primary"
                size="large"
                style={{ marginLeft: "2vw" }}
                onClick={() => {
                  if (
                    test?.questions[currentQuestionIndex].answers.every(
                      (answer: any) => answer.isCorrect === false
                    )
                  ) {
                    messageApi.error("Выберите правильный ответ");
                  } else if (
                    test?.questions[currentQuestionIndex].answers.some(
                      (answer: any) => answer.text === ""
                    ) ||
                    test?.questions[currentQuestionIndex].question === ""
                  ) {
                    messageApi.error("Заполните все ответы");
                  } else if (
                    currentQuestionIndex !==
                    test?.questions.length - 1
                  ) {
                    setCurrentQuestionIndex(
                      (prevIndex: number) => prevIndex + 1
                    );
                  } else {
                    setTestData((prevTestData: any) => {
                      const newTestData = [...prevTestData];
                      const testIndex = newTestData.findIndex(
                        (test: any) => test?.id === id
                      );
                      newTestData[testIndex].questions.push({
                        question: "",
                        picture: "",
                        answers: [
                          {
                            text: "",
                            isCorrect: false,
                          },
                          {
                            text: "",
                            isCorrect: false,
                          },
                          {
                            text: "",
                            isCorrect: false,
                          },
                          {
                            text: "",
                            isCorrect: false,
                          },
                        ],
                        correctAnswer: "",
                      });
                      return newTestData;
                    });
                    setCurrentQuestionIndex(
                      (prevIndex: number) => prevIndex + 1
                    );
                  }
                }}
              >
                Следующий вопрос
              </Button>
            </>
          ) : (
            <>
              <Button
                className="test--page--button"
                type="primary"
                size="large"
                style={{ left: "0%" }}
                onClick={() => {
                  setTourOpen(true);
                }}
              >
                Инструкция
              </Button>
              <Button
                ref={ref8}
                className="test--page--button"
                type="primary"
                size="large"
                style={{ marginLeft: "2vw", marginRight: "2vw" }}
                onClick={() => {
                  const columns = [
                    { title: "ФИО ученика", dataIndex: "name", key: "name" },
                    {
                      title: "Правильных ответов",
                      dataIndex: "rightCount",
                      key: "rightCount",
                      sorter: (a: any, b: any) => a.rightCount - b.rightCount,
                    },
                    {
                      title: "Неправильных ответов",
                      dataIndex: "wrongCount",
                      key: "wrongCount",
                      sorter: (a: any, b: any) => a.rightCount - b.rightCount,
                    },
                    {
                      title: "Процент правильных ответов",
                      dataIndex: "rightPercentage",
                      key: "rightPercentage",
                      sorter: (a: any, b: any) => a.rightCount - b.rightCount,
                    },
                    {
                      title: "Группа",
                      dataIndex: "group",
                      key: "group",
                      filters: [
                        {
                          text: "БИН21-01",
                          value: "БИН21-01",
                        },
                        {
                          text: "БИМ21-01",
                          value: "БИМ21-01",
                        },
                        {
                          text: "БПА21-01",
                          value: "БПА21-01",
                        },
                      ],
                      onFilter: (value: any, record: any) =>
                        record.group ? record.group.includes(value) : false,
                    },
                    { title: "Время", dataIndex: "time", key: "time" },
                  ];

                  Modal.info({
                    title: "Результаты учеников",
                    width: "80vw",
                    content: (
                      <>
                        <Table
                          dataSource={test?.users}
                          columns={columns}
                          rowKey="name"
                          style={{ width: "100%" }}
                          size="small"
                          onChange={(pagination, filters, sorter) => {
                            console.log(
                              "Various parameters",
                              pagination,
                              filters,
                              sorter
                            );
                            setFilteredInfo(filters);
                          }}
                        />
                      </>
                    ),
                  });
                }}
              >
                Посмотреть результаты учеников
              </Button>
              <Button
                ref={ref9}
                onClick={() => {
                  setTestState((prevTestState: any) => ({
                    ...prevTestState,
                    isStarted: true,
                  }));
                  setTestData((prevTestData: any) => {
                    const newTestData = [...prevTestData];
                    const testIndex = newTestData.findIndex(
                      (test: any) => test?.id === id
                    );
                    newTestData[testIndex].questions.length === 0
                      ? newTestData[testIndex].questions.push({
                          question: "",
                          picture: "",
                          answers: [
                            {
                              text: "",
                              isCorrect: false,
                            },
                            {
                              text: "",
                              isCorrect: false,
                            },
                            {
                              text: "",
                              isCorrect: false,
                            },
                            {
                              text: "",
                              isCorrect: false,
                            },
                          ],
                          correctAnswer: "",
                          // add more fields as needed
                        })
                      : null;
                    return newTestData;
                  });
                }}
                className={"test--page--button"}
                type="primary"
                size="large"
              >
                Старт
              </Button>
            </>
          )}
        </div>
      </div>
      <Tour
        steps={tourSteps}
        open={tourOpen}
        onFinish={() => {
          setTourOpen(false);
        }}
        indicatorsRender={(current, total) => (
          <span>
            {current + 1} / {total}
          </span>
        )}
      />
    </>
  );
}
