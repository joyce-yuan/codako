import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Row, Col} from 'reactstrap';
import {fetchStages} from '../actions/main-actions';
import timeago from 'timeago.js';

class StageCard extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
  };
  
  render() {
    const {stage} = this.props;

    return (
      <div className="card stage-card">
        <Link to={`/editor/${stage.id}`}>
          <img className="card-img-top stage-thumbnail" src={stage.thumbnail} />
        </Link>
        <div className="card-block">
          <Link to={`/editor/${stage.id}`}><h4 className="card-title">{stage.name}</h4></Link>
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
  };

  render() {
    const {stages} = this.props;

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
          <StageCard key={s.id} stage={s} />
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
    const {user, stages} = this.props;
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
              <Button size="sm" color="success" className="float-xs-right">
                New Stage
              </Button>
              <h5>My Stages</h5>
              <hr/>
              <StageList stages={stages} />
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
