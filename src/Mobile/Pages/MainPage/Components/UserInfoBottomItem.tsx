import fastest from "../../../../assets/fastest.png";
import finished from "../../../../assets/finished.png";
import correct from "../../../../assets/correct.png";

export default function UserInfoBottomItem(props: {
  title: string;
  count: number;
}) {
  const image = () => {
    switch (props.title) {
      case "самый быстрый тест":
        return fastest;
      case "тестов пройдено":
        return finished;
      case "правильных ответов":
        return correct;
    }
  };
  return (
    <div className={"user--info--stats"}>
      <div className={"user--info--stats--left"}>
        <img className={"user--info--stats--img"} src={image()} />
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