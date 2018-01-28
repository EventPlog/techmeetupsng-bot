import callWebApi from '../messenger-api-helpers/webAPI';

class SlackService {
  static send(event) {
    console.log('event in slack formatter: ', event)
    let slackUrl = process.env.SLACK_WEBHOOK_URL;
    callWebApi.processRequest('', 'POST', this.format(event), slackUrl)
  }

  static format({id, title, description}) {
    return {
      "attachments":[
      {
        "fallback":`A new event has been submitted: <${process.env.TMN_ADMIN_URL}/event_submission/${id}|${title}>`,
        "pretext":`A new event has been submitted: <${process.env.TMN_ADMIN_URL}/event_submission/${id}|${title}>`,
        "color":"good",
        "fields":[
          {
            "title":title,
            "value": description,
            "short":false
          }
        ]
      }
    ]
    }
  }
}

export default SlackService;