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
        {text: "Hey! I'm Sarah, a bot working at techmeetupsng as a virtual tech event assistant. 😇"},
        messages.messageWithButtons(
          "How can I help you?",
          [messages.viewEventsButton, messages.createEventButton(recipientId), messages.setPreferencesButton(recipientId)]
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