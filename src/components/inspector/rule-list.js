import React, {PropTypes} from 'react';

import ContentRule from './content-rule';
import ContentEventGroup from './content-event-group';
import ContentFlowGroup from './content-flow-group';

import {TOOL_TRASH, CONTAINER_TYPES} from '../../constants/constants';

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
  };

  static contextTypes = {
    onRuleMoved: PropTypes.func,
    onRuleDeleted: PropTypes.func,
    onRulePickKey: PropTypes.func,
    onRuleReRecord: PropTypes.func,
    selectedToolId: PropTypes.string,
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
      this.setState({dragIndex: -1, dropIndex: -1});
    }
  }

  componentWillUnmount() {
    clearTimeout(this._leaveTimeout);
  }

  _contentForRule(rule) {
    if (rule.type === CONTAINER_TYPES.EVENT) {
      return ContentEventGroup;
    }
    if (rule.type === CONTAINER_TYPES.FLOW) {
      return ContentFlowGroup;
    }
    return ContentRule;
  }

  _dropIndexForRuleDragEvent(event) {
    const hasRuleId = event.dataTransfer.types.includes('rule-id');
    if (!hasRuleId) {
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

  _onRuleClicked = (event, rule) => {
    event.stopPropagation();
    if (this.context.selectedToolId === TOOL_TRASH) {
      this.context.onRuleDeleted(rule.id, event);
    }
  }

  _onRuleDoubleClick = (event, rule) => {
    event.stopPropagation();
    this.context.onRuleReRecord(rule);
  }

  _onDragStart = (event, rule) => {
    event.stopPropagation();
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
      return;
    }

    event.preventDefault();
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

    event.stopPropagation();
    event.preventDefault();

    if (!ruleId || (dropIndex === -1)) {
      return;
    }

    this.context.onRuleMoved(ruleId, this.props.parentId, dropIndex);
    this.setState({dragIndex: -1, dropIndex: -1});
  }

  render() {
    const {hidden, rules} = this.props;
    const {dropIndex, dragIndex} = this.state;

    if (hidden || !rules) {
      return <span />;
    }

    const items = rules.map((r) => {
      const ContentComponent = this._contentForRule(r);
      return (
        <div
          draggable
          key={r.id}
          className={`rule-container ${r.type}`}
          onClick={(event) => this._onRuleClicked(event, r)}
          onDoubleClick={(event) => this._onRuleDoubleClick(event, r)}
          onDragStart={(event) => this._onDragStart(event, r)}
          onDragEnd={(event) => this._onDragEnd(event, r)}
        >
          <ContentComponent rule={r} />
        </div>
      );
    });

    if ((dropIndex !== -1) && ((items.length === 0) || (dragIndex !== dropIndex))) {
      items.splice(dropIndex, 0, <RuleDropPlaceholder key={'drop'} />);
    }

    return (
      <ul
        className={`rules-list tool-${this.context.selectedToolId}`}
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
