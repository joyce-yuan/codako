import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Row, Col} from 'reactstrap';
import {fetchStages} from '../actions/main-actions';

class StageCard extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
  };
  
  render() {
    return (
      <Col md={6}>
        <div className="card card-block">
          {this.props.stage.name}
        </div>
      </Col>
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
      <Container>
        <Row>
          <Button color="success" className="float-xs-right">
            New Stage
          </Button>
          <h5>Pinned repositories</h5>
        </Row>
        <Row>
          {
            stages.map((s) =>
              <StageCard key={s.id} stage={s} />
            )
          }
        </Row>
      </Container>
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
      <Container>
        <Row>
          <Col md={2}>
            <div className="card card-block">
              {user.username}
            </div>
          </Col>
          <Col md={10}>
            <div className="card card-block">
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
