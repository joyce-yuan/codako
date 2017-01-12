import React, {PropTypes} from 'react';

export default class StageSettings extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    const {stage: {width, height, wrapX, wrapY, name}, onChange} = this.props;

    return (
      <div>
        <fieldset className="form-group">
          <legend className="col-form-legend">Stage Name</legend>
          <input
            type="text"
            placeholder="Untitled"
            defaultValue={name}
            className="form-control"
            onBlur={(e) => onChange({name: e.target.value})}
          />
        </fieldset>
        <fieldset className="form-group">
          <legend className="col-form-legend">Stage Size</legend>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <input
              className="form-control"
              type="number"
              defaultValue={width}
              onBlur={(e) => onChange({width: e.target.value / 1})}
            />
            <span style={{paddingLeft: 10, paddingRight: 10}}>x</span>
            <input
              className="form-control"
              type="number"
              defaultValue={height}
              onBlur={(e) => onChange({height: e.target.value / 1})}
            />
          </div>
        </fieldset>
        <fieldset className="form-group">
          <legend className="col-form-legend">Wrapping</legend>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <label className="form-check-label" htmlFor="wrapX">
              <input
                style={{marginRight: 5}}
                className="form-check-input"
                id="wrapX"
                type="checkbox"
                defaultChecked={wrapX}
                onBlur={(e) => onChange({wrapX: e.target.checked})}
              />
              Wrap Horizontally
            </label>
            <label className="form-check-label" htmlFor="wrapY">
              <input
                style={{marginRight: 5, marginLeft: 0}}
                className="form-check-input"
                id="wrapY"
                type="checkbox"
                defaultChecked={wrapY}
                onBlur={(e) => onChange({wrapY: e.target.checked})}
              />
              Wrap Vertically
            </label>
          </div>
        </fieldset>
      </div>
    );
  }
}