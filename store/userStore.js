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

  static async requestAndSaveUserDetails(psId) {
    try {
      const userDetails = await this.requestUserDetails(psId);
      if (!userDetails.first_name) return;
      delete userDetails.id;
      const updateResponse = await this.saveUserDetails(psId, userDetails);
      return updateResponse;
    }
    catch(e) {
      console.log("[UserStore.requestAndSaveUserDetails]: Error: ", e)
    }
  }

  static async requestUserDetails(psId) {
    let requestedDetails = "first_name,last_name,profile_pic,gender";
    let url = "https://graph.facebook.com";
    let payload = {fields: requestedDetails, access_token: process.env.PAGE_ACCESS_TOKEN};
    const userDetails = await callWebAPI(`/v2.6/${psId}`, 'GET', payload, url);
    return userDetails;
  }

  static async saveUserDetails(psId, userDetails) {
    const updateResponse = await callWebAPI(`/users/${psId}/people/1`, 'PATCH', {
      ...userDetails,
      avatar_url: userDetails.profile_pic
    });
    return updateResponse;
  }

  static userFirstName(user) {
    return user && user.first_name ? ` ${user.first_name}` : '';
  }
}

export default UserStore;