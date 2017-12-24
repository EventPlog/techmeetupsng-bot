import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';

class EmailProcessor extends BaseProcessor {
  /**
   * @param recipientId
   * @param email
   * @return {Promise.<void>}
   */
  static async process(recipientId, {value: email}) {
    let user = await UserStore.update(recipientId, {email});
    await this.send(recipientId, `I've updated your account with email: ${email}.`);

    this.delegateToOnboarding(recipientId, user)
  }
}

export default EmailProcessor;