import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';
import EventStore from '../../store/eventsStore';
import sendApi from '../../messenger-api-helpers/send';
import { addDaysToDate, daysInMonth, daysInYear } from '../../utils/date-string-format';

class EventProcessor extends BaseProcessor {
  /**
   * @param recipientId
   * @param email
   * @return {Promise.<void>}
   */
  static async process(recipientId, message) {
    const {nlp: {entities}} = message;
    const nlp_entities = Object.keys(entities);
    let params = {};
    let nlp_entity;
    nlp_entities.forEach(entity => {
      nlp_entity = entities[entity][0];
      if (entity == 'event' || nlp_entity.confidence < 0.8) return;
      if (entity == 'datetime') {
        params[entity] = this.getDateTimeRange(nlp_entity)
        return;
      }
      params[entity] = nlp_entity.value;
    })
    let events = await sendApi.sendChooseEventMessage(recipientId, params);
    if (events && events.user) this.delegateToOnboarding(recipientId, events.user)
  }

  static getDateTimeRange(nlp_entity) {
    let start_date = new Date(nlp_entity.value);
    switch (nlp_entity.grain) {
      case 'day':
        return {
          start_date: start_date.toDateString(),
          end_date: start_date.toDateString()
        }

      case 'week':
        return this.getRangeObject(start_date, 7);

      case 'month':
        return this.getRangeObject(start_date, daysInMonth(start_date.getMonth() + 1, start_date.getFullYear()));

      case 'year':
        return this.getRangeObject(start_date, daysInYear(start_date.getFullYear()));

    }
  }

  static getRangeObject(start_date, daysToAdd) {
    return {
      start_date: start_date.toDateString(),
      end_date: addDaysToDate(start_date, daysToAdd).toDateString()
    }
  }
}

export default EventProcessor;