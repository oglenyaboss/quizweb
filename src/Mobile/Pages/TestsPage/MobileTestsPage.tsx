import FeaturedItem from "../../../Pages/MainPage/Components/FeaturedItem";
import "./MobileTestsPage.css";
import React from "react";
import { Link } from "react-router-dom";
import TestContext from "../../../Misc/TestsContext";
import AuthContext from "../../../Misc/AuthContext";
import UserInfoBottomItem from "../MainPage/Components/UserInfoBottomItem";
import { Button } from "antd";

export default function TestsPage() {
  const { testData } = React.useContext(TestContext);
  const { authData } = React.useContext(AuthContext);
  const [currentGroup, setCurrentGroup] = React.useState(0);

  const groupedTests = [];
  for (let i = 0; i < testData.length; i += 4) {
    const group = testData
      .slice(i, i + 4)
      .filter((test) => test.group === authData.group);
    if (group.length > 0) {
      groupedTests.push(group);
    }
  }

  const testsItems = groupedTests[currentGroup]?.map((test: any) => {
    if (test?.visible === false) {
      return null;
    } else {
      return (
        <Link key={test?.id} to={"/tests/" + test?.id}>
          <FeaturedItem title={test?.name} category={test?.category} />
        </Link>
      );
    }
  });

  return (
    <div className="mobile-tests-page">
      <div className="mobile-tests-page-header">
        <div className="stats">
          <div className="stats--top">
            <UserInfoBottomItem
              title="тестов пройдено"
              count={authData.stats.testsPassed}
            />
            <UserInfoBottomItem
              title="правильных ответов"
              count={authData.stats.correctAnswers}
            />
          </div>
          <div className="stats--bottom">
            <UserInfoBottomItem
              title="самый быстрый тест"
              count={authData.stats.fastestTest}
            />
          </div>
        </div>
      </div>
      <div className="featured--tests">{testsItems}</div>
      <div className="mobile-tests-page-footer">
        {groupedTests.length > 1 && (
          <>
            <Button
              disabled={currentGroup === 0}
              onClick={() => setCurrentGroup(currentGroup - 1)}
            >
              Предыдущие
            </Button>
            <Button
              disabled={currentGroup === groupedTests.length - 1}
              onClick={() => setCurrentGroup(currentGroup + 1)}
            >
              Следующие
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
