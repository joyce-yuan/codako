import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import Col from "reactstrap/lib/Col";
import Container from "reactstrap/lib/Container";
import Row from "reactstrap/lib/Row";

import { makeRequest } from "../helpers/api";
import WorldList from "./common/world-list";

class ExplorePage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    makeRequest(`/worlds/explore`).then((worlds) => {
      this.setState({ worlds });
    });
  }

  render() {
    return (
      <Container style={{ marginTop: 30 }} className="explore">
        <Row>
          <Col md={12}>
            <div className="card card-body">
              <h5>Popular Games</h5>
              <hr />
              <WorldList worlds={this.state.worlds} />
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
  };
}

export default connect(mapStateToProps)(ExplorePage);
