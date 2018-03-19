import messages from '../../messenger-api-helpers/messages';

import {describe} from 'mocha';
import {expect} from 'chai';
import sinon from 'sinon';
import sinonTestFactory from 'sinon-test';

let sinonTest = sinonTestFactory(sinon);


describe('messages', () => {
  describe('.barCodeWelcomeMessage()', () => {
    it ('returns a personalized text directing the user on check in', () => {
      let event = {
        title: 'A great event',
        user: {first_name: 'John'}
      };

      let expectedRes = {
        text: `Hey ${event.user.first_name}, I just checked you into ${event.title}. ` +
        `\n\nI'm pulling up the event so you can give feedback towards the end or share with a friend. Thanks!`
      };

      expect(messages.barCodeWelcomeMessage(event).text).to.equal(expectedRes.text);

    })
  })

  describe('eventToCarouselItem', () => {
    it('returns an object that matches the expected payload for a carousel item', sinonTest(function() {
      let event = {
        id: 1,
        title: 'A great event',
        featured_image: 'http://sample.com',
        user: {first_name: 'John'}
      };
      let detailsBtnSpy = this.stub(messages, 'viewDetailsButton').returns({})
      let shareEventsBtnSpy = this.stub(messages, 'shareEventsButton').returns({})

      let carousel = messages.eventToCarouselItem(event, event.user);
      expect(carousel.title).to.equal(event.title);
      expect(carousel.image_url).to.equal(event.featured_image);
    }))
  })
})