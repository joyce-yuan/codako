import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";

import { createWorld } from "../actions/main-actions";
import RootEditor from "../editor/root-editor";
import StoreProvider from "../editor/store-provider";
import { deepClone } from "../editor/utils/utils";
import { makeRequest } from "../helpers/api";

import { useParams } from "react-router";
import PageMessage from "./common/page-message";

const APIAdapter = {
  load: function (me, worldId) {
    return makeRequest(`/worlds/${worldId}`).then((world) => {
      if (!world || !me || world.userId !== me.id) {
        if (!me) {
          window.location.href = `login?redirectTo=/editor/${worldId}`;
          return Promise.reject(new Error("Redirecting..."));
        }
        return Promise.reject(new Error("Sorry, this world could not be found."));
      }
      return Promise.resolve(world);
    });
  },
  save: function (me, worldId, json) {
    return makeRequest(`/worlds/${worldId}`, {
      method: "PUT",
      json,
    });
  },
};

const LocalStorageAdapter = {
  load: function (me, worldId) {
    let _value;
    try {
      _value = JSON.parse(window.localStorage.getItem(worldId));
    } catch (err) {
      window.alert(err.toString());
    }

    if (!_value) {
      window.location.href = `/`;
      return Promise.reject(new Error("This world was not found in your browser's storage."));
    } else if (_value.uploadedAsId) {
      window.location.href = `/editor/${_value.uploadedAsId}`;
      return Promise.reject(new Error("Redirecting to the new path for this world."));
    }
    return Promise.resolve(_value);
  },
  save: function (me, worldId, json) {
    const _value = JSON.parse(window.localStorage.getItem(worldId));
    _value.data = json.data;
    window.localStorage.setItem(worldId, JSON.stringify(_value));
    return Promise.resolve(_value);
  },
};

// static propTypes = {
//   me: PropTypes.object,
//   dispatch: PropTypes.func,
//   location: PropTypes.shape({
//     query: PropTypes.shape({
//       localstorage: PropTypes.string,
//     }),
//   }),
//   params: PropTypes.shape({
//     worldId: PropTypes.string,
//   }),
// };

export const EditorContext = React.createContext(null);
// static childContextTypes = {
//   usingLocalStorage: PropTypes.bool,
//   saveWorldAnd: PropTypes.func,
// };

const EditorPage = ({ me, dispatch }) => {
  const { worldId } = useParams();

  const _mounted = useRef(true);
  const _saveTimeout = useRef(0);
  const _savePromise = useRef(null);
  const storeProvider = useRef();

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [world, setWorld] = useState(null);
  const [retry, setRetry] = useState(0);

  const Adapter = window.location.href.includes("localstorage") ? LocalStorageAdapter : APIAdapter;

  const _onBeforeUnload = () => {
    if (_saveTimeout.current) {
      saveWorld();

      const msg = "Your changes are still saving. Are you sure you want to close the editor?";
      event.returnValue = msg; // Gecko, Trident, Chrome 34+
      return msg; // Gecko, WebKit, Chrome <34
    }
    return undefined;
  };

  useEffect(() => {
    window.addEventListener("beforeunload", _onBeforeUnload);
    _mounted.current = true;
    return () => {
      window.removeEventListener("beforeunload", _onBeforeUnload);
      _mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await Adapter.load(me, worldId);
        try {
          setWorld(loaded);
          setLoaded(true);
        } catch (err1) {
          loaded.data = deepClone(loaded.data);
          delete loaded.data.ui;
          delete loaded.data.recording;
          try {
            setWorld(loaded);
            setLoaded(true);
            setRetry(1);
          } catch (err2) {
            setWorld(null);
            setError(err1.toString());
          }
        }
      } catch (err) {
        setError(err.message);
        setLoaded(true);
        return;
      }

      if (!_mounted.current) {
        return;
      }
    };
    load();
  }, [worldId]);

  const saveWorld = () => {
    const json = storeProvider.current.getWorldSaveData();

    clearTimeout(_saveTimeout.current);
    _saveTimeout.current = null;

    if (_savePromise.current) {
      saveWorldSoon();
      return _savePromise.current;
    }

    _savePromise.current = Adapter.save(me, worldId, json)
      .then(() => {
        if (!_mounted.current) {
          return;
        }
        _savePromise.current = null;
      })
      .catch((e) => {
        if (!_mounted.current) {
          return;
        }
        _savePromise.current = null;
        alert(
          `Codako was unable to save changes to your world. Your internet connection may be offline. \n(Detail: ${e.message})`,
        );
        throw new Error(e);
      });

    return _savePromise.current;
  };

  const saveWorldSoon = () => {
    clearTimeout(_saveTimeout.current);
    _saveTimeout.current = setTimeout(() => {
      saveWorld();
    }, 5000);
  };

  const saveWorldAnd = (dest) => {
    saveWorld().then(() => {
      if (dest === "tutorial") {
        dispatch(createWorld({ from: "tutorial" }));
      } else {
        window.location.href = dest;
      }
    });
  };

  return (
    <EditorContext.Provider
      value={{
        usingLocalStorage: Adapter === LocalStorageAdapter,
        saveWorldAnd: saveWorldAnd,
      }}
    >
      {error || !loaded ? (
        <PageMessage text={error ? error : "Loading..."} />
      ) : (
        <StoreProvider
          ref={(r) => (storeProvider.current = r)}
          key={`${world.id}${retry}`}
          world={world}
          onWorldChanged={saveWorldSoon}
        >
          <RootEditor />
        </StoreProvider>
      )}
    </EditorContext.Provider>
  );
};

function mapStateToProps(state) {
  return {
    me: state.me,
  };
}

export default connect(mapStateToProps)(EditorPage);
