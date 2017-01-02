import React, {PropTypes} from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Container, Row, Col, Button} from 'reactstrap';

import * as CustomPropTypes from '../constants/custom-prop-types';
import {register} from '../actions/main-actions';

class JoinPage extends React.Component {
  static propTypes = {
    router: PropTypes.object,
    dispatch: PropTypes.func,
    networkError: CustomPropTypes.BoomNetworkError,
    location: PropTypes.shape({
      state: PropTypes.shape({
        redirectTo: PropTypes.string,
      }),
    }),
  };

  static layoutConsiderations = {
    hidesNav: true,
  };

  constructor(props, context) {
    super(props, context);
  }

  _onSubmit = (event) => {
    event.preventDefault();

    const {dispatch} = this.props;
    dispatch(register({
      email: this.refs.email.value,
      password: this.refs.pass.value,
      username: this.refs.username.value,
    }));
  }

  render() {
    const {location, networkError} = this.props;
    const redirectPresent = location.state && location.state.redirectTo;

    let message = '';
    let messageClass = null;
    if (redirectPresent) {
      message = 'Sorry, you need to log in to view that page.';
      messageClass = 'info';
    }
    if (networkError) {
      message = (networkError.statusCode === 401) ? 'Sorry, your username or password was incorrect.' : networkError.message;
      messageClass = 'danger';
    }

    return (
      <Container>
        <Row>
          <Col size={12}>
            <div style={{textAlign: 'center', marginTop:60, marginBottom: 30}}>
              <h3>Join Codako</h3>
              <p>
                The best way to design, build, and ship software.
              </p>
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={{ size: 5, offset: 2 }}>
            <div className="card">
              {message && (
                <div className={`card card-inverse card-${messageClass} card-block text-xs-center`}>
                  <blockquote className="card-blockquote">
                    {message}
                  </blockquote>
                </div>
              )}
              <form className="card-block" onSubmit={this._onSubmit}>
                <div className={`form-group ${message.includes('username') ? 'has-danger' : ''}`}>
                  <label htmlFor="username">Username</label>
                  <input className={`form-control ${message.includes('username') ? 'form-control-danger' : ''}`} id="username" ref="username" />
                  <small className="form-text text-muted">
                    This will be your username — you don't need to use your real name!
                  </small>
                </div>
                <div className={`form-group ${message.includes('email') ? 'has-danger' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <input className={`form-control ${message.includes('email') ? 'form-control-danger' : ''}`} id="email" ref="email" />
                  <small className="form-text text-muted">
                    You will occasionally receive emails from Codako.
                    We promise not to share your email with anyone.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input className="form-control" id="password" ref="pass" type="password" />
                  <small className="form-text text-muted">
                    Use at least one lowercase letter, one numeral, and six characters.
                  </small>
                </div>
                <hr />
                <p>
                  By clicking on "Create an account" below, you are agreeing to the Terms of Service and the Privacy Policy.
                </p>
                <hr />
                <Button color="primary" type="submit">Create an account</Button>
              </form>
            </div>
          </Col>
          <Col sm={{ size: 3 }}>
            <div className="card">
              <div className="card-header">
                Featured
              </div>
              <div className="card-block">
                <ul>
                  <li>Great communication</li>
                  <li>Frictionless development</li>
                  <li>Open source community</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    networkError: state.network.error,
  };
}

export default withRouter(connect(mapStateToProps)(JoinPage));
