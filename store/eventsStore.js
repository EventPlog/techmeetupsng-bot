import callWebAPI from '../messenger-api-helpers/webAPI';

class EventStore {
  static async index(recipientId, params={}) {
    try {
      const events = await(callWebAPI(`/users/${recipientId}/index_by_params`, 'POST', params));
      return events;
    }
    catch (e) {
      return [];
    }
  }

  static async show(recipientId, eventId) {
    console.log("[EventStore.showw] recipient id: %s, event id: %s", recipientId, eventId);
    let event = await(callWebAPI(`/users/${recipientId}/events/${eventId}`));
    return event;
  }

  static async update(params) {
    const updatedEvent = await callWebAPI('/events', 'PATCH', {location: params})
    return updatedEvent;
  }

  static async userEvents(recipientId, params={}) {
    try {
      const events = await(callWebAPI(`/users/${recipientId}/user_events`, 'GET'));
      return events;
    }
    catch (e) {
      return [];
    }
  }
}

export default EventStore;