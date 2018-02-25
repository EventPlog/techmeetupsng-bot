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
        {text: "I was wondering when you'll ask. 😀"},
        {text: "I'm Sarah. I help you discover tech events you might be interested in."},
        {text: "If you are an organizer, I help smoothen the check-in process by letting guests scan a messenger code to get in. More efficient than papers ✌🏼."},
        {text: "I also help you send feedback for events you attend or collect feedback for events you organize."},
        {text: "Send 'menu' to pull up the main menu."},
        {text: "Send 'events' so I can show you future tech events."},
        {text: "Send 'create event' at any point to have me send you a link to submit an event you're organizing so we help publicize."},
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