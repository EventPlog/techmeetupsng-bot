/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import express from 'express';

const router = express.Router({mergeParams: true});

async function preferencesCallback({params: {userId}}, res) {

  res.render(
    './index',
    {
      demo: process.env.DEMO.toString() == 'true',
      isPreferences: true,
      title: 'My preferences',
      userId
    }
  );
}

// GET home page for the application
router.get('/', preferencesCallback);

export default router;
