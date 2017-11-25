/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import express from 'express';
import events from './events';

// ===== MESSENGER =============================================================
import sendApi from '../messenger-api-helpers/send';
import receiveApi from '../messenger-api-helpers/receive';

// ===== STORES ================================================================
import UserStore from '../stores/user-store';

const router = express.Router();

// Get user preferences
router.get('/:userId', ({params: {userId}}, res) => {
  const user = UserStore.get(userId) || UserStore.insert({id: userId});
  const userJSON = JSON.stringify(user);

  console.log(`GET User response: ${userJSON}`);

  res.setHeader('Content-Type', 'application/json');
  res.send(userJSON);
});

/**
 * Return events based on preferences,
 * and store a user's preferences if `persist` if selected (idempotent)
 */
router.put('/:userId', ({body, params: {userId}}, res) => {
  if (body.persist) {
    UserStore.insert({...body, id: userId});
  }

  const userJSON = JSON.stringify({...body, userId});
  console.log(`PUT User response: ${userJSON}`);

  res.sendStatus(204);

  sendApi.sendPreferencesChangedMessage(userId);
});

router.use('/:userId/events', events);

/**
 * Update a users selected event,
 */
router.put('/:userId/event/:eventId', ({params: {userId, eventId}}, res) => {
  console.log('PUT User Event response:', {userId, eventId});

  res.sendStatus(204);
  receiveApi.handleNewEventSelected(userId, eventId);
});

/**
 * Send purchase confirmation into thread.
 */
router.put('/:userId/purchase/:eventId', ({params: {userId, eventId}}, res) => {
  console.log('PUT User Purchase response:', {userId, eventId});

  res.sendStatus(204);
  receiveApi.handleNewEventPurchased(userId, eventId);
});


export default router;
