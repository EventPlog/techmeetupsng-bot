import UserStore from '../../store/userStore';


import {describe} from 'mocha';
import {expect} from 'chai';

describe('UserStore', () => {
  describe('.userFirstName()', () => {
    it('returns the  user first name if it exists in the user model', () => {
      const user = {first_name: 'Charles'};
      expect(UserStore.userFirstName(user)).to.equal(user.first_name)
    })
  });
});

