import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import SAD from "../../assets/Lottie/SAD.json";
import "./ErrorPage.css";

export default function ErrorPage() {
  return (
    <div className="error--page--container">
      <Lottie animationData={SAD} className="error--page--lottie" />
      <p className="error--page--description">
        Страница не найдена. Возможно, она была удалена или вы перешли по
        неверной ссылке.
      </p>
      <Link className="button" to="/home">
        На главную
      </Link>
    </div>
  );
}
