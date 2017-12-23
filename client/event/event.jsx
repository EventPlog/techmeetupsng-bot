import React from 'react';
import {
  Toast,
} from 'react-weui';

/* ----------  Internal Imports  ---------- */

import Loading from '../loading';
import WebviewControls from '../../messenger-api-helpers/webview-controls';
import purchase from '../purchase';
import logger from '../fba-logging';
import processRequest from '../../messenger-api-helpers/webAPI';
import CTAButtons from './ButtonArea';
import Speakers from './Speakers';
import Agenda from './Agenda';
import Feedback from '../feedback';

/*
 * A component to display info about an event
 */
class Event extends React.Component {

  state = {
    isAttending: false,
    checkedInAt: false,
    showLoading: false,
    feedbackResponse: {},
    showToast: false
  }

  componentWillMount() {
    this.setEventState(this.props);
  }

  componentDidMount() {
    logger.fbLog('view_event_page', {event_id: this.props.id, title: this.props.title}, this.props.userId);
  }

  setEventState = (event) => {
    const {
      is_attending: isAttending,
      checked_in_at: checkedInAt,
      feedback_response: feedbackResponse
    } = event;
    this.setState({isAttending, checkedInAt, feedbackResponse});
  }

  attendEvent = async(userId, event) => {
    logger.fbLog('attend_event_start', {event_id: event.id, title: event.title}, userId);
    this.setState({showLoading: true});
    try {
      let response = await processRequest(`/users/${userId}/events/${event.id}`, 'PUT', {}, true);
      if (response.id) {
        this.setEventState(response);
        this.showSuccessToast();
        logger.fbLog('attend_event_success', {event_id: response.id, title: response.title}, userId);
      }
    }
    catch(err) {
      console.error(`Unable to register event for user ${userId}. `, err);
      this.setState({showLoading: false});
    }
  };

  checkIn = async(userId, event) => {
    logger.fbLog('check_in_event_start', {event_id: event.id, title: event.title}, userId);
    this.setState({showLoading: true});
    try {
      let response = await processRequest(`/users/${userId}/events/${event.id}/check_in`, 'POST', {}, true);
      if (response.id) {
        this.setEventState(response);
        this.showSuccessToast();
        logger.fbLog('check_in_event_success', {event_id: response.id, title: response.title}, userId);
      }
    }
    catch(err) {
      console.error(`Unable to check into event event for user ${userId}. `, err);
      this.setState({showLoading: false});
    }
  };

  submitFeedback = async(feedback_response) => {
    const { userId, id: event_id, title } = this.props;
    logger.fbLog('submit_feedback_start', {event_id, title}, userId);
    this.setState({showLoading: true});
    try {
      let response = await processRequest(`/users/${userId}/events/${event_id}/feedback_response`, 'POST', {feedback_response}, true);
      if (response.id) {
        this.setState({feedbackResponse: response});
        this.showSuccessToast();
        logger.fbLog('submit_feedback_success', {event_id: response.id, title: response.title}, userId);
      }
    }
    catch(err) {
      console.error(`Unable to register event for user ${userId}. `, err);
      this.setState({showLoading: false});
    }
  };

  showSuccessToast = () => {
    this.setState({showLoading: false, showToast: true});

    this.state.toastTimer = setTimeout(()=> {
      this.setState({showToast: false});
    }, 2000);
  }

  render () {
    if (!this.props.id) {
      return <Loading />;
    }
    const successImagePath = `/media/ui/success-check-mark.svg`;
    const {id, title, featured_image, description,
            link, organizer, speakers, agenda, userId} = this.props;
    const { isAttending, checkedInAt, feedbackResponse, showLoading, showToast } = this.state;
    let isCheckedIn = !!(isAttending && checkedInAt);
    let shouldShowSpeakers = !isCheckedIn || (isCheckedIn && feedbackResponse.id);

    return (
      <div>
        <div id='product' className='static-page'>
          <div className='static-page-body'>
            <div className='product-body'>
              <img className='product-image' src={featured_image}/>
              <div className='product-details'>
                <h1>{title}</h1>
                <p className='static-page-subtitle'>
                  <a href={link}>By: {organizer.name}</a>
                </p>
              </div>
            </div>

            {(feedbackResponse && feedbackResponse.id) &&
              <div className="product-body desc feedback-given">
                <img src={successImagePath} />
                Thank you for sharing feedback!
              </div>}

            <div className="product-body desc">
              {description}
            </div>

            {(isCheckedIn && !feedbackResponse.id) &&
            <Feedback {...{userId, event: this.props}}
                submitFeedback={this.submitFeedback} />}

            {shouldShowSpeakers && [
              <Speakers {...{speakers}} />,
              <Agenda {...{agenda}} />
            ]}

          </div>
        </div>

        <Toast icon="success-no-circle" show={showToast}>Done</Toast>
        <Toast icon="loading" show={showLoading}>Processing ...</Toast>


        <CTAButtons {...{event, userId, isAttending, checkedInAt,
                              checkIn: this.checkIn,
                              attendEvent: this.attendEvent}} />
      </div>
    );
  }
}

export default Event;
