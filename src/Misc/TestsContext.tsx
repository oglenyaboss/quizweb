import React from "react";

type Answer = {
  isCorrect: boolean;
  text: string;
};

type Question = {
  question: string;
  answers: Answer[];
  picture: string;
};

type Users = {
  id: string;
  rightCount: number;
  wrongCount: number;
};

type TestData = {
  visible: boolean;
  users: Users[];
  name: string;
  questions: Question[];
  category: string;
  id: string;
  time: number;
  date: string;
};

type TestContextType = {
  testData: TestData[];
  setTestData: React.Dispatch<React.SetStateAction<TestData>>;
};

const TestContext = React.createContext<TestContextType>({
  testData: [
    {
      visible: false,
      users: [],
      name: "",
      questions: [],
      category: "",
      id: "",
      time: 0,
      date: "",
    },
  ],
  setTestData: () => {},
});

export default TestContext;
