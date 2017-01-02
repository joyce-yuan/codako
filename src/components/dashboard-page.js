import React from 'react';
import {Link} from 'react-router';
import {Container} from 'reactstrap';

// Since this component is simple and static, there's no parent container for it.
const DashboardPage = () => {
  return (
    <Container>
      <h2>Dashboard</h2>
      <p>
        This example app is part of the <a href="https://github.com/coryhouse/react-slingshot">React-Slingshot
        starter kit</a>.
      </p>
      <p>
        <Link to="/badlink">Click this bad link</Link> to see the 404 page.
      </p>
    </Container>
  );
};

export default DashboardPage;
