import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';

class GreetingsProcessor extends BaseProcessor {
  /**
   * @param recipientId : string
   * @param nlpEntity
   * @return {Promise.<*>}
   */
  static async process(recipientId, nlpEntity) {
    let user = await UserStore.show(recipientId);
    if(this.isGoodByeGreeting(nlpEntity.value)) {
      return this.send(recipientId, "Thanks for saying hi. Talk to you soon!");
    }
    await this.send(recipientId, "Hello! I'm Sarah, a tech events guide. I could show you tech events around you");
    this.delegateToOnboarding(recipientId, user)
  }

  /**
   * @param text : string
   * @return {boolean}
   */
  static isGoodByeGreeting(text) {
    return text.indexOf('bye') != -1 ||
            text.indexOf('thanks') != -1 ||
            text.indexOf('thank you') != -1
  }
}

export default GreetingsProcessor;