import "./MobileNotifications.css";
import Lottie from "react-lottie-player";
import TELEGRAM from "../../../assets/Lottie/TELEGRAM.json";

export default function NotificationsPage() {
  return (
    <div className={"support--page"}>
      <div>
        <div className="telegram--support--icon">
          <a className="tg--icon" href="https://t.me/quizhelpandfeedback_bot">
            <Lottie
              className="telegram--support--lottie"
              animationData={TELEGRAM}
              play={true}
              loop={false}
              speed={2}
              style={{ width: 400 }}
            />
          </a>
        </div>
        <p className="telegram--support--text">
          Переходи в нашего бота🤖 <br />и получай уведомления о новых тестах🔔
        </p>
      </div>
    </div>
  );
}
