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

const SERVER_URL = process.env.SERVER_URL;

/**
 * Button for displaying the preferences menu inside a webview
 */
const setPreferencesButton = (userId) => ({
  type: 'web_url',
  title: 'Set Preferences',
  url: `${SERVER_URL}/users/${userId}/preferences`,
  webview_height_ratio: 'tall',
  messenger_extensions: true,
});

/*
 * Button for displaying the view details button for a event
 */
const viewDetailsButton = (eventId, userId) => {
  console.log('[view detailsButton] for event id', eventId)
  return {
    title: 'View Details',
    type: 'web_url',
    url: `${SERVER_URL}/users/${userId}/events/${eventId}`,
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
const viewEventsButton = {
  type: 'postback',
  title: 'Show Events',
  payload: JSON.stringify({
    type: 'VIEW_EVENTS',
  }),
};

/**
 * Button for displaying a postback button that triggers the change event flow
 */
const attendEventButton = (eventId) => ({
  type: 'postback',
  title: 'Attend',
  payload: JSON.stringify({
    type: `ATTEND_EVENT-${eventId}`
  }),
});


/**
 * Button for displaying a postback button that triggers the change event flow
 */
const setPreferencesPostback = {
  type: 'postback',
  title: 'Set Preferences',
  payload: JSON.stringify({
    type: 'SET_PREFERENCES',
  }),
};

/**
 * Button for sharing events`
 * @type {{type: string, share_contents: {attachment: {type: string, payload: {template_type: string, elements: [*]}}}}}
 */
const shareEventsButton = ({id: eventId, title, organizer, featured_image}, userId) => ({
  type: "element_share",
  share_contents: {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title,
            subtitle: "By: " + organizer.name,
            image_url: featured_image,
            default_action: {
              type: "web_url",
              url: `${SERVER_URL}/users/${userId}/events/${eventId}?ref=invited_by_${userId}`
            },
            buttons: [
              {
                type: "web_url",
                url: `${SERVER_URL}/users/${userId}/events/${eventId}?ref=invited_by_${userId}`,
                title: "View event"
              }
            ]
          }
        ]
      }
    }
  }
})

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
      buttons: [viewEventsButton],
    },
  },
};

/**
 * Message that informs the user of the promotion and prompts
 * them to set their preferences.
 */
const messageWithButtons = (text, buttons) => ({
  attachment: {
    type: 'template',
    payload: {
      template_type: 'button',
      text,
      buttons,
    },
  },
});

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
 * format messages so they can be sent to fb api
 */
const formatPayloadText = text => ({ text });

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
              shareEventsButton,
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
  text: 'Pulling up a list of events you might like ...',
};

/**
 * Message that precedes an event from a barcode
 */
const barCodeWelcomeMessage = {
  text: 'Hey, retrieving the event from the barcode you scanned...',
};

/**
 * Message that informs the user what event has been selected for them
 * and prompts them to select a different event.
 *
 * @param {Object} id - The Event unique id.
 * @param {Object} title - The Event name.
 * @param {Object} date - The Event date
 * @param {Object} time - The Event time
 * @param {Object} venue - The Event venue
 * @param {Object} organizer - The Event organizer.
 * @param {Object} featured_image - Path to the original image for the event.
 * @returns {Object} Messenger representation of a carousel item.
 */
const eventToCarouselItem = ({id, title, date, time, venue, organizer, featured_image}, user) => {
  return {
    title,
    subtitle: `By ${organizer.name}` +
              `\nDate: ${date}` +
              `\nTime: ${time}` +
              `\nVenue: ${venue || 'Not yet specified'}`,
    image_url: featured_image,
    buttons: [
      viewDetailsButton(id, user.id),
      shareEventsButton({id, title, organizer, featured_image}, user.id)
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
const eventOptionsCarousel = (recipientId, events) => {
  const user = UserStore.get(recipientId) || UserStore.insert({id: recipientId});
  // const eventOptions = user.getRecommendedEvents();

  const carouselItems = events.map(event => eventToCarouselItem(event, user));

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
 * Message that informs the user what event has been selected for them
 * and prompts them to select a different event.
 *
 * @param {Object} id - The Event unique id.
 * @param {Object} title - The Event name.
 * @param {Object} date - The Event date
 * @param {Object} time - The Event time
 * @param {Object} venue - The Event venue
 * @param {Object} organizer - The Event organizer.
 * @param {Object} featured_image - Path to the original image for the event.
 * @returns {Object} Messenger representation of a carousel item.
 */
const eventToListItem = ({id, title, date, time, venue, organizer, featured_image}, user) => {
  return messageWithButtons(
    `${title}` +
    `\n\nOrganized by ${organizer.name}` +
    `\n\nDate: ${date}` +
    `\nTime: ${time}` +
    `\nVenue: ${venue || 'Not yet specified'}`,
    [
      viewDetailsButton(id, user.id),
      attendEventButton(id),
      shareEventsButton({id, title, organizer, featured_image}, user.id)
    ]
  );
};
/**
 * Message that informs the user what event has been selected for them
 * and prompts them to select a different event.
 *
 * @param {String} recipientId Id of the user to send the message to.
 * @returns {Object} Message payload
 */
const eventsList = (recipientId, events) => {
  const user = UserStore.get(recipientId) || UserStore.insert({id: recipientId});

  const carouselItems = events.map(event => eventToListItem(event, user));

  return carouselItems;
  // return {
  //   attachment: {
  //     type: 'template',
  //     payload: {
  //       template_type: 'generic',
  //       elements: carouselItems,
  //     },
  //   },
  // };
};

/**
 * Message that informs the user what event will be sent to them.
 *
 * @param {String} recipientId Id of the user to send the message to.
 * @returns {Object} Message payload
 */
const eventChangedMessage = (recipientId) => {
  // const {preferredEvent, dateOfBirth} = UserStore.get(recipientId);
  return {
    // text: `Perfect! You can look forward to the ${preferredEvent.name} on ${dateString(dateOfBirth)}. `,
    text: `Hey, we don't have your email address yet. Could you help out? Thanks`,
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
    text: `Okay, I've added "${event.title}" to your events :)` +
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
 * Message thanking users for checking in
 *
 * @param {String} event Id of the purchased item.
 * @returns {Object} Message payload
 */
const feedbackSentMessage = (event) => {
  return {
    text: `Thank you for contributing towards improving tech events by sharing feedback. Organizers really, really appreciate. :)`
  };
};

/**
 * The persistent menu for users to use.
 */
const persistentMenu = {
  setting_type: 'call_to_actions',
  thread_state: 'existing_thread',
  call_to_actions: [
    viewEventsButton,
    setPreferencesPostback,
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
  eventsList,
  eventRegisteredMessage,
  eventCheckedInMessage,
  feedbackSentMessage,
  formatPayloadText,
  messageWithButtons,
  viewEventsButton,
  setPreferencesButton,
  setPreferencesPostback,
  barCodeWelcomeMessage,
  persistentMenu,
  getStarted,
};
