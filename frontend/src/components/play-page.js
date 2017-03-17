import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {Button, Container, Row, Col} from 'reactstrap';
import objectAssign from 'object-assign';

import PlayerRoot from '../editor/player-root';
import {fetchWorld, createWorld} from '../actions/main-actions';
import PageMessage from './common/page-message';

class PlayPage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    me: PropTypes.object,
    world: PropTypes.object,
    params: PropTypes.shape({
      worldId: PropTypes.string,
    }),
  }

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    this.props.dispatch(fetchWorld(this.props.params.worldId));
  }

  _onFork = () => {
    const {dispatch, params, me, world} = this.props;

    if (me) {
      dispatch(createWorld({from: params.worldId}));
    } else {
      const storageKey = `ls-${Date.now()}`;
      const storageWorld = objectAssign({}, world, {id: storageKey});
      localStorage.setItem(storageKey, JSON.stringify(storageWorld));
      dispatch(push(`/editor/${storageKey}?localstorage=true`));
    }
  }

  render() {
    const {world} = this.props;

    if (!world || !world.data) {
      return (
        <PageMessage text="Loading..." />
      );
    }

    return (
      <Container style={{marginTop: 30}} className="play">
        <Row>
          <Col sm={7}>
            <div className="header">
              <h4><Link to={`/u/${world.user.username}`}>{world.user.username}</Link>/<Link>{world.name}</Link></h4>
              {world.forkParent && (<small className="text-muted">
                {`Forked from `}
                <Link to={`/u/${world.forkParent.user.username}`}>{world.forkParent.user.username}</Link>
                {`/`}
                <Link to={`/play/${world.forkParent.id}`}>{world.forkParent.name}</Link>
              </small>
              )}
            </div>
          </Col>
          <Col sm={5}>
            <Button
              color="success"
              className="float-xs-right with-counter"
              onClick={this._onFork}
            >
              Fork
              <div className="counter-inline">{world.forkCount}</div>
              <div className="counter">{world.forkCount}</div>
            </Button>
            <Button
              disabled
              className="float-xs-right with-counter"
              style={{marginRight: 5}}
            >
              Plays
              <div className="counter-inline">{world.playCount}</div>
              <div className="counter">{world.playCount}</div>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xl={9}>
            <PlayerRoot world={world} />
          </Col>
          <Col xl={3} style={{marginTop: 30}}>
            {/*<h4>
              {'Published by '}
              <Link to={`/u/${world.user.username}`}>
                <img src={"/img/profile-placeholder.png"} style={{maxWidth: 32}} />
                {world.user.username}
              </Link>
            </h4>*/}
            <p style={{background: 'rgba(238, 211, 144, 0.54)', padding: 10, textAlign: 'center'}}>
              Codako is a free online tool for creating games! <a onClick={this._onFork} href="#">Fork this game</a> to make your own like it or <Link to={'/explore'}>explore more games</Link>.
            </p>
          </Col>
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    me: state.me,
    world: state.worlds && state.worlds[ownProps.params.worldId],
  };
}

export default connect(mapStateToProps)(PlayPage);
