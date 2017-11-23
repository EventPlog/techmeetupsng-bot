/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

/* ----------  External Libraries  ---------- */

import React from 'react';
import 'whatwg-fetch';
import {
  Button,
  ButtonArea,
} from 'react-weui';

/* ----------  Internal Imports  ---------- */

import WebviewControls from '../messenger-api-helpers/webview-controls';
import purchase from './purchase';
import logger from './fba-logging';

const selectEvent = (eventId, userId) => {
  logger.fbLog('select_event_start', {event_id: eventId}, userId);
  fetch(`/users/${userId}/event/${eventId}`, {
    method: 'PUT',
  }).then((response) => {
    if (response.ok) {
      logger.fbLog('select_event_success', {event_id: eventId}, userId);
      return;
    }
    logger.fbLog('select_event_error', {event_id: eventId}, userId);
    console.error(
      response.status,
      `Unable to save event for User ${userId}'`
    );
  }).catch((err) => console.error('Error pushing data', err)).then(() => {
    WebviewControls.close();
  });
};

const checkIn = (eventId, userId) => {
  logger.fbLog('payment_step', {step: "start_purchase", event_id: eventId}, userId);
  console.log('Checking in user: ', userId)
  purchase.buyItem(eventId, userId);
  WebviewControls.close();
};

const giveFeedback = (eventId, userId) => {
  logger.fbLog('payment_step', {step: "start_purchase", event_id: eventId}, userId);
  console.log('Checking in user: ', userId)
  purchase.buyItem(eventId, userId);
  WebviewControls.close();
};

/*
 * A component for displag tyinhe Product details for a given product
 */
const Event = ({id, title, featured_image, link, organizer, userId}) => {
  let closeLink = `https://www.messenger.com/closeWindow/?image_url=${featured_image}&display_text=closing`
  return (
    <div>
      <div id='product' className='static-page'>
        <div className='static-page-body'>
          <div className='product-body'>
            <img className='product-image' src={featured_image}/>
            <div className='product-details'>
              <h1>{title}</h1>
              <p className='static-page-subtitle'>
                <a href={link}>By: {organizer.name}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ButtonArea className='see-options' direction='horizontal'>
        <Button onClick={() => selectEvent(id, userId)}>
          Attend Event
        </Button>
        <Button onClick={() => checkIn(id, userId)}>
          Check In
        </Button>
      </ButtonArea>
    </div>
  );
};

export default Event;
