import React, {PropTypes} from 'react';
import {Link, IndexLink} from 'react-router';
import {connect} from 'react-redux';

import {logout} from '../actions/main-actions';

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.
class App extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    children: PropTypes.element,
    network: PropTypes.object,
    dispatch: PropTypes.func,
  };

  _onLogout = () => {
    this.props.dispatch(logout());
  }

  render() {
    const {user, children, network} = this.props;

    return (
      <div>
        <div className={`network-bar active-${network.pending > 0}`} />
        <ul>
          <li><IndexLink to="/">Home</IndexLink></li>
          <li><Link to="/fuel-savings">Demo App</Link></li>
          <li><Link to="/about">About</Link></li>
          <li>
            {user ? (
              <a href="#" onClick={this._onLogout}>Log Out</a>
            ) : (
              <Link to="/login">Sign in</Link>
            )}
          </li>
        </ul>
        {children}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, {
    user: state.user,
    network: state.network,
  });
}

export default connect(
  mapStateToProps,
)(App);