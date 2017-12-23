import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';

class InterestsProcessor extends BaseProcessor {
  /**
   * @param recipientId
   * @param email
   * @return {Promise.<void>}
   */
  static async process(recipientId, {value: strOfInterests}) {
    let interests = strOfInterests.split(',').map(interest => interest.replace('and', '').trim().toLowerCase());
    let user = await UserStore.update(recipientId, {interests});
    await this.send(recipientId, `I've noted your preference for these interests: ${strOfInterests}.`);

    this.delegateToOnboarding(recipientId, user)
  }
}

export default InterestsProcessor;