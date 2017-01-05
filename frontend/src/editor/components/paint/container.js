import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter, DropdownMenu, DropdownToggle, ButtonDropdown, DropdownItem} from 'reactstrap';
import objectAssign from 'object-assign';

import * as Tools from './tools';

import {paintCharacterAppearance} from '../../actions/ui-actions';
import {changeCharacter} from '../../actions/characters-actions';

import {getImageDataFromDataURL, getDataURLFromImageData, getFlattenedImageData} from './helpers';
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
      getImageDataFromDataURL(frameDataURL, {}, (imageData) => {
        CreatePixelImageData.call(imageData);
        this.setState({imageData, undoStack: [], redoStack: []});
      });
    } else {
      this.setState({imageData: null, undoStack: [], redoStack: []});
    }
  }

  getCheckpoint(state = this.state) {
    return {
      imageData: state.imageData,
      selectionImageData: state.selectionImageData,
      selectionOffset: state.selectionOffset,
    };
  }

  setStateWithCheckpoint(nextState) {
    this.setState(objectAssign({}, nextState, {
      redoStack: [],
      undoStack: this.state.undoStack
        .slice(Math.max(0, this.state.undoStack.length - MAX_UNDO_STEPS))
        .concat([this.getCheckpoint()]),
    }));
  }

  _onUndo = () => {
    const undoStack = [].concat(this.state.undoStack);
    const changes = undoStack.pop();
    if (!changes) { return; }
    const redoStack = [].concat(this.state.redoStack, [this.getCheckpoint()]);
    this.setState(objectAssign({}, changes, {redoStack, undoStack}));
  }

  _onRedo = () => {
    const redoStack = [].concat(this.state.redoStack);
    const changes = redoStack.pop();
    if (!changes) { return; }
    const undoStack = [].concat(this.state.undoStack, [this.getCheckpoint()]);
    this.setState(objectAssign({}, changes, {redoStack, undoStack}));
  }

  _onClose = () => {
    this.props.dispatch(paintCharacterAppearance(null));
  }

  _onCloseAndSave = () => {
    const {dispatch, characterId, appearanceId} = this.props;
    const imageDataURL = getDataURLFromImageData(this.state.imageData);
    dispatch(changeCharacter(characterId, {spritesheet: {appearances: {[appearanceId]: [imageDataURL]}}}));
    dispatch(paintCharacterAppearance(null));
  }

  _onKeyDown = (event) => {
    if ((event.key === 'y' || event.key === 'Z') && (event.ctrlKey || event.metaKey)){
      this._onRedo();
      event.preventDefault();
      event.stopPropagation();
    }
    else if (event.key === 'z' && (event.ctrlKey || event.metaKey)){
      this._onUndo();
      event.preventDefault();
      event.stopPropagation();
    }
    else if ((event.key === 'Escape') || (event.key === 'Enter')) {
      this.setStateWithCheckpoint({
        imageData: getFlattenedImageData(this.state),
        selectionImageData: null,
      });
    }
    else if ((event.key === 'Delete') || (event.key === 'Backspace')) {
      this.setStateWithCheckpoint({
        selectionImageData: null,
      });
    }
    else if (event.key.startsWith('Arrow')) {
      const delta = event.shiftKey ? 5 : 1;
      this.setStateWithCheckpoint({
        selectionOffset: {
          x: this.state.selectionOffset.x + ({ArrowLeft: -delta, ArrowRight: delta}[event.key] || 0),
          y: this.state.selectionOffset.y + ({ArrowUp: -delta, ArrowDown: delta}[event.key] || 0),
        }
      });
    }
  }

  _onGlobalCopy = (event) => {
    event.clipboardData.setData('dataurl', getDataURLFromImageData(this.state.selectionImageData));
    event.clipboardData.setData('offset', JSON.stringify(this.state.selectionOffset));
    event.preventDefault();
  }

  _onGlobalCut = (event) => {
    this._onGlobalCopy(event);
    this.setStateWithCheckpoint({
      selectionImageData: null,
    });
  }

  _onGlobalPaste = (event) => {
    const {imageData, tools} = this.state;
    const items = Array.from(event.clipboardData.items);

    let dataURL = event.clipboardData.getData('dataurl');
    const offset = event.clipboardData.getData('offset') || `{"x":0,"y":0}`;

    const imageItem = items && items.find(i => i.type.includes("image"));
    if (imageItem) {
      dataURL = URL.createObjectURL(imageItem.getAsFile());
    }

    if (dataURL) {
      getImageDataFromDataURL(dataURL, {
        maxWidth: imageData.width,
        maxHeight: imageData.height,
      }, (nextSelectionImageData) => {
        CreatePixelImageData.call(nextSelectionImageData);

        this.setStateWithCheckpoint({
          imageData: getFlattenedImageData(this.state),
          selectionOffset: JSON.parse(offset),
          selectionImageData: nextSelectionImageData,
          tool: tools.find(t => t.name === 'select')
        });
      });
    }
  }

  _onChooseTool = (tool) => {
    this.setState({
      tool: tool,
      imageData: getFlattenedImageData(this.state),
      selectionImageData: null,
    });
  }

  _onCanvasMouseDown = (event, pixel) => {
    const tool = this.state.tool;
    if (tool) {
      this.setStateWithCheckpoint(tool.mousedown(pixel, this.state, event));
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
      this.setState(tool.mouseup(tool.mousemove(pixel, this.state)));
    }
  }

  _onApplyCoordinateTransform = (coordTransformCallback) => {
    const key = this.state.selectionImageData ? 'selectionImageData' : 'imageData';
    const clone = this.state[key].clone();

    for (let x = 0; x < clone.width; x ++) {
      for (let y = 0; y < clone.height; y ++) {
        const {x: nx, y: ny} = coordTransformCallback({x, y});
        clone.fillPixelRGBA(x, y, ...this.state[key].getPixel(nx, ny));
      }
    }
    this.setStateWithCheckpoint({
      [key]: clone,
    });
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
            <ButtonDropdown
              isOpen={this.state.dropdownOpen}
              toggle={() => this.setState({dropdownOpen: !this.state.dropdownOpen})}
            >
              <DropdownToggle className="icon">
                <i className="fa fa-ellipsis-v" />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={() => this._onApplyCoordinateTransform(({x, y}) => { return {x: imageData.width - x, y}; })}>
                  Flip Horizontally
                </DropdownItem>
                <DropdownItem onClick={() => this._onApplyCoordinateTransform(({x, y}) => { return {x, y: imageData.height - y }; })}>
                  Flip Vertically
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={this._onChooseFile}>
                  Import Image from File...
                </DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
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
                  onToolChange={this._onChooseTool}
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
