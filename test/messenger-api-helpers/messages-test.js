import messages from '../../messenger-api-helpers/messages';

import {describe} from 'mocha';
import {expect} from 'chai';

describe('messages', () => {
  describe('.barCodeWelcomeMessage()', () => {
    it ('returns a personalized text directing the user on check in', () => {
      let event = {
        title: 'A great event',
        user: {first_name: 'John'}
      }

      let expectedRes = {
        text: `Hey ${event.user.first_name}, I just checked you into ${event.title}. ` +
        `\n\nPulling up the event so you can give feedback towards the end. Thanks!`
      }
      expect(messages.barCodeWelcomeMessage(event).text).to.equal(expectedRes.text);

    })
  })
})