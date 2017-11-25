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

// ===== STORES ================================================================
import EventStore from '../stores/event-store';

const router = express.Router({mergeParams: true});

async function eventsCallback({params: {eventId, userId}}, res) {
  // const event = EventStore.get(eventId);
  const event = await(callWebAPI(`/users/${userId}/events/${eventId}`));
  const eventJSON = JSON.stringify(event);
  console.log(`GET Event response: ${eventJSON}`);

  res.render(
    './index',
    {
      demo: process.env.DEMO,
      event: eventJSON,
      title: event.title,
      userId
    }
  );
}
// Get Event page
router.get('/:eventId', eventsCallback);

export default router;
