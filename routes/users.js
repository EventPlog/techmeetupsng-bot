/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import express from 'express';

// ===== MESSENGER =============================================================
import sendApi from '../messenger-api-helpers/send';
import receiveApi from '../messenger-api-helpers/receive';

// ===== STORES ================================================================
import UserStore from '../stores/user-store';

const router = express.Router();

// Get user preferences
router.get('/:userID', ({params: {userID}}, res) => {
  const user = UserStore.get(userID) || UserStore.insert({id: userID});
  const userJSON = JSON.stringify(user);

  console.log(`GET User response: ${userJSON}`);

  res.setHeader('Content-Type', 'application/json');
  res.send(userJSON);
});

/**
 * Return events based on preferences,
 * and store a user's preferences if `persist` if selected (idempotent)
 */
router.put('/:userID', ({body, params: {userID}}, res) => {
  if (body.persist) {
    UserStore.insert({...body, id: userID});
  }

  const userJSON = JSON.stringify({...body, userID});
  console.log(`PUT User response: ${userJSON}`);

  res.sendStatus(204);

  sendApi.sendPreferencesChangedMessage(userID);
});

/**
 * Update a users selected event,
 */
router.put('/:userID/event/:eventID', ({params: {userID, eventID}}, res) => {
  console.log('PUT User Event response:', {userID, eventID});

  res.sendStatus(204);
  receiveApi.handleNewEventSelected(userID, eventID);
});

/**
 * Send purchase confirmation into thread.
 */
router.put('/:userID/purchase/:eventID', ({params: {userID, eventID}}, res) => {
  console.log('PUT User Purchase response:', {userID, eventID});

  res.sendStatus(204);
  receiveApi.handleNewEventPurchased(userID, eventID);
});


export default router;
