import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';
import messages from '../../messenger-api-helpers/messages'

class HelpProcessor extends BaseProcessor {
  /**
   * @param recipientId : string
   * @param nlpEntity
   * @return {Promise.<*>}
   */
  static async process(recipientId, nlpEntity) {
    // let user = await UserStore.show(recipientId);
    await this.sendPayload(recipientId,
      [
        {text: "I was wondering when you'll ask 😀"},
        {text: "I'm Sarah. I help you discover tech events you might be interested in."},
        {text: "If you are an organizer, I help smoothen the check-in process by letting guests scan a barcode to get in. More efficient than papers ✌🏼."},
        {text: "I also help you send feedback on events you attend or collect feedback on events you organize."},
        {text: "Type 'menu' at anytime to pull up the main menu"},
        messages.messageWithButtons(
          "Now how can I help you?",
          [messages.viewEventsButton, messages.createEventButton(recipientId), messages.setPreferencesButton(recipientId)]
        )
      ]
    );
    // this.delegateToOnboarding(recipientId, user)
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

export default HelpProcessor;