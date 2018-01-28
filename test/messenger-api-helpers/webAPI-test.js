import {describe} from 'mocha';
import {expect} from 'chai';
import simple from 'simple-mock';

import {
  getUrl
} from '../../messenger-api-helpers/webAPI';

describe('#getUrl', () => {
  beforeEach(() => {
    simple.mock(process, 'env', {TMN_API: 'tmn-api'})
  })

  afterEach(() => {
    simple.restore()
  })

  it('returns the right url', () => {
    expect(getUrl()).to.equal('tmn-api');
    expect(getUrl(true)).to.equal('');
    expect(getUrl('something.com')).to.equal('something.com');
  })
});

