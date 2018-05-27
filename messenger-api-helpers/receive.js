/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import sendApi from './send';
import logger from './fba-logging';
const util = require('util');
import NLProcessor from '../utils/nlProcessor';
import EventsController from '../store/eventsStore';
import messages from './messages';

// ===== STORES ================================================================
// import UserStore from '../stores/user-store';
import UserStore from '../store/userStore';


// Updates a users preferred event, then notifies them of the change.
const handleNewEventSelected = (senderId, eventId) => {
  const user = UserStore.get(senderId);
  user.setPreferredEvent(eventId);
  sendApi.sendEventChangedMessage(senderId);
};

// Thanks user for purchasing event.
const handleNewEventPurchased = (senderId, eventId) => {
  sendApi.sendEventRegisteredMessage(senderId, eventId);
};

const handleEventRegistration = async (userId, [type, eventId]) =>  {
  sendApi.registerForEvent(userId, eventId);
}

const handleEventCheckIn = async (userId, [type, eventId]) =>  {
  try {
    sendApi.checkIntoEvent(userId, eventId);
    TMNG.logger.event(``,
      async function (userId, [type, eventId]) {
      },
      [user, [type, eventId]])
  }
  catch(e) {
    TMNG.logger.errorException(`[receive.handleEventCheckIn] An error occured while checking in user: ${userId} for event: ${eventId}`, e)
  }
}

/*
 * handleReceivePostback — Postback event handler triggered by a postback
 * action you, the developer, specify on a button in a template. Read more at:
 * developers.facebook.com/docs/messenger-platform/webhook-reference/postback
 */
const handleReceivePostback = (event) => {
  /**
   * The 'payload' parameter is a developer-defined field which is
   * set in a postbackbutton for Structured Messages.
   *
   * In this case we've defined our payload in our postback
   * actions to be a string that represents a JSON object
   * containing `type` and `data` properties. EG:
   */
  try {
    console.log('should start the postback now ...')
    TMNG.logger.event("[receive.handleReceivePostback]", function(event) {

      const {type, data} = JSON.parse(event.postback.payload);
      const senderId = event.sender.id;

      // perform an action based on the type of payload received
      let typeArr = type.split('-');
      switch (typeArr[0]) {
        case 'VIEW_EVENTS':
          sendApi.sendAvailableFutureEvents(senderId);
          break;
        case 'VIEW_EVENT':
          handleReceiveReferral(event);
          break;
        case 'VIEW_USER_EVENTS':
          sendApi.sendUserRegisteredEvents(senderId);
          break;
        case 'CREATE_EVENT':
          sendApi.sendCreateEventMessage(senderId);
          break;
        case 'SET_PREFERENCES':
          sendApi.sendSetPreferencesMessage(senderId);
          break;
        case 'ATTEND_EVENT':
          handleEventRegistration(senderId, typeArr);
          break;
        case 'CHECK_IN_EVENT':
          handleEventCheckIn(senderId, typeArr);
          break;
        case 'SHOW_REPORT':
          sendApi.sendEventReport(senderId, event);
          break;
        case 'CHOOSE_GIFT':
          handleNewEventSelected(senderId, data.eventId);
          break;
        case 'GET_STARTED':
          sendApi.sendTextMessage(senderId);
          break;
        default:
          console.error(`Unknown Postback called: ${type}`);
          break;
      }
    }, [event])
  }
  catch(e) {
    TMNG.logger.errorException(`[receive.handReceivePostback] An error occurred for event: ${event}`, e)
  }
};

/*
 * handleReceiveMessage - Message Event called when a message is sent to
 * your page. The 'message' object format can vary depending on the kind
 * of message that was received. Read more at: https://developers.facebook.com/
 * docs/messenger-platform/webhook-reference/message-received
 */
async function handleReceiveMessage (event) {
  try {
    TMNG.logger.event(`[receive.handleReceiveMessage] for event: ${event}`, async function(event) {
      const message = event.message;
      const senderId = event.sender.id;

      // It's good practice to send the user a read receipt so they know
      // the bot has seen the message. This can prevent a user
      // spamming the bot if the requests take some time to return.
      sendApi.sendReadReceipt(senderId);

      await NLProcessor.nlpCheck(senderId, message)
    }, [event])
  }
  catch(e) {
    TMNG.logger.errorException(`[receive.handleReceiveMessage] An error occurred: ${e.message}`, e)
  }
}

async function sendEventCarousel(userId, eventId) {
  try {
    TMNG.logger.event(`[receive.sendEventCarousel] for user and event: ${{userId, eventId}}`, async function(userId, eventId) {
      const event = await EventsController.checkInByReferral(userId, eventId);
      const eventJSON = JSON.stringify(event);

      if (event) {
        let carouselItems = messages.eventOptionsCarousel(event.user, [event]);
        let outboundMessages = [
          messages.barCodeWelcomeMessage(event),
          carouselItems,
        ];
        sendApi.sendMessage(userId, outboundMessages)
      }
    }, [userId, eventId])
  }
  catch(e) {
    TMNG.logger.errorException(`[receive.sendEventCarousel] error: ${e.message}`, e)
  }
}
/*
 * handleReceiveReferral - Message Event called when a referral event is sent to
 * your page. Read more about the 'referral' object at: https://developers.
 * facebook.com/docs/messenger-platform/reference/webhook-events/messaging_referrals/
 */
const handleReceiveReferral = (event) => {
  try {
    TMNG.logger.event(`[receive.handleReceiveReferral] for event: ${event}`, async function(event) {
      const senderId = event.sender.id;
      let payload = {};
      let eventId;
      if (event.referral.ref) {
        payload["ref"] = event.referral.ref;
        let [label, id] = event.referral.ref.split('-')
        eventId = id;
      }
      if (event.referral.ad_id) {
        payload["ad_id"] = event.referral.ad_id;
      }
      logger.fbLog("referral", payload, senderId);

      if (eventId) {
        sendEventCarousel(senderId, eventId)
      }
    }, [event])
  }
  catch (e) {
    TMNG.logger.errorException(`[receive.handleReceiveReferral] error: ${e.message}`, e)
  }
};

export default {
  handleReceivePostback,
  handleReceiveMessage,
  handleReceiveReferral,
  handleNewEventSelected,
  handleNewEventPurchased,
  handleEventRegistration,
  handleEventCheckIn,
};
