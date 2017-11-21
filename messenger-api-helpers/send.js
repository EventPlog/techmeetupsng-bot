/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== LODASH ================================================================
import castArray from 'lodash/castArray';

require('dotenv').config()
// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';
import logger from './fba-logging';

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
const sendHelloEventMessage = (recipientId) => {
  logger.fbLog("send_message", {payload: "hello_events"}, recipientId);
  sendMessage(recipientId, messages.helloEventsMessage);
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

// Send a message displaying the events a user can choose from.
const sendChooseEventMessage = (recipientId) => {
  sendMessage(
    recipientId,
    [
      messages.eventOptionsText,
      messages.eventOptionsCarousel(recipientId),
    ]);
};

// Send a message that a users preffered event has changed.
const sendEventChangedMessage = (recipientId) =>
  sendMessage(recipientId, messages.eventChangedMessage(recipientId));

// Send a message that a user has purchased a event.
const sendEventPurchasedMessage = (recipientId, eventId) =>
  sendMessage(recipientId, messages.eventPurchasedMessage(eventId));


export default {
  sendMessage,
  sendReadReceipt,
  sendHelloEventMessage,
  sendPreferencesChangedMessage,
  sendChooseEventMessage,
  sendEventChangedMessage,
  sendEventPurchasedMessage,
};
