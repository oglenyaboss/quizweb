export default function UserInfoBottomItem(props: {
  title: string;
  count: number;
}) {
  const image = () => {
    if (props.title === "Тестов пройдено") {
      return "/src/assets/finished.png";
    } else if (props.title === "Правильных ответов") {
      return "/src/assets/correct.png";
    } else if (props.title === "Самый быстрый тест") {
      return "/src/assets/fastest.png";
    } else {
      return "";
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
