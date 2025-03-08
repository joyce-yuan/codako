import { connect } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Button from "reactstrap/lib/Button";
import Col from "reactstrap/lib/Col";
import Container from "reactstrap/lib/Container";
import Row from "reactstrap/lib/Row";

import { useRef } from "react";
import { login } from "../actions/main-actions";

const LoginPage = ({ dispatch, networkError }) => {
  const usernameRef = useRef();
  const passRef = useRef();
  const location = useLocation();
  //   dispatch: PropTypes.func,
  //   networkError: CustomPropTypes.BoomNetworkError,
  //   location: PropTypes.shape({
  //     state: PropTypes.shape({
  //       redirectTo: PropTypes.string,
  //     }),
  //   }),
  // };
  const _onSubmit = (event) => {
    event.preventDefault();

    const nextPathname = location.state ? location.state.redirectTo : null;

    dispatch(
      login(
        {
          username: usernameRef.current.value,
          password: passRef.current.value,
        },
        nextPathname,
      ),
    );
  };

  const redirectPresent = location.state && location.state.redirectTo;

  let message = null;
  let messageClass = null;
  if (redirectPresent) {
    message = "Sorry, you need to log in to view that page.";
    messageClass = "bg-info text-white";
  }
  if (networkError) {
    message =
      networkError.statusCode === 401
        ? "Sorry, your username or password was incorrect."
        : networkError.message;
    messageClass = "bg-danger text-white ";
  }

  return (
    <Container>
      <Row>
        <Col lg={{ size: 4, offset: 4 }}>
          <div style={{ textAlign: "center", marginTop: 60, marginBottom: 30 }}>
            <h3>Sign in to Codako</h3>
          </div>
          <div className="card">
            {message && (
              <div className={`card card-inverse ${messageClass} card-body text-xs-center`}>
                {message}
              </div>
            )}
            <form className="card-body" onSubmit={_onSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username or email address:</label>
                <input
                  className="form-control"
                  id="username"
                  ref={usernameRef}
                  autoFocus
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  className="form-control"
                  id="password"
                  ref={passRef}
                  type="password"
                  autoComplete="password"
                />
              </div>
              <Button block color="primary" type="submit">
                Login
              </Button>
            </form>
          </div>
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-body text-xs-center">
              New to Codako? <Link to="/join">Create an account</Link>.
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

function mapStateToProps(state) {
  return {
    networkError: state.network.error,
  };
}

export default connect(mapStateToProps)(LoginPage);
