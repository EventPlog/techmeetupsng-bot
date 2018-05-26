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
        "Click the link below",
        [messages.setPreferencesButton(recipientId)]
      )
    ]
  )
}


const sendCreateEventMessage = (recipientId) => {
  sendMessage(
    recipientId,
    [
      messages.messageWithButtons(
        "Click the link below",
        [messages.createEventButton(recipientId)]
      )
    ]
  );
}
/**
 * Sends a not found message if there are no events
 * @param recipientId
 * @param user
 */
const sendMessageNotFound = (recipientId, user) => {
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
const sendAvailableFutureEvents = async (recipientId, params={}) => {
  try {
    const {user, events} = await EventsController.index(recipientId, params);
    if(events && events.length < 1) {
      return sendMessageNotFound(recipientId, user);
    }

    let carouselItems;

    if (params.event && params.event == 'list') {
      carouselItems = messages.eventsList(recipientId, events);
    } else {
      carouselItems = [messages.eventOptionsCarousel(user, events)];
    }

    let outboundMessages = [
      messages.eventOptionsText,
      sendInvitationToCreateEventMessage(recipientId),
      ...carouselItems,
    ];

    sendMessage( recipientId, outboundMessages)
  }
  catch(err) {
    console.log('[Send.sendAvailableFutureEvents] An error occured: ', err)
  }
};


// Send a message displaying the events a user can choose from.
const sendUserRegisteredEvents = async (recipientId, params={}) => {
  const {user, events} = await EventsController.userEvents(recipientId);
  if(!events || events.length < 1) {
    return sendMessageNotFound(recipientId, user);
  }

  let carouselItems;

  if (params.event && params.event == 'list') {
    carouselItems = messages.eventsList(recipientId, events);
  } else {
    carouselItems = [messages.eventOptionsCarousel(user, events)];
  }

  let outboundMessages = [
    messages.userEventsText,
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
};

const showEventReport = async(userId, event) => {
  logger.fbLog('show_event_report_start', {event_id: event.id}, userId);
  let response = await callWebAPI(`/users/${userId}/events/${event.id}/report`)
  try {
    if (response && response.id) {
      logger.fbLog('show_event_report_success', {event_id: eventId}, userId)
      sendEventReport(userId, response)
    }
  }
  catch (err) {
    console.error(response.status, `Unable to show event for event id: ${event.id}`)
  }
};

const peopleTense = (arr) => {
  return arr && arr.length == 1 ? 'person' : 'people'
};

const sendEventReport = (recipientId, {
  checked_in,
  feedback_responses,
  percentage_feedback,
  percentage_avg_satisfaction,
  nps,
  percentage_swags
}) => {
  let people = `${checked_in.length} ${peopleTense(checked_in)} checked into this event by scanning the TMN code.`;
  let feedback_res = `${feedback_responses.length} ${peopleTense(feedback_responses)} (${percentage_feedback}%) gave feedback. Congratulations! It’s usually difficult to get up to 10% of event attendees to give feedback through traditional means!`;
  let satisfaction = `The average satisfaction this event has is *${percentage_avg_satisfaction}%*. ${(percentage_avg_satisfaction > 50) ? 'Great job!' : 'There is always room for improvements :)'}`;
  let perc_nps = `*${nps * 100}%* of your audience would love to tell their friends of your event (Net Promoter Score: ${nps}).`;
  let swags = `*${percentage_swags}%* of your audience reported getting swags.`;

  console.log('the send msg: ', sendMessage)
  sendMessage(recipientId, {
    text: `${people} \n\n${feedback_res} \n\n${satisfaction} \n\n${perc_nps} \n\n${swags}`
  });
};


const checkIntoEvent = async(userId, eventId) => {
  logger.fbLog('check_into_event_start', {event_id: eventId}, userId);
  let response = await callWebAPI(`/users/${userId}/events/${eventId}/check_in`, 'POST', {});
  try {
    if (response && response.id) {
      logger.fbLog('check_into_event_success', {event_id: eventId}, userId);
      sendEventCheckedInMessage(userId, response)
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
  sendMessage(
    recipientId,
    [
      messages.messageWithButtons(
        messages.eventRegisteredMessage(event),
        [
          messages.checkInEventButton(event.id),
          messages.viewMyEventsButton
        ]
      )
    ]
  );

// Send a message that a user has checked into an event.
const sendEventCheckedInMessage = async(recipientId, event) => {
  await sendMessage(
    recipientId,
    [
      messages.messageWithButtons(
        messages.eventCheckedInMessage(event),
        [messages.viewDetailsButton(event.id, recipientId, "Give feedback 🌱")]
      )
    ]
  );
  setTimeout((r_id, user) =>
    OnboardingController.index(r_id, user), 10000, recipientId, event.user);
}

// Send an inviitation to create an event
const sendInvitationToCreateEventMessage = (recipientId) =>
  messages.messageWithButtons(
    messages.invitationToCreateEventMessage,
    [messages.createEventButton(recipientId)],
  );

// Send a message that a user has given feedback to an event.
const sendFeedbackSentMessage = (recipientId, event) =>
  sendMessage(recipientId, messages.feedbackSentMessage(event));

const sendEventSubmittedMessage = (recipientId, eventToSubmit) =>
  sendMessage(recipientId, messages.eventSubmittedMessage(eventToSubmit));

export default {
  sendMessage,
  sendReadReceipt,
  sendTextMessage,
  sendPreferencesChangedMessage,
  sendAvailableFutureEvents,
  sendUserRegisteredEvents,
  sendCreateEventMessage,
  sendEventChangedMessage,
  sendEventRegisteredMessage,
  sendEventCheckedInMessage,
  sendFeedbackSentMessage,
  sendEventSubmittedMessage,
  sendSetPreferencesMessage,
  showEventReport,
  sendEventReport,
  registerForEvent,
  checkIntoEvent,
};
