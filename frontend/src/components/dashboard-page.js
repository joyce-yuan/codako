import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Container, Row, Col} from 'reactstrap';
import {fetchWorlds, deleteWorld, duplicateWorld, createWorld} from '../actions/main-actions';
import timeago from 'timeago.js';

class WorldOptionsMenu extends React.Component {
  static propTypes = {
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      open: false,
    };
  }

  render() {
    return (
      <ButtonDropdown
        isOpen={this.state.open}
        toggle={() => this.setState({open: !this.state.open})}
      >
        <DropdownToggle className="btn-link btn-sm">
          <i className="fa fa-ellipsis-v" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={this.props.onDuplicate}>
            Duplicate World
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem onClick={this.props.onDelete}>
            Delete World
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    );
  }
}
class WorldCard extends React.Component {
  static propTypes = {
    world: PropTypes.object,
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func,
  };
  
  render() {
    const {world} = this.props;

    return (
      <div className="card world-card">
        <Link to={`/editor/${world.id}`}>
          <img className="card-img-top world-thumbnail" src={world.thumbnail} />
        </Link>
        <div className="card-block">
          <WorldOptionsMenu
            onDuplicate={this.props.onDuplicate}
            onDelete={this.props.onDelete}
          />
          <Link to={`/editor/${world.id}`}>
            <h4 className="card-title">{world.name}</h4>
          </Link>
          <small className="card-text text-muted">
            Last updated {new timeago().format(world.updatedAt)}
          </small>
        </div>
      </div>
    );
  }
}

class WorldList extends React.Component {
  static propTypes = {
    worlds: PropTypes.array,
    onDuplicateWorld: PropTypes.func,
    onDeleteWorld: PropTypes.func,
  };

  render() {
    const {worlds, onDeleteWorld, onDuplicateWorld} = this.props;
    
    let msg = null;
    if (!worlds) {
      msg = "Loading...";
    }
    if (worlds.length === 0) {
      msg = "Create your first world to get started!";
    }

    if (msg) {
      return (
        <Container>
          <p>{msg}</p>
        </Container>
      );
    }

    return (
      <div className="world-list">
        {worlds.map((s) =>
          <WorldCard
            key={s.id}
            world={s}
            onDuplicate={() => onDuplicateWorld(s)}
            onDelete={() => onDeleteWorld(s)}
          />
        )}
      </div>
    );
  }
}

class DashboardPage extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    worlds: PropTypes.array,
    dispatch: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // for now, always fetch worlds again when the dashboard is loaded.
    this.props.dispatch(fetchWorlds());
  }

  render() {
    const {user, worlds, dispatch} = this.props;
    return (
      <Container style={{marginTop: 30}} className="dashboard">
        <Row>
          <Col md={3}>
            <div className="dashboard-sidebar">
              <h4>{user.username}</h4>
            </div>
          </Col>
          <Col md={9}>
            <div className="card card-block">
              <Button
                size="sm"
                color="success"
                className="float-xs-right"
                onClick={() => dispatch(createWorld())}
              >
                New World
              </Button>
              <h5>My Worlds</h5>
              <hr/>
              <WorldList
                worlds={worlds}
                onDeleteWorld={(s) => dispatch(deleteWorld(s.id))}
                onDuplicateWorld={(s) => dispatch(duplicateWorld(s.id))}
              />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    worlds: state.worlds,
  };
}

export default connect(mapStateToProps)(DashboardPage);
