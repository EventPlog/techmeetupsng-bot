import sendApi from '../messenger-api-helpers/send';
import BaseProcessor from '../utils/nlEntityProcessors/baseProcessor';

class OnboardingController {
  static index(recipientId, user) {
    if(!user) return;
    if(user.locations && user.locations.length < 1) {
      this.requestUserLocation(recipientId)
    }
    else if (user.email.indexOf('tmntest') != -1) {
      this.requestUserEmail(recipientId);
    }
    else if (user.interests && user.interests.length < 1) {
      this.requestUserInterests(recipientId);
    }
  }

  static requestUserLocation(recipientId) {
    let message = 'To help me share events close to you, could you send me your "state, country" separated by a comma.\nEg. Lagos, Nigeria.\nThanks';
    sendApi.sendTextMessage(recipientId, message)
  }

  static requestUserEmail(recipientId) {
    let message = "I'll need to remember your preferences. What email address should I save them with?";
    sendApi.sendTextMessage(recipientId, message)
  }

  static requestUserInterests(recipientId) {
    console.log("[OnboardingController.requestUserInterests] for user %s", recipientId);
    let message = [
      "What kind of events are you interested in?",
      'E.g. "My interests are Python, ReactJS, Blogging, Digital Marketing"',
      "Please add 'my interests are' followed by the comma-separated list of interests Thanks :)"
    ];
    BaseProcessor.sendMultipleTexts(recipientId, message)
  }
}

export default OnboardingController;
