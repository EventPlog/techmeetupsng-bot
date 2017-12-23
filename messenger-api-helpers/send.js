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
import logger from './fba-logging';
import callWebAPI from './webAPI';
import EventsController from '../store/eventsStore';
import OnboardingController from '../controllers/onboardingController';

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
  logger.fbLog("send_message", {payload: "hello_events"}, recipientId);
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

const sendEventNotFoundMessage = ({user, events}) => {
}

// Send a message displaying the events a user can choose from.
const sendChooseEventMessage = async (recipientId, params={}) => {
  const {user, events} = await EventsController.index(recipientId, params);
  if(!events || events.length < 1) {
    let locations = user && user.locations.length > 0 ? ' in ' + user.locations.map(loc => loc.state).join(','): '';
    return sendTextMessage(recipientId,
      `404! I couldn't find any matching events${locations} at this time. :(`);
  }

  let carouselItems = messages.eventOptionsCarousel(recipientId, events);
  let outboundMessages = [
    messages.eventOptionsText,
    carouselItems,
  ];
  // if (user.email && user.email.substr(0, 3) == 'tmn') {
  //   console.log('a message: ', messages.eventChangedMessage(recipientId));
  //   outboundMessages.push(messages.eventChangedMessage(recipientId));
  // }
  sendMessage( recipientId, outboundMessages)
};

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
};
