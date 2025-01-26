import { connect } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";
import Button from "reactstrap/lib/Button";

import { logout } from "../actions/main-actions";

// class App extends React.Component {
//   static propTypes = {
//     me: PropTypes.object,
//     children: PropTypes.element,
//     network: PropTypes.object,
//     dispatch: PropTypes.func,
//   };

export const App = ({ me, dispatch, network }) => {
  const location = useLocation();

  const _renderNav = () => {
    return (
      <nav className="navbar navbar-expand">
        <div className="container" style={{ justifyContent: "flex-start" }}>
          <Link className="navbar-brand" to="/">
            Codako
          </Link>
          <ul className="nav ">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/faq">
                Parents
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/explore">
                Explore
              </Link>
            </li>
          </ul>
          <div style={{ flex: 1 }} />
          <ul className="nav ">
            {me
              ? [
                  <li className="nav-item" key="dashboard">
                    <Link className="nav-link" to="/dashboard">
                      My Games
                    </Link>
                  </li>,
                  <li className="nav-item" key="logout">
                    <a className="nav-link" href="#" onClick={() => dispatch(logout())}>
                      Log Out ({me.username})
                    </a>
                  </li>,
                ]
              : [
                  <li className="nav-item" key="sign-in" style={{ marginRight: 10 }}>
                    <Link to="/login">
                      <Button>Sign in</Button>
                    </Link>
                  </li>,
                  <li className="nav-item" key="sign-up">
                    <Link to="/join">
                      <Button color="success" to="/join">
                        Sign up
                      </Button>
                    </Link>
                  </li>,
                ]}
          </ul>
        </div>
      </nav>
    );
  };

  const _renderFooter = () => {
    return (
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              {"Open sourced with love by "}
              <a href="http://www.foundry376.com/">Foundry376.</a>{" "}
              <a href="/terms-of-use">Terms of Use</a> and{" "}
              <a href="/privacy-policy">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    );
  };

  // const ChildClass = children?.type.WrappedComponent || children?.type;
  // const { hidesNav, hidesFooter, unwrapped } =
  //   (ChildClass && ChildClass.layoutConsiderations) || {};
  const isEditor = location.pathname.startsWith("/editor");
  const isLogin = location.pathname.startsWith("/login");

  const hidesNav = isLogin || isEditor;
  const hidesFooter = isLogin || isEditor;
  const unwrapped = isEditor;
  const content = unwrapped ? (
    <Outlet />
  ) : (
    <div className="page-content-flex">
      <Outlet />
    </div>
  );

  return (
    <div className="page-container">
      {!hidesNav && _renderNav()}
      {content}
      {!hidesFooter && _renderFooter()}
      <div className={`network-bar active-${network.pending > 0}`} />
    </div>
  );
};

function mapStateToProps(state) {
  return Object.assign(
    {},
    {
      me: state.me,
      network: state.network,
    },
  );
}

export default connect(mapStateToProps)(App);
