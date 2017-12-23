import BaseProcessor from './baseProcessor';
import UserStore from '../../store/userStore';

class LocationNLProcessor extends BaseProcessor {
  /**
   * @param recipientId
   * @param nlpEntity
   * @return {Promise.<*>}
   */
  static async process(recipientId, nlpEntity) {
    let [state, country] = this.retrieveLocationAttributes(nlpEntity.value);

    if (!state || !country) {
      return this.send(recipientId, "Hey, was that a location? If it was, could you re-send in format 'state, country' again. Thanks? ")
    }

    let user = await UserStore.updateLocation(recipientId, {state, country});
    let messagesToSend = [this.updatedEventMsg(state), this.updatedCountrymsg(country)];
    await this.sendMultipleTexts(recipientId, messagesToSend);

    this.delegateToOnboarding(recipientId, user);
  }

  /**
   * @param rawValue : string
   * @return {[*,*]}
   */
  static retrieveLocationAttributes(rawValue) {
    let [state, country] = rawValue.split(',');
    state = state.trim().toLowerCase();
    country = (country || '').trim().toLowerCase();
    return [state, country];
  }

  /**
   * @param state
   * @return {string}
   */
  static updatedEventMsg (state) {
    return `Subsequently I'll prioritize events in ${state} when I show you a list of events.`
  }

  /**
   * @param country : string
   * @return {string}
   */
  static updatedCountrymsg (country) {
    return country == 'nigeria' ?
      "Hey, I'm Nigerian too :)" :
      `I hear ${country} is a great Country :)`;
  }
}

export default LocationNLProcessor;