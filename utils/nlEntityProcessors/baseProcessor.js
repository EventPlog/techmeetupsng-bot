import onboardingController from '../../controllers/onboardingController';
import sendApi from '../../messenger-api-helpers/send';

class BaseEntityProcessor {
  /**
   * @param recipientId : string
   * @param message : string
   */
  static send(recipientId, message) {
    sendApi.sendTextMessage(recipientId, message);
  }

  /**
   * @param recipientId : string
   * @param user : Object
   * @param delay : int
   */
  static delegateToOnboarding(recipientId, user, delay = 5000) {
    setTimeout((recipientId, user) =>
                  onboardingController.index(recipientId, user),
                delay, recipientId, user);
  }

  /**
   * @param recipientId : string
   * @param textsArray : Array
   */
  static sendMultipleTexts(recipientId, textsArray){
    return sendApi.sendMessage(recipientId, textsArray.map(text => ({text})))
  }

  /**
   * @param recipientId : string
   * @param text : Array
   */
  static sendTextWithButton(recipientId, text, buttons){
    return sendApi.sendTextWithButton(recipientId, text, buttons);
  }

  /**
   * @param recipientId : string
   * @param text : Array
   */
  static sendPayload(recipientId, payload) {
    return sendApi.sendMessage(recipientId, payload);
  }
}

export default BaseEntityProcessor;