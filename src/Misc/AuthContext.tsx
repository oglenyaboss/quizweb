import React from "react";

export type AuthData = {
  firstName: string;
  lastName: string;
  group: string;
  uid: string;
  profilePicUrl: string;
  permissions: string;
  stats: {
    testsPassed: number;
    correctAnswers: number;
    fastestTest: number;
  };
  achievements: { name: string; description: string; locked: boolean }[];
};

type AuthContextType = {
  authData: AuthData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;
};

const AuthContext = React.createContext<AuthContextType>({
  authData: {
    firstName: "",
    lastName: "",
    group: "",
    uid: "",
    permissions: "",
    profilePicUrl: "/src/assets/default-profile.png",
    stats: {
      testsPassed: 0,
      correctAnswers: 0,
      fastestTest: 0,
    },
    achievements: [{ name: "", description: "", locked: true }],
  },
  setAuthData: () => {},
});

export default AuthContext;
