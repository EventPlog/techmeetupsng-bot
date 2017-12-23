/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODELS ================================================================
import Event from './event';

// ===== STORES ================================================================
import EventStore from '../stores/event-store';

/**
 * User Model
 *
 * @class User
 */
export default class User {
  /**
   * @property {Array.<string>} - Time since an item has become available
   */
  static ARRIVAL_PERIODS = [
    'thirtyDays',
    'sixtyDays',
    'soon',
  ];

  /**
   * @property {Array.<string>} - Skin types
   */
  static SKIN_TYPES = [
    'artificial intelligence',
    'angular',
    'content management',
    'data science',
    'digital marketing',
    'go',
    'javascript',
    'python',
    'php',
    'product management',
    'react',
    'ruby',
  ];

  /**
   * @property {Array.<string>} - Level of humidity in environment
   */
  static ENVIRONMENTS = [
    'dry',
    'normal',
    'humid',
  ];

  /**
   * @property {Array.<string>} - Skin types
   */
  static INTERESTS = [
    'content management',
    'digital marketing',
    'go',
    'javascript',
    'python',
    'php',
    'product management',
  ]
  /**
   * @property {Array.<string>} - Level of humidity in environment
   */
  static RATING = [
    'Not true',
    'Somewhat true',
    'Very true',
  ];

  /**
   * @property {Array.<string>} - Defaults attributes for users
   */
  static DEFAULT_ATTRIBUTES = {
    dateOfBirth: '2017-01-01',
    eventCategory: Event.CATEGORIES[0],
    arrivalPeriod: User.ARRIVAL_PERIODS[0],
    environment: User.ENVIRONMENTS[1],
    skinTypes: [],
  };

  /* eslint-disable max-len */
  /**
   * @constructor
   *
   * @param {object} attributes)
   * @param {string} attributes.id - Messenger Page Scoped User ID ('psid')
   * @param {string} attributes.dateOfBirth - Date of birth formatted YYYY-MM-DD
   * @param {string} attributes.environment - User's environment (from `User.ENVIRONMENTS`)
   * @param {string} attributes.skinTypes - User's skin type (from `User.SKIN_TYPES`)
   * @param {string} attributes.eventCategory -
   *   Preferred type of event (from `Event.CATEGORIES`)
   * @param {string} attributes.arrivalPeriod -
   *   How recently a event should have been released (from `User.ARRIVAL_PERIODS`)
   */
   /* eslint-enable max-len */
  constructor(attributes) {
    const {
      id,
      dateOfBirth,
      eventCategory,
      arrivalPeriod,
      environment,
      skinTypes,
    } = Object.assign({}, User.DEFAULT_ATTRIBUTES, attributes);

    this.id = id;
    this.dateOfBirth = dateOfBirth;
    this.eventCategory = eventCategory;
    this.arrivalPeriod = arrivalPeriod;
    this.environment = environment;
    this.skinTypes = skinTypes;
    this.preferredEvent = EventStore.getByCategoryId(eventCategory)[0];
  }

  /**
   * Get all events matching the users eventCategory
   *
   * @returns {Object[]} All events matching the users eventCategory
   */
  getRecommendedEvents() {
    return EventStore.getByCategoryId(this.eventCategory);
  }

  /**
   * Set the users preferredEvent to the event matching the id
   *
   * @param {String} eventId Id of the event to set as the users preferred event.
   * @returns {undefined}
   * @memberOf User
   */
  setPreferredEvent(eventId) {
    this.preferredEvent = EventStore.get(eventId);
  }
}
