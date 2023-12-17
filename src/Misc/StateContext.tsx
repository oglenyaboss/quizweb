import React from "react";

type StateType = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  secondaryBackgroundColor: string;
  buttonTextColor: string;
  buttonColor: string;
  shadow: string;
};

type StateContextType = {
  state: StateType;
  setState: React.Dispatch<React.SetStateAction<StateType>>;
};

const StateContext = React.createContext<StateContextType>({
  state: {
    primaryColor: "#8692a6",
    backgroundColor: "#f0f2f5",
    buttonColor: "#8692a6",
    textColor: "#696f79",
    buttonTextColor: "#FFF",
    secondaryBackgroundColor: "#FFF",
    shadow: "0px 15px 40px 5px #ededed",
  },
  setState: () => {},
});

export default StateContext;
