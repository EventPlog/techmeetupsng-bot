/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

/* ----------  External Libraries  ---------- */

import React from 'react';
import 'whatwg-fetch';
import {
  Button,
  ButtonArea,
  Panel,
  PanelHeader,
  PanelBody,
  PanelFooter,
  MediaBox,
  MediaBoxHeader,
  MediaBoxBody,
  MediaBoxTitle,
  MediaBoxDescription,
  MediaBoxInfo,
  MediaBoxInfoMeta,
  Toast,
} from 'react-weui';

/* ----------  Internal Imports  ---------- */

import Loading from './loading';
import WebviewControls from '../messenger-api-helpers/webview-controls';
import purchase from './purchase';
import logger from './fba-logging';
import processRequest from '../messenger-api-helpers/webAPI';

const giveFeedback = (eventId, userId) => {
  logger.fbLog('payment_step', {step: "start_purchase", event_id: eventId}, userId);
  console.log('Checking in user: ', userId)
  purchase.buyItem(eventId, userId);
  WebviewControls.close();
};

/*
 * A component for displag tyinhe Product details for a given product
 */
class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAttending: false,
      checkedInAt: false,
      showLoading: false,
      showToast: false
    };
    this.attendEvent = this.attendEvent.bind(this);
    this.checkIn = this.checkIn.bind(this);
  }

  componentWillMount() {
    this.setEventState(this.props);
    logger.fbLog('view_event_page', {event_id: this.props.id, title: this.props.title}, this.props.userId);
  }

  setEventState = (event) => {
    const {is_attending: isAttending, checked_in_at: checkedInAt} = event;
    this.setState({isAttending, checkedInAt});
  }

  async attendEvent (userId, event) {
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

  async checkIn (userId, event) {
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

  showSuccessToast = () => {
    this.setState({showLoading: false, showToast: true});

    this.state.toastTimer = setTimeout(()=> {
      this.setState({showToast: false});
    }, 2000);
  }

  render () {

    if (!this.props) {
      return <Loading />;
    }

    const {id, title, featured_image, description, link, organizer, speakers, agenda, userId} = this.props;
    const { isAttending, checkedInAt, showLoading, showToast } = this.state;
    let attendBtnText = isAttending ? 'Attending' : 'Attend Event';
    let checkedInBtnText = checkedInAt ? 'Checked In' : 'Check In';
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
            <div className="product-body desc">
              {description}
            </div>
            <Panel className="panel">
              <PanelHeader>
                Agenda
              </PanelHeader>
              <PanelBody>
                {
                  agenda.map(item =>
                    <MediaBox type="text">
                      <MediaBoxTitle>{item.duration}</MediaBoxTitle>
                      <MediaBoxDescription>
                        {item.description}
                      </MediaBoxDescription>
                      <MediaBoxInfo>
                        <span className="agenda-speaker-prefix">By</span>
                        {
                          item.speakers.map(speaker =>
                              <MediaBoxInfoMeta extra>{speaker.full_name}</MediaBoxInfoMeta>
                          )
                        }
                      </MediaBoxInfo>
                    </MediaBox>
                  )
                }
              </PanelBody>
            </Panel>


            <Panel className="panel">
              <PanelHeader>
                Speakers/Guests
              </PanelHeader>
              <PanelBody>
                {
                  speakers.map(speaker =>
                    <MediaBox type="appmsg" href="javascript:void(0);">
                      <MediaBoxHeader><img src={speaker.avatar_url} /></MediaBoxHeader>
                      <MediaBoxBody>
                        <MediaBoxTitle>{speaker.full_name}</MediaBoxTitle>
                        <MediaBoxDescription>
                          {speaker.bio}
                        </MediaBoxDescription>
                      </MediaBoxBody>
                    </MediaBox>
                  )
                }
              </PanelBody>
            </Panel>
          </div>
        </div>

        <Toast icon="success-no-circle" show={this.state.showToast}>Done</Toast>
        <Toast icon="loading" show={this.state.showLoading}>Sending request...</Toast>

        <ButtonArea className='see-options' direction='horizontal'>
          {!isAttending && <Button onClick={() => this.attendEvent(userId, event)}
                  disabled={isAttending}
                  className={isAttending ? 'attending' : ''}>
            {attendBtnText}
          </Button>}
          {isAttending && <Button onClick={() => this.checkIn(userId, event)}
                  disabled={checkedInAt}
                  className={checkedInAt ? 'checked-in' : 'check-in'}>
            Check In
          </Button>}
        </ButtonArea>
      </div>
    );
  }
}

export default Event;
