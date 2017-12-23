import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';

class DateTimeProcessor extends BaseProcessor {

  /**
   * @param recipientId
   * @param nlpEntity
   * @return {Promise.<*>}
   */
  static async process(recipientId, nlpEntity) {
    if (nlpEntity.grain == 'day') {
      return this.send(recipientId, `Aha, this is the event date you want: ${(new Date(nlpEntity.value)).toDateString()}. We will handle accordingly`);
    }
    else if (nlpEntity.grain == 'month') {
      return this.send(recipientId, `Aha, this is the month you want: ${(new Date(nlpEntity.value)).toDateString()}. We will handle accordingly`);
    }
    else if (nlpEntity.grain == 'year') {
      return this.send(recipientId, `Aha, this is the year you want: ${(new Date(nlpEntity.value)).toDateString()}. We will handle accordingly`);
    }
    return this.send(recipientId, `This is a range. I'm not yet built to handle this.`);
  }
}

export default DateTimeProcessor;