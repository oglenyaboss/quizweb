import { Popover, QRCode } from "antd";
import Lottie from "react-lottie-player";
import TELEGRAM from "../../assets/Lottie/data.json";
export default function NotificationsPage() {
  return (
    <div className="right--body--section">
      <div className={"support--page"}>
        <h1 className={"support--page--title"}>Уведомления🔔</h1>
        <div className="telegram--support--container">
          <div className="telegram--support--icon">
            <a className="tg--icon" href="https://t.me/quizhelpandfeedback_bot">
              <Popover
                content={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <QRCode
                      value="https://t.me/quizhelpandfeedback_bot"
                      size={150}
                      color="#8692a6"
                    />
                    <p>Нажми или отсканируй QR код, чтобы перейти в бота</p>
                  </div>
                }
              >
                <Lottie
                  className="telegram--support--lottie"
                  animationData={TELEGRAM}
                  play={true}
                  loop={false}
                  speed={2}
                />
              </Popover>
            </a>
          </div>
          <div className="telegram--support--info">
            <h1 className="telegram--support--title">Telegram</h1>
            <p className="telegram--support--text">
              Переходи в нашего бота🤖 <br />и получай уведомления о новых
              тестах🔔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
