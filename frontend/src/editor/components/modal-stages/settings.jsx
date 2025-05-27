import PropTypes from "prop-types";
import React from "react";
import Button from "reactstrap/lib/Button";
import { makeRequest } from "../../../helpers/api";

// import PixelColorPicker from '../modal-paint/pixel-color-picker';

const DEFAULT_COLOR = "#005392";

export default class StageSettings extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
    onChange: PropTypes.func,
  };

  state = {
    backgroundPrompt: "",
    isGenerating: false,
  };

  _onGenerateBackground = async () => {
    const { onChange } = this.props;
    const { backgroundPrompt } = this.state;
    const stageName = this.props.stage.name.replace(/\s+/g, "_"); // Replace spaces with underscores
    const worldId = this.props.stage.worldId;

    if (!backgroundPrompt) {
      alert("Please enter a description for the background");
      return;
    }

    this.setState({ isGenerating: true });
    try {
      // First generate the image with OpenAI
      const fileName = `${Date.now()}-${stageName}-background`;
      const data = await makeRequest(
        `/generate-background?prompt=${encodeURIComponent(backgroundPrompt)}&filename=${encodeURIComponent(fileName)}`,
      );
      if (data.imageUrl) {
        // onChange({ background: `url(${data.imageUrl})` });
        // Then store it permanently in our system
        // const savedImage = await makeRequest('/api/images', {
        //   method: 'POST',
        //   json: {
        //     url: data.imageUrl,
        //     prompt: backgroundPrompt,
        //     type: 'generated'
        //   }
        // });

        // Use the permanent URL from our storage
        onChange({
          background: `url(${data.imageUrl})`,
        });
      } else {
        console.error("Failed to generate background:", data.error);
        alert("Failed to generate background. Please try again.");
      }
    } catch (error) {
      console.error("Error generating background:", error);
      alert("Error generating background. Please try again.");
    } finally {
      this.setState({ isGenerating: false });
    }
  };

  render() {
    const {
      stage: { width, height, wrapX, wrapY, name, background },
      onChange,
    } = this.props;

    const backgroundAsURL = (/url\((.*)\)/.exec(background) || [])[1];
    const backgroundAsColor = backgroundAsURL ? null : background;

    return (
      <div>
        <fieldset className="form-group">
          <legend className="col-form-legend">Name</legend>
          <input
            type="text"
            placeholder="Untitled"
            defaultValue={name}
            className="form-control"
            onBlur={(e) => onChange({ name: e.target.value })}
          />
        </fieldset>
        <fieldset className="form-group">
          <legend className="col-form-legend">Size</legend>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <input
              className="form-control"
              type="number"
              defaultValue={width}
              onBlur={(e) => onChange({ width: Number(e.target.value) })}
            />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>x</span>
            <input
              className="form-control"
              type="number"
              defaultValue={height}
              onBlur={(e) => onChange({ height: Number(e.target.value) })}
            />
          </div>
        </fieldset>
        <fieldset className="form-group">
          <legend className="col-form-legend">Wrapping</legend>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div className="form-check" style={{ flex: 1 }}>
              <label className="form-check-label" htmlFor="wrapX">
                <input
                  style={{ marginRight: 5 }}
                  className="form-check-input"
                  id="wrapX"
                  type="checkbox"
                  defaultChecked={wrapX}
                  onBlur={(e) => onChange({ wrapX: e.target.checked })}
                />
                Wrap Horizontally
              </label>
            </div>
            <div className="form-check" style={{ flex: 1 }}>
              <label className="form-check-label" htmlFor="wrapY">
                <input
                  className="form-check-input"
                  id="wrapY"
                  type="checkbox"
                  defaultChecked={wrapY}
                  onBlur={(e) => onChange({ wrapY: e.target.checked })}
                />
                Wrap Vertically
              </label>
            </div>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <legend className="col-form-legend">Background</legend>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ flex: 1 }}>
              <div className="form-check">
                <label className="form-check-label">
                  <input
                    className="form-check-input"
                    type="radio"
                    style={{ marginRight: 5 }}
                    checked={!!backgroundAsColor}
                    onChange={() => onChange({ background: DEFAULT_COLOR })}
                    name="bgradio"
                  />
                  Color
                </label>
                <br />
                <input
                  type="color"
                  value={backgroundAsColor || DEFAULT_COLOR}
                  onChange={(e) => {
                    if (e.target.value) {
                      onChange({ background: e.target.value });
                    }
                  }}
                />
                {/*<PixelColorPicker
                color={backgroundAsColor}
                onColorChange={(color) => onChange({background: color})}
              />*/}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="form-check">
                <label className="form-check-label">
                  <input
                    className="form-check-input"
                    type="radio"
                    style={{ marginRight: 5 }}
                    checked={!!backgroundAsURL}
                    onChange={() => onChange({ background: "url(/Layer0_2.png)" })}
                    name="bgradio"
                  />
                  Image
                </label>
                <input
                  type="text"
                  defaultValue={backgroundAsURL}
                  onBlur={(e) => {
                    if (e.target.value) {
                      onChange({ background: `url(${e.target.value})` });
                    }
                  }}
                />
              </div>
              <div style={{ marginTop: 10 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Describe your background..."
                  value={this.state.backgroundPrompt}
                  onChange={(e) => this.setState({ backgroundPrompt: e.target.value })}
                  style={{ marginBottom: 5 }}
                />
                <Button
                  className="btn btn-primary"
                  onClick={this._onGenerateBackground}
                  disabled={this.state.isGenerating}
                >
                  {this.state.isGenerating ? (
                    <span>
                      <i className="fa fa-spinner fa-spin" style={{ marginRight: "5px" }} />
                      Generating...
                    </span>
                  ) : (
                    "Generate Background"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    );
  }
}
