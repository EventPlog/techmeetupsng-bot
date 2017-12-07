/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import events from '../data/events';
import callWebAPI from '../messenger-api-helpers/webAPI';

// ===== MODULES ===============================================================
import express from 'express';

// ===== MESSENGER ===============================================================
import sendApi from '../messenger-api-helpers/send';

// ===== STORES ================================================================
import EventStore from '../stores/event-store';

const router = express.Router({mergeParams: true});

async function eventsCallback({params: {eventId, userId}}, res) {
  // const event = EventStore.get(eventId);
  const event = await(callWebAPI(`/users/${userId}/events/${eventId}`));
  const eventJSON = JSON.stringify(event);

  res.render(
    './index',
    {
      demo: process.env.DEMO.toString() == 'true',
      event: eventJSON,
      isEvent: true,
      title: event.title,
      userId
    }
  );
}

async function attendEvent ({params: {userId, eventId}, body: {event}}, res) {
  console.log("[eventsroute.attendEvent] params: userId: %s, event: %o", userId, event);

  let response = await callWebAPI(`/users/${userId}/user_events`, 'POST', {
    user_event: {event_id: eventId}
  });
  try {
    if (response && response.id) {
      res.status(200).send(response);
      // logger.fbLog('register_for_event_success', {event_id: event.id}, userId);
      sendApi.sendEventRegisteredMessage(userId, response)
    }
  }
  catch(err) {
    // logger.fbLog('select_event_error', {event_id: event.id}, userId);
    console.error(
      response.status,
      `Unable to register event for User ${userId}'. Error: ${err}`
    );
  }
}

async function checkIn ({params: {userId, eventId}, body: {event}}, res) {
  console.log("[eventsroute.checkIn] params: userId: %s, event: %o", userId, event);

  let response = await callWebAPI(`/users/${userId}/events/${eventId}/check_in`, 'POST');
  try {
    if (response && response.id) {
      res.status(200).send(response);
      // logger.fbLog('register_for_event_success', {event_id: event.id}, userId);
      sendApi.sendEventCheckedInMessage(userId, response)
    }
  }
  catch(err) {
    // logger.fbLog('select_event_error', {event_id: event.id}, userId);
    console.error(
      response.status,
      `Unable to check in to event: ${eventId} for User ${userId}'. Error: ${err}`
    );
  }
}

// Get Event page
router.get('/:eventId', eventsCallback);
router.put('/:eventId', attendEvent);
router.post('/:eventId/check_in', checkIn);

export default router;
