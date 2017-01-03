import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Container, Row, Col} from 'reactstrap';
import {fetchStages, deleteStage, duplicateStage, createStage} from '../actions/main-actions';
import timeago from 'timeago.js';

class StageOptionsMenu extends React.Component {
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
        {...this.props}
      >
        <DropdownToggle className="btn-link btn-sm">
          <i className="fa fa-ellipsis-v" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={this.props.onDuplicate}>
            Duplicate Stage
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem onClick={this.props.onDelete}>
            Delete Stage
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    )
  }
}
class StageCard extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func,
  };
  
  render() {
    const {stage} = this.props;

    return (
      <div className="card stage-card">
        <Link to={`/editor/${stage.id}`}>
          <img className="card-img-top stage-thumbnail" src={stage.thumbnail} />
        </Link>
        <div className="card-block">
          <StageOptionsMenu
            style={{float: 'right'}}
            onDuplicate={this.props.onDuplicate}
            onDelete={this.props.onDelete}
          />
          <Link to={`/editor/${stage.id}`}>
            <h4 className="card-title">{stage.name}</h4>
          </Link>
          <small className="card-text text-muted">
            Last updated {new timeago().format(stage.updatedAt)}
          </small>
        </div>
      </div>
    );
  }
}

class StageList extends React.Component {
  static propTypes = {
    stages: PropTypes.array,
    onDuplicateStage: PropTypes.func,
    onDeleteStage: PropTypes.func,
  };

  render() {
    const {stages, onDeleteStage, onDuplicateStage} = this.props;

    if (!stages) {
      return (
        <Container>
          <p>
            Loading...
          </p>
        </Container>
      );
    }

    return (
      <div className="stage-list">
        {stages.map((s) =>
          <StageCard
            key={s.id}
            stage={s}
            onDuplicate={() => onDuplicateStage(s)}
            onDelete={() => onDeleteStage(s)}
          />
        )}
      </div>
    );
  }
}

class DashboardPage extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    stages: PropTypes.array,
    dispatch: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // for now, always fetch stages again when the dashboard is loaded.
    this.props.dispatch(fetchStages());
  }

  render() {
    const {user, stages, dispatch} = this.props;
    return (
      <Container style={{marginTop: 30}}>
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
                onClick={() => dispatch(createStage())}
              >
                New Stage
              </Button>
              <h5>My Stages</h5>
              <hr/>
              <StageList
                stages={stages}
                onDeleteStage={(s) => dispatch(deleteStage(s.id))}
                onDuplicateStage={(s) => dispatch(duplicateStage(s.id))}
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
    stages: state.stages,
  };
}

export default connect(mapStateToProps)(DashboardPage);
