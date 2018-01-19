/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== LODASH ================================================================
import castArray from 'lodash/castArray';

// require('dotenv').config()
// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';
import callWebAPI from './webAPI';
import EventsController from '../store/eventsStore';
import OnboardingController from '../controllers/onboardingController';

import logger from '../client/fba-logging';

// Turns typing indicator on.
const typingOn = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_on', // eslint-disable-line camelcase
  };
};

// Turns typing indicator off.
const typingOff = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_off', // eslint-disable-line camelcase
  };
};

// Wraps a message JSON object with recipient information.
const messageToJSON = (recipientId, messagePayload) => {
  return {
    recipient: {
      id: recipientId,
    },
    message: messagePayload,
  };
};

// Send one or more messages using the Send API.
const sendMessage = (recipientId, messagePayloads) => {
  const messagePayloadArray = castArray(messagePayloads)
    .map((messagePayload) => messageToJSON(recipientId, messagePayload));

  console.log('the messages', messagePayloadArray);
  api.callMessagesAPI([
    typingOn(recipientId),
    ...messagePayloadArray,
    typingOff(recipientId),
  ]);
};

// Send a read receipt to indicate the message has been read
const sendReadReceipt = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen', // eslint-disable-line camelcase
  };

  api.callMessagesAPI(messageData);
};

// Send the initial message telling the user about the promotion.
const sendTextMessage = (recipientId, message) => {
  logger.fbLog("send_message", {payload: "messages to user"}, recipientId);
  sendMessage(recipientId, message ? {text: message} : messages.helloEventsMessage);
};

// Send a message indicating to a user that their preferences have changed.
const sendPreferencesChangedMessage = (recipientId) => {
  sendMessage(
    recipientId,
    [
      messages.preferencesUpdatedMessage,
      messages.currentEventText,
      messages.currentEventButton(recipientId),
    ]);
};

const sendSetPreferencesMessage = (recipientId) => {
  sendMessage(
    recipientId,
    [
      messages.messageWithButtons(
        "Here you go!",
        [messages.setPreferencesButton(recipientId)]
      )
    ]
  )
}

/**
 * Sends a not found message if there are no events
 * @param recipeientId
 * @param user
 */
const sendMessageNotFound = (recipeientId, user) => {
  let payload = [
    messages.formatPayloadText(`404! I couldn't find any matching events at this time. :(`),
    messages.formatPayloadText("I use your interests and location to match you with events"),
    messages.messageWithButtons(
      "You could personalize these when you change your preferences.",
      [messages.setPreferencesButton(user.facebook_id)]
    )
  ];

  sendMessage(
    recipientId,
    payload
  )
}

// Send a message displaying the events a user can choose from.
const sendChooseEventMessage = async (recipientId, params={}) => {
  const {user, events} = await EventsController.index(recipientId, params);
  if(!events || events.length < 1) {
    return sendMessageNotFound(recipientId, user);
  }

  let carouselItems;

  if (params.event && params.event == 'list') {
    carouselItems = messages.eventsList(recipientId, events);
  } else {
    carouselItems = [messages.eventOptionsCarousel(recipientId, events)];
  }

  let outboundMessages = [
    messages.eventOptionsText,
      ...carouselItems,
  ];

  sendMessage( recipientId, outboundMessages)
};

const registerForEvent = async(userId, eventId) => {
  logger.fbLog('attend_event_start', {event_id: eventId}, userId);
  let response = await callWebAPI(`/users/${userId}/user_events`, 'POST', {
    user_event: {event_id: eventId}
  });
  try {
    if (response && response.id) {
      logger.fbLog('attend_event_success', {event_id: eventId}, userId);
      sendEventRegisteredMessage(userId, response)
    }
  }
  catch(err) {
    console.error(
      response.status,
      `Unable to register event for User ${userId}'. Error: ${err}`
    );
  }
}

// Send a message that a users preffered event has changed.
const sendEventChangedMessage = (recipientId) =>
  sendMessage(recipientId, messages.eventChangedMessage(recipientId));

// Send a message that a user has purchased a event.
const sendEventRegisteredMessage = (recipientId, event) =>

  sendMessage(recipientId, messages.eventRegisteredMessage(event));

// Send a message that a user has checked into an event.
const sendEventCheckedInMessage = (recipientId, event) =>
  sendMessage(recipientId, messages.eventCheckedInMessage(event));

// Send a message that a user has given feedback to an event.
const sendFeedbackSentMessage = (recipientId, event) =>
  sendMessage(recipientId, messages.feedbackSentMessage(event));

export default {
  sendMessage,
  sendReadReceipt,
  sendTextMessage,
  sendPreferencesChangedMessage,
  sendChooseEventMessage,
  sendEventChangedMessage,
  sendEventRegisteredMessage,
  sendEventCheckedInMessage,
  sendFeedbackSentMessage,
  sendSetPreferencesMessage,
  registerForEvent,
};
