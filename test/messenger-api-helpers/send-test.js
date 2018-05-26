import send from '../../messenger-api-helpers/send';

import {describe} from 'mocha';
import {expect} from 'chai'
import sinon from 'sinon';
import sinonTestFactory from 'sinon-test'

let sinonTest = sinonTestFactory(sinon);

describe('.sendEventReport', () => {
  it('sends the event report to the user', sinonTest(function() {
    let recipientId = '12345';
    let reportJSON = {
      checked_in: [],
      feedback_responses: [],
      percentage_feedback: 50,
      percentage_avg_satisfaction: 30,
      nps: 50,
      percentage_swags: 50
    };

    // let sendMessageSpy = this.stub(send, 'sendMessage');
    let mock = sinon.spy(send, 'sendMessage');
    send.sendEventReport(recipientId, reportJSON);
    // expect(sendMessageSpy.called).to.equal(true);
    console.log(send.sendMessage);
    expect(mock.called).to.equal(true);
    mock.restore();
  }));
});

