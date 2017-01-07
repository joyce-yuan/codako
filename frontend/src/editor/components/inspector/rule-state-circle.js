import React, {PropTypes} from 'react';

export default class RuleStateCircle extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
  };

  static contextTypes = {
    evaluatedRuleIds: PropTypes.object,
  }

  render() {
    const applied = this.context.evaluatedRuleIds[this.props.rule.id];
    return (
      <div className={`circle ${applied}`} />
    );
  }
}
