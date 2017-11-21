/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Event Model
 *
 * @class Event
 */
export default class Event {
  /**
   * @property {Array.<string>} - Available event categories
   */
  static CATEGORIES = [
    'inspired',
    'connected',
    'discouraged',
    'indifferent'
  ];

  /**
   * Create a Event
   *
   * @param {string} id - Unique idenitifier of this event.
   * @param {string} title - Human readable event name.
   * @param {object} organizer - Path to images.
   * @param {object} venue - Full size image.
   * @param {object} time - Square cropped image.
   * @param {string} description - Description of the event.
   * @param {string} featured_image - Category of this event (`Event.CATEGORIES`).
   */
  constructor(id, title, description, organizer, venue, time, featured_image, link) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.organizer = organizer;
    this.venue = venue;
    this.time = time;
    this.featured_image = featured_image;
    this.link = link;
  }
}
