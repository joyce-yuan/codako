import React, {PropTypes} from 'react';
import {replace} from 'react-router-redux';
import EditorRoot from '../editor/root';
import StoreProvider from '../editor/store-provider';
import {makeRequest} from '../helpers/api';
import {connect} from 'react-redux';

import PageMessage from './common/page-message';


const APIAdapter = {
  load: function (props) {
    const {dispatch, params: {worldId}, me} = props;

    return makeRequest(`/worlds/${worldId}`).then((world) => {
      if (!world || !me || world.userId !== me.id) {
        if (!me) {
          dispatch(replace({
            pathname: `/login`,
            state: {
              redirectTo: `/editor/${worldId}`,
            },
          }));
          return Promise.reject(new Error("Redirecting..."));
        }
        return Promise.reject(new Error("Sorry, this world could not be found."));
      }
      return Promise.resolve(world);
    });
  },
  save: function (json) {
    return makeRequest(`/worlds/${this.props.params.worldId}`, {method: 'PUT', json});
  },
};

const LocalStorageAdapter = {
  load: function (props) {
    const {dispatch, params: {worldId}} = props;

    try {
      this._value = JSON.parse(window.localStorage.getItem(worldId));
    } catch (err) {
      window.alert(err.toString());
    }

    if (!this._value) {
      dispatch(replace(`/`));
      return Promise.reject(new Error("This world was not found in your browser's storage."));
    } else if (this._value.uploadedAsId) {
      dispatch(replace(`/editor/${this._value.uploadedAsId}`));
      return Promise.reject(new Error("Redirecting to the new path for this world."));
    }
    return Promise.resolve(this._value);
  },
  save: function (json) {
    this._value.data = json.data;
    window.localStorage.setItem(this.props.params.worldId, JSON.stringify(this._value));
    return Promise.resolve();
  },
};


class EditorPage extends React.Component {
  static propTypes = {
    me: PropTypes.object,
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      query: PropTypes.shape({
        localstorage: PropTypes.string,
      }),
    }),
    params: PropTypes.shape({
      worldId: PropTypes.string,
    }),
  }

  static childContextTypes = {
    usingLocalStorage: PropTypes.bool,
  };

  static layoutConsiderations = {
    hidesNav: true,
    hidesFooter: true,
    unwrapped: true,
  };

  constructor(props, context) {
    super(props, context);

    this._mounted = false;
    this.state = {
      loaded: false,
      error: null,
      world: null,
    };
  }

  getChildContext() {
    return {
      usingLocalStorage: this.getAdapter(this.props) === LocalStorageAdapter,
    };
  }

  componentDidMount() {
    this._mounted = true;
    this.loadWorld(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.worldId !== nextProps.params.worldId) {
      this.loadWorld(nextProps);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  loadWorld(props) {
    this.getAdapter(props).load.call(this, props).then((world) => {
      if (!this._mounted) { return; }
      this.setState({world, loaded: true});
    }).catch((error) => {
      if (!this._mounted) { return; }
      this.setState({error: error.message, loaded: true});
    });
  }

  getAdapter(props) {
    if (props.location.query.localstorage) {
      return LocalStorageAdapter;
    }
    return APIAdapter;
  }

  render() {
    const {world, loaded, error} = this.state; 

    if (error || !loaded) {
      return (
        <PageMessage text={error ? error : "Loading..."} />
      );
    }

    return (
      <StoreProvider
        key={world.id}
        world={world}
        onSave={(json) => this.getAdapter(this.props).save.call(this, json)}
      >
        <EditorRoot />
      </StoreProvider>
    );
  }
}

function mapStateToProps(state) {
  return {
    me: state.me,
  };
}

export default connect(mapStateToProps)(EditorPage);


