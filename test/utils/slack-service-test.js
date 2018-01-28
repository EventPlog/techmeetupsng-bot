import {describe} from 'mocha';
import {expect} from 'chai';
import simple from 'simple-mock';
import callWebApi from '../../messenger-api-helpers/webAPI';

import SlackService from '../../utils/slackService';

describe('SlackService', () => {
  let event = {
    id: 1,
    title: 'The event',
    description: 'This is the event submitted'
  }
  let spyFn = simple.spy(() => {})

  beforeEach(() => {
    simple.mock(process, 'env', {TMN_ADMIN_URL: 'tmn-admin-url'})
    spyFn = simple.mock(callWebApi)
  })

  afterEach(() => {
    simple.restore()
  })

  describe('#send', () => {
    it('sends a notification to slack for an event submitted', () => {
      SlackService.send(event)
      // expect(spyFn.callCount).to.equal(1)
    })
  })

  describe('#format', () => {

    let expectedOutput = {
      fallback: 'A new event has been submitted: <tmn-admin-url/event_submission/1|The event>',
      pretext: 'A new event has been submitted: <tmn-admin-url/event_submission/1|The event>',
      color: 'good',
      fields: [ {
        title: event.title,
        value: event.description,
        short: false
      } ]
    }

    it('returns a formated payload to send to slack', () => {
      expect(SlackService.format(event).attachments[0].fallback).to.equal(expectedOutput.fallback)
      expect(SlackService.format(event).attachments[0].pretext).to.equal(expectedOutput.pretext)
      expect(SlackService.format(event).attachments[0].color).to.equal(expectedOutput.color)
    })
  })
})