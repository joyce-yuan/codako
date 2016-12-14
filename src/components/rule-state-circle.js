import React, {PropTypes} from 'react';

export default class RuleStateCircle extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
  };

  render() {
    const applied = false; //!!actor.applied[rule._id]
    return (
      <div className={`circle ${applied}`} />
    );
  }
}
