import FeaturedItem from "../MainPage/Components/FeaturedItem";
import "./TestsPage.css";
import React from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "antd";
import TestContext from "../../Misc/TestsContext";
import AuthContext from "../../Misc/AuthContext";
import UserInfoBottomItem from "../MainPage/Components/UserInfoBottomItem";
import { Button } from "antd";

export default function TestsPage() {
  const { testData } = React.useContext(TestContext);
  const { authData } = React.useContext(AuthContext);
  const [currentGroup, setCurrentGroup] = React.useState(0);
  const [loadedImages, setLoadedImages] = React.useState(0);
  const totalImages = 2;

  const groupedTests = [];
  for (let i = 0; i < testData.length; i += 4) {
    const group = testData
      .slice(i, i + 4)
      .filter((test) => test.group === authData.group);
    if (group.length > 0) {
      groupedTests.push(group);
    }
  }

  const changeLoadedImages = () => {
    setLoadedImages((prev) => prev + 1);
  };

  const testsItems = groupedTests[currentGroup]?.map((test: any) => {
    if (test?.visible === false) {
      return null;
    } else {
      return (
        <Link key={test?.id} to={"/tests/" + test?.id}>
          <FeaturedItem
            title={test?.name}
            category={test?.category}
            onLoad={changeLoadedImages}
          />
        </Link>
      );
    }
  });

  if (window.innerWidth < 768) {
    return loadedImages < totalImages - 1 ? (
      <>
        <div className="mobile-tests-page">
          <div className="mobile-tests-page-header">
            <div className="stats">
              <div className="stats--top">
                <Skeleton.Avatar
                  style={{
                    width: "30vw",
                    height: "10vw",
                    borderRadius: "2vw",
                  }}
                  className="ffeatured--item--image"
                  shape="square"
                  active
                />
                <Skeleton.Avatar
                  style={{
                    width: "30vw",
                    height: "10vw",
                    borderRadius: "2vw",
                  }}
                  className="ffeatured--item--image"
                  shape="square"
                  active
                />
              </div>
              <div className="stats--bottom">
                <Skeleton.Avatar
                  style={{
                    width: "30vw",
                    height: "10vw",
                    borderRadius: "2vw",
                  }}
                  className="ffeatured--item--image"
                  shape="square"
                  active
                />
              </div>
            </div>
          </div>
          <div className="featured--tests">
            <Skeleton.Avatar
              style={{
                width: "39vw",
                height: "13.5vh",
                borderRadius: "30px",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
            <Skeleton.Avatar
              style={{
                width: "39vw",
                height: "13.5vh",
                borderRadius: "30px",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
            <Skeleton.Avatar
              style={{
                width: "39vw",
                height: "13.5vh",
                borderRadius: "30px",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
            <Skeleton.Avatar
              style={{
                width: "39vw",
                height: "13.5vh",
                borderRadius: "30px",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
          </div>
        </div>
        <div
          className="preload"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -9999,
          }}
        >
          {testsItems}
        </div>
      </>
    ) : (
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

  return loadedImages < totalImages - 1 ? (
    <>
      <div className="right--body--section">
        <div className={"tests--page"}>
          <h1 className={"tests--page--title"}>Выберите тему🗒️</h1>
          <p className={"tests--page--subtitle"}>Избранная категория❤️</p>
          <div className="featured--item--container">
            <Skeleton.Avatar
              style={{
                width: "16vw",
                height: "16vh",
                borderRadius: "2vw",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
            <Skeleton.Avatar
              style={{
                width: "16vw",
                height: "16vh",
                borderRadius: "2vw",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
            <Skeleton.Avatar
              style={{
                width: "16vw",
                height: "16vh",
                borderRadius: "2vw",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
            <Skeleton.Avatar
              style={{
                width: "16vw",
                height: "16vh",
                borderRadius: "2vw",
              }}
              className="ffeatured--item--image"
              shape="square"
              active
            />
          </div>
        </div>
      </div>
      <div
        className="preload"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -9999,
        }}
      >
        {testsItems}
      </div>
    </>
  ) : (
    <div className="right--body--section">
      <div className={"tests--page"}>
        <h1 className={"tests--page--title"}>Выберите тему🗒️</h1>
        <p className={"tests--page--subtitle"}>Избранная категория❤️</p>
        <div className="featured--item--container">{testsItems}</div>
      </div>
    </div>
  );
}
