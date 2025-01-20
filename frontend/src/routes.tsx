import { EnterHook, IndexRoute, Route } from "react-router";

import App from "./components/app";
import DashboardPage from "./components/dashboard-page";
import EditorPage from "./components/editor-page";
import ExplorePage from "./components/explore-page";
import FAQPage from "./components/faq-page";
import HomePage from "./components/home-page";
import JoinPage from "./components/join-page";
import JoinSendWorldsPage from "./components/join-send-worlds-page";
import LoginPage from "./components/login-page";
import NotFoundPage from "./components/not-found-page";
import PlayPage from "./components/play-page";
import ProfilePage from "./components/profile-page";

const requireAuth: EnterHook = (nextState, replace) => {
  if (!window.store.getState().me) {
    replace({
      pathname: "/login",
      state: {
        redirectTo: nextState.location.pathname,
      },
    });
  }
};

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="explore" component={ExplorePage} />
    <Route path="faq" component={FAQPage} />
    <Route path="login" component={LoginPage} />
    <Route path="join" component={JoinPage} />
    <Route path="join-send-world" component={JoinSendWorldsPage} />

    <Route path="play/:worldId" component={PlayPage} />
    <Route path="editor/:worldId" component={EditorPage} />
    <Route path="u/:username" component={ProfilePage} />

    <Route path="dashboard" component={DashboardPage} onEnter={requireAuth} />

    <Route path="*" component={NotFoundPage} />
  </Route>
);
