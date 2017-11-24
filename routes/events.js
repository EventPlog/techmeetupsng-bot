/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import events from '../data/events';

// ===== MODULES ===============================================================
import express from 'express';

// ===== STORES ================================================================
import EventStore from '../stores/event-store';

const router = express.Router();

// Get Event page
router.get('/:eventId', ({params: {eventId}, query: {recipientId}}, res) => {
  // const event = EventStore.get(eventId);
  const event = events[0];
  const eventJSON = JSON.stringify(events[0]);
  console.log(`GET Event response: ${eventJSON} and recipient id: ${recipientId}`);

  res.render(
    './index',
    {
      demo: process.env.DEMO,
      event: eventJSON,
      title: event.title,
      recipientId
    }
  );
});

export default router;
