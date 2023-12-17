import { Badge } from "antd";
import { AlertFilled } from "@ant-design/icons";
import math from "../../../assets/CategoryPictures/Математика📏.jpeg";
import right from "../../../assets/CategoryPictures/right.jpeg";
import coding from "../../../assets/CategoryPictures/Программирование💻.jpeg";

export default function featuredItem(props: any) {
  const Image = () => {
    switch (props.category) {
      case "Математика📏":
        return math;
      case "Программирование💻":
        return coding;
      default:
        return right;
    }
  };
  return (
    <div className={"featured--item"}>
      {props.badge ? (
        <Badge count={<AlertFilled style={{ fontSize: 30, color: "red" }} />} />
      ) : null}
      <img
        onLoad={props.onLoad}
        src={Image()}
        alt={"Картинка"}
        className={"featured--item--image"}
      />
      <p onClick={props.onClick} className={"featured--item--title"}>
        {props.title}
      </p>
    </div>
  );
}
