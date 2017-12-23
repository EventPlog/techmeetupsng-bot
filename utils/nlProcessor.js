import sendApi from '../messenger-api-helpers/send';
import LocationProcessor from './nlEntityProcessors/locationProcessor';
import EventProcessor from './nlEntityProcessors/eventProcessor';
import EmailProcessor from './nlEntityProcessors/emailProcessor';
import GreetingsProcessor from './nlEntityProcessors/greetingsProcessor';
import GoodbyeProcessor from './nlEntityProcessors/goodbyeProcessor';
import DateTimeProcessor from './nlEntityProcessors/dateTimeProcessor';
import InterestsProcessor from './nlEntityProcessors/interestsProcessor';

const CASES = [
  'email',
  'bye',
  'greetings',
  'event',
  'location',
  'datetime',
  'interests'
];

class NLProcessor {
  static nlpCheck (recipientId, message) {
    try {
      const {nlp: {entities}} = message;
      const nlp_entities = Object.keys(entities);

      let caseIndex;
      if (nlp_entities.length > 0) {
        return CASES.some(nlp_case => {
          caseIndex = nlp_entities.indexOf(nlp_case);
          if (caseIndex == -1 || !this.entityIsSure(entities[nlp_case][0])) return;
          this.checkEntity(recipientId, nlp_case, entities[nlp_case][0], message)
          return true;
        })
      }
      return this.defaultMessage(recipientId, message)
    }
    catch(e)  {
      this.defaultMessage(recipientId, message)
    }
  }

  static entityIsSure(entity) {
    return entity.confidence > 0.8
  }

  static async checkEntity(recipientId, entity_name, nlpEntity, message) {
    if (!this.entityIsSure(nlpEntity)) {
      return this.defaultMessage(recipientId, message)
    }

    let user, success;
    switch (entity_name) {
      case 'event':
        return EventProcessor.process(recipientId, message);

      case 'email':
        return EmailProcessor.process(recipientId, nlpEntity);

      case 'location':
        return LocationProcessor.process(recipientId, nlpEntity);

      case 'datetime':
        return DateTimeProcessor.process(recipientId, nlpEntity);

      case 'bye':
        return GoodbyeProcessor.process(recipientId, nlpEntity);

      case 'greetings':
        return GreetingsProcessor.process(recipientId, nlpEntity);

      case 'interests':
        return InterestsProcessor.process(recipientId, nlpEntity);

      default:
        return this.send(recipientId, "Okay, I don't quite understand. Give me a few minutes? My colleague will be with you shortly");
    }
  }

  static async defaultMessage(recipientId, message) {
    if (message.text) {
      if (message.text.toLowerCase() == 'show events' || message.text.toLowerCase() == 'events') {
        return await sendApi.sendChooseEventMessage(recipientId);
      }
      // sendApi.sendTextMessage(recipientId);
    }
  }

  static send(recipientId, message) {
    sendApi.sendTextMessage(recipientId, message);
  }

}

export default NLProcessor;