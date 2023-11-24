import fastest from "../../../assets/fastest.png";
import finished from "../../../assets/finished.png";
import correct from "../../../assets/correct.png";

export default function UserInfoBottomItem(props: {
  title: string;
  count: number;
}) {
  const image = () => {
    switch (props.title) {
      case "Самый быстрый":
        return fastest;
      case "Пройдено тестов":
        return finished;
      case "Правильных ответов":
        return correct;
    }
  };
  return (
    <div className={"user--info--stats"}>
      <div className={"user--info--stats--left"}>
        <img className={"user--info--stats--img"} src={image()} />
      </div>
      <div className={"user--info--stats--right"}>
        <h1 className={"user--info--stats--count"}>{props.count}</h1>
        <h3 className={"user--info--stats--text"}>{props.title}</h3>
      </div>
    </div>
  );
}
