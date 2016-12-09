import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/app';
import HomePage from './components/home-page';
import AboutPage from './components/about-page';
import EditorPage from './components/editor-page';
import NotFoundPage from './components/not-found-page';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage}/>
    <Route path="editor" component={EditorPage}/>
    <Route path="about" component={AboutPage}/>
    <Route path="*" component={NotFoundPage}/>
  </Route>
);
