import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';
import messages from '../../messenger-api-helpers/messages'

class MenuProcessor extends BaseProcessor {
  /**
   * @param recipientId : string
   * @param nlpEntity
   * @return {Promise.<*>}
   */
  static async process(recipientId, nlpEntity) {
    // let user = await UserStore.show(recipientId);
    await this.sendPayload(recipientId,
      [
        {text: "You could type 'help' for more details on what I could do"},
        messages.messageWithButtons(
          "How can I help?",
          [messages.viewEventsButton, messages.createEventButton(recipientId), messages.setPreferencesButton(recipientId)]
        )
      ]
    );
    // this.delegateToOnboarding(recipientId, user)
  }
}

export default MenuProcessor;