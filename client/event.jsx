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
} from 'react-weui';

/* ----------  Internal Imports  ---------- */

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
      checkedInAt: false
    };
    this.attendEvent = this.attendEvent.bind(this);
    this.checkIn = this.checkIn.bind(this);
  }

  componentWillMount() {
    this.setEventState(this.props);
  }

  setEventState = (event) => {
    const {is_attending: isAttending, checked_in_at: checkedInAt} = event;
    this.setState({isAttending, checkedInAt});
  }

  async attendEvent (userId, event) {
    // logger.fbLog('select_event_start', {event_id: eventId}, userId);
    try {
      let response = await processRequest(`/users/${userId}/events/${event.id}`, 'PUT', {}, true);
      if (response.id) this.setEventState(response);
    }
    catch(err) {
      console.error(`Unable to register event for user ${userId}. `, err);
    }
    WebviewControls.close();
  };

  async checkIn (userId, event) {
    try {
      let response = await processRequest(`/users/${userId}/events/${event.id}/check_in`, 'POST', {}, true);
      if (response.id) this.setEventState(response);
    }
    catch(err) {
      console.error(`Unable to check into event event for user ${userId}. `, err);
    }
    WebviewControls.close();
  };

  render () {

    if (!this.state.props) {
      return <Loading />;
    }

    const {id, title, featured_image, description, link, organizer, speakers, agenda, userId} = this.props;
    const { isAttending, checkedInAt } = this.state;
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

        <ButtonArea className='see-options' direction='horizontal'>
          <Button onClick={() => this.attendEvent(userId, event)}
                  disabled={isAttending}
                  className={isAttending ? 'attending' : ''}>
            {attendBtnText}
          </Button>
          <Button onClick={() => this.checkIn(userId, event)}
                  disabled={checkedInAt}
                  className={checkedInAt ? 'checked-in' : ''}>
            Check In
          </Button>
        </ButtonArea>
      </div>
    );
  }
}

export default Event;
