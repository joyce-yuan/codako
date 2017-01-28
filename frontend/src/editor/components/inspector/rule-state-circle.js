import React, {PropTypes} from 'react';

export default class RuleStateCircle extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
  };

  static contextTypes = {
    evaluatedRuleIds: PropTypes.object,
  }

  render() {
    const ids = this.context.evaluatedRuleIds;
    const applied = ids && ids[this.props.rule.id];
    return (
      <div className={`circle ${applied}`} />
    );
  }
}
