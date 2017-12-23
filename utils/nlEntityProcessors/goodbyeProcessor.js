import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';

class GoodbyeProcessor extends BaseProcessor {
  /**
   * @param recipientId : string
   * @param nlpEntity
   * @return {Promise.<*>}
   */
  static async process(recipientId, nlpEntity) {
    let user = await UserStore.show(recipientId);
    await this.send(recipientId, "Thanks for saying hi. Talk to you soon!");
    this.delegateToOnboarding(recipientId, user)
  }
}

export default GoodbyeProcessor;