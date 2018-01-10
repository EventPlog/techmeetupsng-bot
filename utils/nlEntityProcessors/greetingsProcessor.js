import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';
import messages from '../../messenger-api-helpers/messages'

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
    await this.sendPayload(recipientId,
      [
        {text: "Hello! I'm Sarah, a bot working at techmeetupsng"},
        messages.messageWithButtons(
          "I could show you tech events around you",
          [messages.viewEventsButton, messages.setPreferencesButton(recipientId)]
        )
      ]
    );
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