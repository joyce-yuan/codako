import React, {PropTypes} from 'react';

import {TransformConditionRow, AppearanceConditionRow, VariableConditionRow} from './condition-rows';

import {pointIsInside} from '../../../utils/stage-helpers';
import {updateRecordingCondition} from '../../../actions/recording-actions';
import {getCurrentStageForWorld} from '../../../utils/selectors';


export default class RecordingConditions extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    recording: PropTypes.object,
    characters: PropTypes.object,
  };

  render() {
    const {recording, characters, dispatch} = this.props;
    const {beforeWorld, conditions, extent} = recording;
    const stage = getCurrentStageForWorld(beforeWorld);

    const rows = [];
    Object.values(stage.actors).forEach((a) => {
      const saved = conditions[a.id] || {};

      if (!pointIsInside(a.position, extent)) {
        return;
      }
      rows.push(
        <TransformConditionRow
          key={`${a.id}-transform`}
          character={characters[a.characterId]}
          actor={a}
          transform={a.transform}
          onChange={(enabled) =>
            dispatch(updateRecordingCondition(a.id, 'transform', {enabled}))
          }
          {...saved['transform']}
        />
      );
      rows.push(
        <AppearanceConditionRow
          key={`${a.id}-appearance`}
          character={characters[a.characterId]}
          actor={a}
          appearance={a.appearance}
          onChange={(enabled) =>
            dispatch(updateRecordingCondition(a.id, 'appearance', {enabled}))
          }
          {...saved['appearance']}
        />
      );

      for (const vkey of Object.keys(a.variableValues)) {
        rows.push(
          <VariableConditionRow
            key={`${a.id}-var-${vkey}`}
            character={characters[a.characterId]}
            actor={a}
            variableId={vkey}
            variableValue={a.variableValues[vkey]}
            onChange={(enabled, comparator) =>
              dispatch(updateRecordingCondition(a.id, vkey, {enabled, comparator}))
            }
            {...saved[vkey]}
          />
        );
      }
    });

    return (
      <div style={{flex: 1, marginRight: 3}}>
        <h2>When the picture matches and:</h2>
        <ul>
          {rows}
        </ul>
      </div>
    );
  }
}