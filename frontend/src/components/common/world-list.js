import React, {PropTypes} from 'react';
import Container from 'reactstrap/lib/Container';

import WorldCard from './world-card';

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
      msg = "Loading...";
    } else if (worlds.length === 0) {
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
