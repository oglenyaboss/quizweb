import "./Styles/MobileHeader.css";
import AuthContext from "../../../Misc/AuthContext.tsx";
import React from "react";
import defaultProfilePic from "../../../assets/default-profile.png";

export default function Header() {
  const { authData } = React.useContext(AuthContext);
  const profilePic =
    authData.profilePicUrl !== "/src/assets/default-profile.png"
      ? authData.profilePicUrl
      : defaultProfilePic;

  return (
    <>
      <header>
        <div className="header--container">
          <div className={"user--info"}>
            <img className={"user--logo"} src={profilePic} alt={"user--logo"} />
            <h2 className={"user--name"}>
              {authData.firstName + " " + authData.lastName}
            </h2>
          </div>
          <h1 className={"title"}>Quiz</h1>
        </div>
      </header>
    </>
  );
}
