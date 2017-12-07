/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable camelcase */
/* eslint-disable max-len */

/*
 * MESSAGES
 *
 * Objects and methods that create objects that represent
 * messages sent to Messenger users.
 */

// ===== STORES ================================================================
import UserStore from '../stores/user-store';
import EventStore from '../stores/event-store';
import eventsData from '../data/events';

// ===== UTILS =================================================================
import {dateString} from '../utils/date-string-format';
import callWebAPI from './webAPI';

const SERVER_URL = process.env.SERVER_URL;

/**
 * Button for displaying the preferences menu inside a webview
 */
const setPreferencesButton = {
  type: 'web_url',
  title: 'Set Preferences',
  url: `${SERVER_URL}/`,
  webview_height_ratio: 'tall',
  messenger_extensions: true,
};

/*
 * Button for displaying the view details button for a event
 */
const viewDetailsButton = (eventId, userId) => {
  console.log('[view detailsButton] for event id', eventId)
  return {
    title: 'View Details',
    type: 'web_url',
    url: `${SERVER_URL}/users/${userId}/events/${eventId}`,
    // url: `${SERVER_URL}/events/${eventId}`,
    webview_height_ratio: 'tall',
    messenger_extensions: true,
  };
};

/*
 * Button for selecting a event
 */
const chooseEventButton = (eventId, userId) => {
  return {
    title: 'Share feedback',
    type: 'web_url',
    url: `${SERVER_URL}/${userId}/user/feedback/${eventId}`,
    webview_height_ratio: 'tall',
    messenger_extensions: true,
  };
};
//
// /*
//  * Button for selecting a event
//  */
// const chooseEventButton = (eventId) => {
//   return {
//     type: 'postback',
//     title: 'Share feedback',
//     payload: JSON.stringify({
//       type: 'CHOOSE_GIFT',
//       data: {
//         eventId: eventId,
//       },
//     }),
//   };
// };

/**
 * Button for displaying a postback button that triggers the change event flow
 */
const changeEventButton = {
  type: 'postback',
  title: 'Show Events',
  payload: JSON.stringify({
    type: 'VIEW_EVENTS',
  }),
};

/**
 * Message that informs the user of the promotion and prompts
 * them to set their preferences.
 */
const helloEventsMessage = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: 'Thank you for letting us help you keep track of tech events.',
      buttons: [changeEventButton, setPreferencesButton],
    },
  },
};

/**
 * Message that informs the user that their preferences have changed.
 */
const preferencesUpdatedMessage = {
  text: 'OK, we’ve updated your preferences. You can change them anytime you want from the menu.',
};

/**
 * Message that informs that we have their current event selected.
 */
const currentEventText = {
  text: 'This is your current event selection. If you’d like to change it, you can do so below.',
};

/**
 * Message that informs the user what event has been selected for them
 * and prompts them to select a different event.
 *
 * @param {String} recipientId Id of the user to send the message to.
 * @returns {Object} Message payload
 */
const currentEventButton = (recipientId) => {
  const user = UserStore.get(recipientId);
  const event = user.preferredEvent;

  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: `Your Event: ${event.title}`,
            image_url: event.featured_image,
            subtitle: event.description,
            buttons: [
              viewDetailsButton(event.id),
              changeEventButton,
            ],
          },
        ],
      },
    },
  };
};

/**
 * Message that precedes us displaying recommended events.
 */
const eventOptionsText = {
  text: 'Here are the most recent tech events around you',
};

/**
 * Message that informs the user what event has been selected for them
 * and prompts them to select a different event.
 *
 * @param {Object} id - The Events unique id.
 * @param {Object} title - The Events name.
 * @param {Object} organizer - The Event organizer.
 * @param {Object} featured_image - Path to the original image for the event.
 * @returns {Object} Messenger representation of a carousel item.
 */
const eventToCarouselItem = ({id, title, organizer, featured_image}, user) => {
  return {
    title,
    subtitle: 'By ' + organizer.name,
    image_url: featured_image,
    buttons: [
      viewDetailsButton(id, user.id),
      chooseEventButton(id, user.id),
    ],
  };
};

/**
 * Message that informs the user what event has been selected for them
 * and prompts them to select a different event.
 *
 * @param {String} recipientId Id of the user to send the message to.
 * @returns {Object} Message payload
 */
async function eventOptionsCarousel (recipientId) {
  const user = UserStore.get(recipientId) || UserStore.insert({id: recipientId});
  // const eventOptions = user.getRecommendedEvents();
  const eventOptions = await(callWebAPI(`/users/${recipientId}/events`));

  const carouselItems = eventOptions.events.map(gift => eventToCarouselItem(gift, user));

  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: carouselItems,
      },
    },
  };
};

/**
 * Message that informs the user what event will be sent to them.
 *
 * @param {String} recipientId Id of the user to send the message to.
 * @returns {Object} Message payload
 */
const eventChangedMessage = (recipientId) => {
  const {preferredEvent, dateOfBirth} = UserStore.get(recipientId);
  return {
    text: `Perfect! You can look forward to the ${preferredEvent.name} on ${dateString(dateOfBirth)}. `,
  };
};

/**
 * Message pointing users to the registration spot
 *
 * @param {String} event Id of the purchased item.
 * @returns {Object} Message payload
 */
const eventRegisteredMessage = (event) => {
  // const purchasedItem = EventStore.get(eventId);
  return {
    text: `Okay, I've added ${event.title} to your events :)` +
          `\n\nVisit the link: ${event.link} to register with the organizers.`,
  };
};

/**
 * Message thanking users for checking in
 *
 * @param {String} event Id of the purchased item.
 * @returns {Object} Message payload
 */
const eventCheckedInMessage = (event) => {
  // const purchasedItem = EventStore.get(eventId);
  return {
    text: `You've successfully checked into the event: "${event.title}"` +
    `\n\nRemember to give feedback! :)`
  };
};

/**
 * The persistent menu for users to use.
 */
const persistentMenu = {
  setting_type: 'call_to_actions',
  thread_state: 'existing_thread',
  call_to_actions: [
    changeEventButton,
    setPreferencesButton,
  ],
};

/**
 * The Get Started button.
 */
const getStarted = {
  setting_type: 'call_to_actions',
  thread_state: 'new_thread',
  call_to_actions: [
    {
      payload: JSON.stringify({
        type: 'GET_STARTED',
      }),
    },
  ],
};

export default {
  helloEventsMessage,
  preferencesUpdatedMessage,
  currentEventText,
  currentEventButton,
  eventOptionsText,
  eventOptionsCarousel,
  eventChangedMessage,
  eventRegisteredMessage,
  eventCheckedInMessage,
  persistentMenu,
  getStarted,
};
