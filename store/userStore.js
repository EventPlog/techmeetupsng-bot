import callWebAPI from '../messenger-api-helpers/webAPI';

class UserStore {
  static async index() {
    const users = await(callWebAPI(`/users`));
    return user;
  }

  static async show(userId) {
    let user = await(callWebAPI(`/users/${userId}`));
    return user;
  }

  static async update(userId, params) {
    const updatedUser = await callWebAPI(`/users/${userId}/`, 'PATCH', params)
    return updatedUser;
  }

  static async updateInterest(userId, params) {
    const updatedUser = await callWebAPI(`/users/${userId}/user_interests`, 'POST', params)
    return updatedUser;
  }

  static async updateLocation(userId, params) {
    const updatedUser = await callWebAPI(`/users/${userId}/locations`, 'POST', {location: params})
    return updatedUser;
  }
}

export default UserStore;