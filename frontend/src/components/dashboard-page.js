import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import Container from 'reactstrap/lib/Container';

import {fetchWorldsForUser, deleteWorld, duplicateWorld, createWorld} from '../actions/main-actions';
import WorldList from './common/world-list';

class DashboardPage extends React.Component {
  static propTypes = {
    me: PropTypes.object,
    worlds: PropTypes.array,
    dispatch: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    this.props.dispatch(fetchWorldsForUser('me'));
  }

  render() {
    const {me, worlds, dispatch} = this.props;

    return (
      <Container style={{marginTop: 30}} className="dashboard">
        <Row>
          <Col md={3}>
            <div className="dashboard-sidebar">
              <h4>{me.username}</h4>
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
                canEdit
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
    me: state.me,
    worlds: state.worlds && Object.values(state.worlds).filter(w => w.userId === state.me.id).sort((a, b) => a.updatedAt - b.updatedAt),
  };
}

export default connect(mapStateToProps)(DashboardPage);
