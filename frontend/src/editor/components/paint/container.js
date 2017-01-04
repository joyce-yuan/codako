import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter} from 'reactstrap';
import objectAssign from 'object-assign';

import * as Tools from './tools';

import {paintCharacterAppearance} from '../../actions/ui-actions';
import {changeCharacter} from '../../actions/characters-actions';

import {getImageDataFromDataURL, getDataURLFromImageData} from './helpers';
import CreatePixelImageData from './create-pixel-image-data';
import PixelCanvas from './pixel-canvas';
import PixelToolbar from './pixel-toolbar';
import PixelColorPicker, {ColorOptions} from './pixel-color-picker';

const MAX_UNDO_STEPS = 30;

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

        new Tools.PixelRectSelectionTool(),
        new Tools.PixelMagicSelectionTool(),
      ],
      color: ColorOptions[3],
      tool: null,

      imageData: null,
      selectionImageData: null,
      selectionOffset: {
        x: 0,
        y: 0,
      },

      undoStack: [],
      redoStack: [],

      interaction: {},
      interactionPixels: null,
    };
  }

  componentDidMount() {
    this.setImageDataFromProps();

    // add event listeners which can't be attached to our div
    document.body.addEventListener('cut', this._onGlobalCut);
    document.body.addEventListener('copy', this._onGlobalCopy);
    document.body.addEventListener('paste', this._onGlobalPaste);
  }

  componentWillReceiveProps(nextProps) {
    this.setImageDataFromProps(nextProps);
  }

  componentWillUnmount() {
    document.body.removeEventListener('cut', this._onGlobalCut);
    document.body.removeEventListener('copy', this._onGlobalCopy);
    document.body.removeEventListener('paste', this._onGlobalPaste);
  }

  setImageDataFromProps(props = this.props) {
    const {characterId, characters, appearanceId} = props;
    if (characterId) {
      const {spritesheet} = characters[characterId];
      const frameDataURL = spritesheet.appearances[appearanceId][0];
      getImageDataFromDataURL(frameDataURL, (imageData) => {
        CreatePixelImageData.call(imageData);
        this.setState({imageData, undoStack: [], redoStack: []});
      });
    } else {
      this.setState({imageData: null, undoStack: [], redoStack: []});
    }
  }

  setStateWithCheckpoint = (state) => {
    this.setState(objectAssign({}, state, {
      undoStack: this.state.undoStack
        .slice(Math.max(0, this.state.undoStack.length - MAX_UNDO_STEPS))
        .concat([{
          imageData: this.state.imageData,
          selectionImageData: this.state.selectionImageData,
        }]),
      redoStack: [],
    }));
  }

  _onUndo = () => {
    const undoStack = [].concat(this.state.undoStack);
    const changes = undoStack.pop();
    if (!changes) { return; }
    const redoStack = [].concat(this.state.redoStack, [this.state.imageData]);
    this.setState(objectAssign({}, changes, {redoStack, undoStack}));
  }

  _onRedo = () => {
    const redoStack = [].concat(this.state.redoStack);
    const changes = redoStack.pop();
    if (!changes) { return; }
    const undoStack = [].concat(this.state.undoStack, [this.state.imageData]);
    this.setState(objectAssign({}, changes, {redoStack, undoStack}));
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

  _onKeyDown = (event) => {
    if (event.which === 89 && (event.ctrlKey || event.metaKey)){
      this._onRedo();
      event.preventDefault();
      event.stopPropagation();
    }
    else if (event.which === 90 && (event.ctrlKey || event.metaKey)){
      event.shiftKey ? this._onRedo() : this._onUndo();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  _onGlobalCut = (event) => {
    this._onGlobalCopy(event, {cut: true})
  }

  _onGlobalCopy = (event) => {
    
  }

  _onGlobalPaste = (event) => {
    const items = Array.from(event.clipboardData.items);
    if (items) {
      const imageItem = items.find(i => i.type.includes("image"));
      if (imageItem) {
        const img = new Image();
        img.onload = () => {
          this._onApplyImage(img);
        };
        img.src = URL.createObjectURL(imageItem.getAsFile());
      }
    }
  }

  _onApplyImage = (img) => {
    const {imageData} = this.state;
    const {width, height} = imageData;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const scale = Math.min(height / img.height, width / img.width);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, (width - img.width * scale) / 2, (height - img.height * scale) / 2, img.width * scale, img.height * scale);
    const nextImageData = ctx.getImageData(0, 0, width, height);
    CreatePixelImageData.call(nextImageData);
    this.setStateWithCheckpoint({
      imageData: nextImageData,
    });
  }

  _onCanvasMouseDown = (event, pixel) => {
    const tool = this.state.tool;
    if (tool) {
      this.setState(tool.mousedown(pixel, this.state));
    }
  }

  _onCanvasMouseMove = (event, pixel) => {
    const tool = this.state.tool;
    if (tool) {
      this.setState(tool.mousemove(pixel, this.state));
    }
  }

  _onCanvasMouseUp = (event, pixel) => {
    const tool = this.state.tool;
    if (tool) {
      this.setStateWithCheckpoint(tool.mouseup(tool.mousemove(pixel, this.state)));
    }
  }

  render() {
    const {imageData, tool, tools, color, undoStack, redoStack} = this.state;

    return (
      <Modal
        isOpen={imageData !== null}
        backdrop="static"
        toggle={() => {}}
        className="paint"
      >
        <div tabIndex={0} onKeyDown={this._onKeyDown}>
          <div className="modal-header" style={{display: 'flex'}}>
            <h4 style={{flex: 1}}>Edit Appearance</h4>
            <Button
              className="icon"
              onClick={this._onUndo}
              disabled={undoStack.length === 0}
            >
              <img src="/editor/img/icon_undo.png" />
            </Button>
            <Button
              className="icon"
              onClick={this._onRedo}
              disabled={redoStack.length === 0}
            >
              <img src="/editor/img/icon_redo.png" />
            </Button>
          </div>
          <ModalBody>
            <div className="flex-horizontal">
              <div className="paint-sidebar">
                <PixelColorPicker
                  color={color}
                  onColorChange={(c) => this.setState({color: c})}
                />
                <PixelToolbar
                  tools={tools}
                  tool={tool}
                  onToolChange={(t) => this.setState({tool: t})}
                />
              </div>
              <PixelCanvas
                pixelSize={11}
                onMouseDown={this._onCanvasMouseDown}
                onMouseMove={this._onCanvasMouseMove}
                onMouseUp={this._onCanvasMouseUp}
                {...this.state}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button key="cancel" onClick={this._onClose}>Close without Saving</Button>{' '}
            <Button key="save" onClick={this._onCloseAndSave}>Save Changes</Button>
          </ModalFooter>
        </div>
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
