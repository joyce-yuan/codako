import React from 'react';
import {Link} from 'react-router';
import {Container} from 'reactstrap';

const NotFoundPage = () => {
  return (
    <Container>
      <h4>
        404 Page Not Found
      </h4>
      <Link to="/"> Go back to homepage </Link>
    </Container>
  );
};

export default NotFoundPage;
