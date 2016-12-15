import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter} from 'reactstrap';

import * as Tools from './tools';

import {paintCharacterAppearance} from '../../actions/ui-actions';
import {changeCharacter} from '../../actions/characters-actions';

import {getImageDataFromDataURL, getDataURLFromImageData} from './helpers';
import CreatePixelImageData from './create-pixel-image-data';
import PixelCanvas from './pixel-canvas';
import PixelToolbar from './pixel-toolbar';
import PixelColorPicker, {ColorOptions} from './pixel-color-picker';

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    characters: PropTypes.object,
    characterId: PropTypes.string,
    appearanceId: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      tools: [
        new Tools.PixelFreehandTool(),
        new Tools.PixelLineTool(),
        new Tools.PixelEraserTool(),

        new Tools.PixelFillRectTool(),
        new Tools.PixelFillEllipseTool(),
        new Tools.PixelPaintbucketTool(),

        new Tools.PixelTranslateTool(),
        new Tools.PixelRectSelectionTool(),
        new Tools.PixelMagicSelectionTool(),
      ],
      selectedColor: ColorOptions[3],
      selectedTool: null,
      imageData: null,
      undoStack: [],
      redoStack: [],
    };
  }

  componentDidMount() {
    this.setImageDataFromProps();
  }

  componentWillReceiveProps(nextProps) {
    this.setImageDataFromProps(nextProps);
  }

  setImageDataFromProps(props = this.props) {
    const {characterId, characters, appearanceId} = props;
    if (characterId) {
      const {spritesheet} = characters[characterId];
      const frameDataURL = spritesheet.appearances[appearanceId][0];
      getImageDataFromDataURL(frameDataURL, (imageData) => {
        CreatePixelImageData.call(imageData);
        this.setState({imageData});
      });
    } else {
      this.setState({imageData: null});
    }
  }

  _onChangeImageData = (nextImageData) => {
    this.setState({
      imageData: nextImageData,
      undoStack: [].concat(this.state.undoStack, [this.state.imageData]),
      redoStack: [],
    });
  }

  _onUndo = () => {
    const undoStack = [].concat(this.state.undoStack);
    const imageData = undoStack.pop();
    if (!imageData) { return; }
    const redoStack = [].concat(this.state.redoStack, [this.state.imageData]);
    this.setState({imageData, redoStack, undoStack});
  }

  _onRedo = () => {
    const redoStack = [].concat(this.state.redoStack);
    const imageData = redoStack.pop();
    if (!imageData) { return; }
    const undoStack = [].concat(this.state.undoStack, [this.state.imageData]);
    this.setState({imageData, redoStack, undoStack});
  }

  _onClose = () => {
    this.props.dispatch(paintCharacterAppearance(null));
  }

  _onCloseAndSave = () => {
    const {dispatch, characterId, appearanceId} = this.props;
    getDataURLFromImageData(this.state.imageData, (imageDataURL) => {
      dispatch(changeCharacter(characterId, {spritesheet: {appearances: {[appearanceId]: [imageDataURL]}}}));
      dispatch(paintCharacterAppearance(null));
    });
  }

  render() {
    const {imageData, tools, selectedTool, selectedColor, undoStack, redoStack} = this.state;

    return (
      <Modal isOpen={imageData !== null} backdrop="static" toggle={() => {}}>
        <div className="modal-header" style={{display: 'flex'}}>
          <h4 style={{flex: 1}}>Edit Appearance</h4>
          <Button
            className="icon"
            onClick={this._onUndo}
            disabled={undoStack.length === 0}
          >
            <img src="/img/icon_undo.png" />
          </Button>
          <Button
            className="icon"
            onClick={this._onRedo}
            disabled={redoStack.length === 0}
          >
            <img src="/img/icon_redo.png" />
          </Button>
        </div>
        <ModalBody>
          <div className="flex-horizontal">
            <div className="paint-sidebar">
              <PixelColorPicker
                color={selectedColor}
                onColorChange={(selectedColor) => this.setState({selectedColor})}
              />
              <PixelToolbar
                tools={tools}
                tool={selectedTool}
                onToolChange={(selectedTool) => this.setState({selectedTool})}
              />
            </div>
            <PixelCanvas
              color={selectedColor}
              tool={selectedTool}
              imageData={imageData}
              offsetX={0}
              offsetY={0}
              pixelSize={10}
              onChangeImageData={this._onChangeImageData}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button key="cancel" onClick={this._onClose}>Close without Saving</Button>{' '}
          <Button key="save" onClick={this._onCloseAndSave}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.ui.paint, {characters: state.characters});
}

export default connect(
  mapStateToProps,
)(Container);
