import CLOCK from "../../../assets/Lottie/CLOCK.json";
import CORRECT from "../../../assets/Lottie/CORRECT.json";
import FINISH from "../../../assets/Lottie/FINISH.json";
import Lottie from "react-lottie-player";
import React from "react";
import { Table, Modal } from "antd";
import TestContext from "../../../Misc/TestsContext";
import AuthContext from "../../../Misc/AuthContext";

export default function UserInfoBottomItem(props: any) {
  const { testData } = React.useContext(TestContext);
  const { authData } = React.useContext(AuthContext);
  const image = () => {
    switch (props.title) {
      case "Самый быстрый тест":
        return CLOCK;
      case "Тестов пройдено":
        return FINISH;
      case "Правильных ответов":
        return CORRECT;
      case "самый быстрый тест":
        return CLOCK;
      case "тестов пройдено":
        return FINISH;
      case "правильных ответов":
        return CORRECT;
    }
  };

  const [firstLottiePlaying, setFirstLottiePlaying] = React.useState(true);

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      onclick: () => {
        console.log("clicked");
      },
    },
    {
      title: "Правильных ответов",
      dataIndex: "correct",
      key: "correct",
    },
    {
      title: "Время",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "% правильных ответов",
      dataIndex: "percent",
      key: "percent",
    },
  ];

  const filteredTests = testData.filter((test: any) => {
    return test.users.some((user: any) => {
      return user.id === authData.uid;
    });
  });

  const dataSource = filteredTests.map((test: any) => {
    const user = test.users.find((user: any) => {
      return user.id === authData.uid;
    });
    return {
      key: test.id,
      name: test.name,
      correct: user.rightCount,
      time: user.time,
      percent: `${Math.round(
        (user.rightCount / (user.rightCount + user.wrongCount)) * 100
      )}%`,
    };
  });

  return (
    <div
      className={"user--info--stats"}
      onClick={() => {
        console.log(filteredTests);
        Modal.info({
          width: "80vw",
          styles: {
            mask: {
              backdropFilter: "blur(10px)",
            },
          },
          title: "Статистика",
          content: <Table dataSource={dataSource} columns={columns} />,
        });
      }}
    >
      <div
        onMouseEnter={() => {
          setFirstLottiePlaying(true);
        }}
        className={"user--info--stats--left"}
      >
        <Lottie
          className={"user--info--stats--img"}
          animationData={image()}
          play={firstLottiePlaying}
          onLoopComplete={() => {
            setFirstLottiePlaying(false);
          }}
        />
      </div>
      <div className={"user--info--stats--right"}>
        <h1 className={"user--info--stats--count"}>{`${props.count}${
          props.title === "Самый быстрый тест" ? " сек" : ""
        }`}</h1>
        <h3 className={"user--info--stats--text"}>{props.title}</h3>
      </div>
    </div>
  );
}
