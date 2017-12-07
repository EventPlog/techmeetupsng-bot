/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

/* ----------  External Libraries  ---------- */

import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';

/* ----------  Local Components  ---------- */

import App from './app.jsx';
import Oops from './oops.jsx';
import Event from './event.jsx';
import Feedback from './feedback';
import Terms from './terms.jsx';

/* ----------  Styles  ---------- */

import 'weui';
import 'react-weui/lib/react-weui.min.css';
import '../public/style.css';

// Simple initializer for attaching the Preferences App to the DOM
window.attachApp = (userId, event, recipientId) => {
  /**
   * getContext is only available on iOS and Android,
   * so show an error page if userId is undefined
   */
  console.log('[window.attachApp] Attaching app for event ', event)
  if (userId) {
    const app = event
      ? <Event {...event} userId={userId} recipientId={recipientId} />
      : <App userId={userId} />;
    ReactDOM.render(app, document.getElementById('content'));
  } else {
    ReactDOM.render(<Oops />, document.getElementById('content'));
  }
};

// Simple initializer for attaching the Terms and Conditions to the DOM
window.attachTerms = () => {
  console.log('[window.attachTerms] Attaching terms ')
  ReactDOM.render(<Terms />, document.getElementById('content'));
};

// Simple initializer for attaching the Event Page to the DOM
window.attachEvent = (userId, event) => {
  console.log("[window.attachEvent] for user id %s Attaching event: %o", userId, event)
  const app = userId
    ? <Event {...event} userId={userId} />
    : <Oops />;

  ReactDOM.render(app, document.getElementById('content'));
};

// Simple initializer for attaching the Preferences App to the DOM
window.attachFeedback = (userId, event) => {
  /**
   * getContext is only available on iOS and Android,
   * so show an error page if userId is undefined
   */
  console.log("[window.attachFeedback] for event: ", event)
  if (userId || event) {
    const app = event
      ? <Feedback {...event} userId={userId} />
      : <Oops />;
    ReactDOM.render(app, document.getElementById('content'));
  } else {
    ReactDOM.render(<Oops />, document.getElementById('content'));
  }
};