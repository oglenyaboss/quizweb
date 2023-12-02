import CLOCK from "../../../assets/Lottie/CLOCK.json";
import CORRECT from "../../../assets/Lottie/CORRECT.json";
import FINISH from "../../../assets/Lottie/FINISH.json";
import Lottie from "react-lottie-player";
import React from "react";

export default function UserInfoBottomItem(props: {
  title: string;
  count: number;
}) {
  const image = () => {
    switch (props.title) {
      case "Самый быстрый тест":
        return CLOCK;
      case "Тестов пройдено":
        return FINISH;
      case "Правильных ответов":
        return CORRECT;
    }
  };

  const [firstLottiePlaying, setFirstLottiePlaying] = React.useState(true);

  return (
    <div className={"user--info--stats"}>
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
