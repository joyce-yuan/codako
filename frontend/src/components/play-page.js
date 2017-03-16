import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Row, Col} from 'reactstrap';

import PlayerRoot from '../editor/player-root';
import {fetchWorld, duplicateWorld} from '../actions/main-actions';

class PlayPage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
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

  render() {
    const {world, dispatch, params} = this.props;

    if (!world) {
      return (
        <p>Loading</p>
      );
    }

    return (
      <Container style={{marginTop: 30}} className="dashboard">
        <Row>
          <Col sm={9}>
            <div className="dashboard-sidebar">
              <h4><Link to={`/u/${world.user.username}`}>{world.user.username}</Link>/<Link>{world.name}</Link></h4>
            </div>
          </Col>
          <Col sm={3}>
            <Button
              size="sm"
              color="success"
              className="float-xs-right"
              onClick={() => dispatch(duplicateWorld(params.worldId))}
            >
              Clone World
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xl={9}>
            <PlayerRoot world={world} />
          </Col>
          <Col xl={3}>
            <div className="panel">
              <img src={"/img/profile-placeholder.png"} style={{maxWidth: '100%', maxHeight: 100}} />
              <h4>{world.user.username}</h4>
            </div>
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
