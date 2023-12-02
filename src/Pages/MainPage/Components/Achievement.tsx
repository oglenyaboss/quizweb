import { Modal, message } from "antd";
import COOKIE from "../../../assets/Lottie/COOKIE.json";
import THIRD from "../../../assets/Lottie/TRIRD.json";
import SECOND from "../../../assets/Lottie/SECOND.json";
import FIRST from "../../../assets/Lottie/FIRST.json";
import ZERO from "../../../assets/Lottie/ZERO.json";
import CRYSTALL from "../../../assets/Lottie/CRYSTALL.json";
import Lottie from "react-lottie-player";
import React from "react";

export default function Achievement(props: any) {
  const [messageApi, contextHolder] = message.useMessage();

  const [lottiePlaying, setLottiePlaying] = React.useState(false);

  const lottie = () => {
    switch (props.name) {
      case "Первый вход":
        return COOKIE;
      case "Первый тест":
        return THIRD;
      case "Безупречно!":
        return SECOND;
      case "Самый быстрый":
        return FIRST;
      case "Тестер":
        return ZERO;
      case "Супер тестер":
        return CRYSTALL;
    }
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          filter: props.locked ? "grayscale(100%) blur(2px)" : "grayscale(0%)",
        }}
      >
        <p className="achievement--name">{props.name}</p>
        <Lottie
          style={{
            filter: props.locked
              ? "grayscale(100%) blur(2px)"
              : "grayscale(0%)",
          }}
          play={lottiePlaying}
          onLoopComplete={() => {
            setLottiePlaying(false);
          }}
          className="achievement--img"
          animationData={lottie()}
          onMouseEnter={() => {
            if (!props.locked) {
              setLottiePlaying(true);
            }
          }}
          onClick={() => {
            props.locked
              ? messageApi.error("Достижение заблокировано")
              : Modal.success({
                  title: props.name,
                  content: props.description,
                  styles: {
                    mask: {
                      backdropFilter: "blur(5px)",
                    },
                  },
                });
          }}
        />
      </div>
    </>
  );
}
