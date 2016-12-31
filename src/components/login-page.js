import React, {PropTypes} from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';

import {login} from '../actions/main-actions';

class LoginPage extends React.Component {
  static propTypes = {
    router: PropTypes.object,
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      state: PropTypes.shape({
        redirectTo: PropTypes.string,
      }),
    }),
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      error: false
    };
  }

  _onSubmit = (event) => {
    event.preventDefault();

    const {location, dispatch} = this.props;
    const {email, pass} = this.refs;
    const nextPathname = location.state ? location.state.redirectTo : null;

    dispatch(login(email.value, pass.value, nextPathname));
  }

  render() {
    const {location} = this.props;

    return (
      <form onSubmit={this._onSubmit}>
        { location.state && location.state.redirectTo ? <div className="error">Sorry, you need to log in to view that page.</div> : null}
        <label><input ref="email" placeholder="email" defaultValue="joe@example.com" /></label>
        <label><input ref="pass" placeholder="password" /></label> (hint: password1)<br />
        <button type="submit">Login</button>
      </form>
    );
  }
}

export default withRouter(connect()(LoginPage));
