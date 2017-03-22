import React, {PropTypes} from 'react';
import Container from 'reactstrap/lib/Container';

import WorldCard from './world-card';
import PageMessage from './page-message';

export default class WorldList extends React.Component {
  static propTypes = {
    worlds: PropTypes.array,
    onDuplicateWorld: PropTypes.func,
    onDeleteWorld: PropTypes.func,
  };

  render() {
    const {worlds, onDeleteWorld, onDuplicateWorld} = this.props;
    
    let msg = null;
    if (!worlds) {
      msg = <PageMessage text="Loading..." size="sm" />;
    } else if (worlds.length === 0) {
      msg = <PageMessage text="You haven't created any game worlds yet." size="sm" />;
    }

    if (msg) {
      return (
        <Container>
          {msg}
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
