import { Link } from "react-router-dom";

export default function UserLicense() {
  return (
    <div className="userlicense--container">
      <h1 className="userLicense--title">Пользовательское соглашение</h1>
      <p className="userLicense--text">blah-blah-blah</p>
      <Link to={"/login"}>Вернуться</Link>
    </div>
  );
}
