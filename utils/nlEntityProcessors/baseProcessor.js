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
}

export default BaseEntityProcessor;