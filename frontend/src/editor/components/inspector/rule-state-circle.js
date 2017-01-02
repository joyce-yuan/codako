import React, {PropTypes} from 'react';

export default class RuleStateCircle extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
  };

  static contextTypes = {
    appliedRuleIds: PropTypes.object,
  }

  render() {
    const applied = this.context.appliedRuleIds[this.props.rule.id];
    return (
      <div className={`circle ${applied}`} />
    );
  }
}
