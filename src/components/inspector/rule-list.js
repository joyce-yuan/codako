import React, {PropTypes} from 'react';

import Rule from './rule';
import RuleEventGroup from './rule-event-group';
import RuleFlowGroup from './rule-flow-group';

class RuleDropPlaceholder extends React.Component {
  render() {
    return (<div style={{height: 30}} />);
  }
}

export default class RuleList extends React.Component {
  static propTypes = {
    parentId: PropTypes.string,
    rules: PropTypes.array,
    hidden: PropTypes.bool,
    onRuleMoved: PropTypes.func,
    onRuleChanged: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      dragIndex: -1,
      dropIndex: -1,
    };
  }

  componentWillReceiveProps() {
    if (this.state.dragIndex !== -1) {
      this.setState({dragIndex: -1});
    }
  }

  componentWillUnmount() {
    clearTimeout(this._leaveTimeout);
  }

  _componentForRule(rule) {
    if (rule.type === 'group-event') {
      return RuleEventGroup;
    }
    if (rule.type === 'group-flow') {
      return RuleFlowGroup;
    }
    return Rule;
  }

  _dropIndexForRuleDragEvent(event) {
    const hasRuleId = event.dataTransfer.types.includes('rule-id');
    if (!this.props.parentId || !hasRuleId) {
      return -1;
    }

    const all = Array.from(this._el.children).filter(c => c.classList.contains('rule-container'));
    for (let i = 0; i < all.length; i ++) {
      const {top, height} = all[i].getBoundingClientRect();
      if (top + height * 0.5 > event.clientY) {
        return i;
      }
    }

    return all.length;
  }

  _onRuleClicked = () => {

  }

  _onDragStart = (event, rule) => {
    event.dataTransfer.setData('rule-id', rule.id);
    this.setState({
      dragIndex: this.props.rules.indexOf(rule),
      dropIndex: -1,
    });
  }

  _onDragEnd = () => {
    this.setState({
      dragIndex: -1,
      dropIndex: -1,
    });
  }

  _onDragOver = (event) => {
    clearTimeout(this._leaveTimeout);
    const dropIndex = this._dropIndexForRuleDragEvent(event);
    if (dropIndex === -1) {
      event.preventDefault();
      return;
    }
    this.setState({dropIndex});
  }

  _onDragLeave = () => {
    this._leaveTimeout = setTimeout(() => {
      this.setState({dropIndex: -1});
    }, 50);
  }

  _onDrop = (event) => {
    const ruleId = event.dataTransfer.getData('rule-id');
    const dropIndex = this._dropIndexForRuleDragEvent(event);

    if (!this.props.parentId || !ruleId || (dropIndex === -1)) {
      event.preventDefault();
      return;
    }

    this.props.onRuleMoved(ruleId, this.props.parentId, dropIndex);
    this.setState({dragIndex: -1, dropIndex: -1});
  }

  render() {
    const {hidden, rules, onRuleMoved, onRuleChanged} = this.props;
    const {dropIndex, dragIndex} = this.state;

    if (hidden || !rules) {
      return <span />;
    }

    const items = rules.map((r) => {
      const Component = this._componentForRule(r);
      return (
        <Component
          onRuleMoved={onRuleMoved}
          onRuleChanged={onRuleChanged}
          onClick={(event) => this._onRuleClicked(event, r)}
          onDragStart={(event) => this._onDragStart(event, r)}
          onDragEnd={(event) => this._onDragEnd(event, r)}
          rule={r}
          key={r.id}
        />
      );
    });

    if ((dropIndex !== -1) && ((items.length === 0) || (dragIndex !== dropIndex))) {
      items.splice(dropIndex, 0, <RuleDropPlaceholder key={'drop'} />);
    }

    return (
      <ul
        className="rules-list"
        ref={(el) => this._el = el}
        onDragOver={this._onDragOver}
        onDragLeave={this._onDragLeave}
        onDrop={this._onDrop}
      >
        {items}
      </ul>
    );
  }
}
