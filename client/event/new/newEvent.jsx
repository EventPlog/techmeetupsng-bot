/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

/* =============================================
   =                   Setup                   =
   ============================================= */

/* ----------  External Libraries  ---------- */

import React from 'react';
import 'whatwg-fetch';
import PropTypes from 'proptypes';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import InterestsSection from './interests';

/* ----------  External UI Kit  ---------- */

import {
  Badge,
  Button,
  ButtonArea,
  CellBody,
  CellFooter,
  CellHeader,
  CellsTitle,
  Form,
  FormCell,
  Grids,
  Input,
  Label,
  Slider,
  Switch,
  TextArea,
  Toast
} from 'react-weui';

/* ----------  Internal Components  ---------- */

import Loading from '../../loading.jsx';
import logger from '../../fba-logging';
import SuccessMessage from '../../common/successMsg';
import processRequest from '../../../messenger-api-helpers/webAPI';

// import iconSrc from './media/ui/unchecked.png';

/* ----------  Helpers  ---------- */

import {dateString} from '../../../utils/date-string-format';

/* ----------  Models  ---------- */


/* =============================================
   =            React Application              =
   ============================================= */

const toTitleCase = (str) => {
  return str[0].toUpperCase() + str.substr(1)
}

export default class App extends React.PureComponent {

  /* =============================================
     =               Configuration               =
     ============================================= */

  /* ----------  Top-level App Constants  ---------- */

  static dateConfig = {
    month: 'long',
    day: 'numeric',
  }


  /* ----------  React Configuration  ---------- */

  static propTypes = {
    userId: PropTypes.string.isRequired,
  }

  state = {
    id: null,
    interests: null,
    showLoading: false,
    showToast: false,
    title: null,
    organizer: null,
    featured_image: null,
    link: null,
    description: null,
    venue: null,
    start_time: null,
    end_time: null,
    country: "Nigeria",
    region: "Lagos",
  }


  /* =============================================
     =               Helper Methods              =
     ============================================= */

  /* ----------  Communicate with Server  ---------- */

  /**
   * Pull saved data from the server, and populate the form
   * If there's an error, we log it to the console. Errors will not be availble
   * within the Messenger webview. If you need to see them 'live', switch to
   * an `alert()`.
   *
   * @returns {undefined}
   */
  showSuccessToast = () => {
    this.setState({showLoading: false, showToast: true});

    this.state.toastTimer = setTimeout(()=> {
      this.setState({showToast: false});
    }, 2000);
  }

  preparePayload = () => {
    const {email, region, country, interests} = this.state;
    // let interests_ids = this.getInterestsIds(interests);
    // return {email, region, country, interests_ids}
    return this.state;
  }

  getPreferences = async(userId) => {
    this.setState({showLoading: true});
    try {
      let response = await processRequest(`/users/${userId}/preferences`, 'GET', {});
      if (response) {
        if (response.user_id) {
          logger.fbLog('show_preferences_success', {email: this.state.email}, userId);
          const {email, region, country, interests} = response;
          return this.setState({
            email: showNonTestEmails(email),
            region: toTitleCase(region || this.state.region),
            country: toTitleCase(country || this.state.country),
            interests,
            showLoading: false
          })
        }
        throw 'A server error occured.';
      }
    }
    catch(err) {
      console.error(`Unable to retrieve preferences for user id: ${userId}`, err);
      this.setState({showLoading: false});
    }
  };

  submitEvent = async(userId) => {
    logger.fbLog('save_preferences_start', {email: this.state.email}, userId);
    this.setState({showLoading: true});
    try {
      let response = await processRequest(`/users/${userId}/events/submit_for_review`, 'POST', {event_submission: this.state}, true);
      if (response) {
        if (response.id) {
          this.showSuccessToast();
          this.setState({id: response.id});
          logger.fbLog('save_preferences_success', {event_id: response.id, title: response.title}, userId);
          return
        }
        throw 'An error occured'
      }
    }
    catch(err) {
      console.error(`Unable to register event for user ${userId}. `, err);
      this.setState({showLoading: false});
    }
  };

  /* ----------  Formatters  ---------- */

  initState() {
    this.setState({interests})
  }

  update = (property, val) => {
    this.setState({ [property]: val });
  }

  showSuccessMessage = () => {
    let title = "Thanks for submitting 🙂";
    let description = "Your event is under review. Just a period where we help format so it looks good when your target audience preview it. " +
            "\n\nWe'll let you know once it has been posted or if we have any other questions." +
            "\n\nYou can close this window by clicking the 'X' button by the right of the title bar.";
    return <SuccessMessage {...{title, description}} />
  }

  /* =============================================
     =              React Lifecycle              =
     ============================================= */

  componentWillMount() {
    // this.getPreferences(this.props.userId); // Initial data fetch
    // this.initState();
  }

  disableSubmit = () => {
    const {title, link, description, venue, start_time, end_time, interests} = this.state;
    return !(title && link && description && venue && start_time && end_time && interests);
  }

  render() {
    /**
     * If waiting for data, just show the loading spinner
     * and skip the rest of this function
     */
    if (this.state.id) {
      return this.showSuccessMessage();
    }

    /* ----------  Setup Sections (anything dynamic or repeated) ---------- */


    const {persist, country, region, showToast, showLoading} = this.state;
    const {userId} = this.props;

    const persistSwitch = (
      <Switch
        defaultChecked={persist}
        onClick={() => this.setPersist(!persist)}
      />
    );

    /* ----------  Main Structure  ---------- */

    return (
      <div className='app'>
        <section>
          <CellsTitle>Title</CellsTitle>
          <Form>
            <FormCell id='title'>
              <CellBody>
                <Input
                  type="text"
                  value={this.state.title}
                  placeholder="As concise as possible"
                  onChange={(e) => this.update('title', e.target.value)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>


        <section>
          <CellsTitle>Affiliate organization (only one is allowed)</CellsTitle>
          <Form>
            <FormCell id='organizer'>
              <CellBody>
                <Input
                  type="text"
                  value={this.state.organizer}
                  placeholder="Developer Circles Lagos, Google Developer Group?"
                  onChange={(e) => this.update('organizer', e.target.value)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Link to featured image</CellsTitle>
          <Form>
            <FormCell id='featured_image'>
              <CellBody>
                <Input
                  type="text"
                  value={this.state.featured_image}
                  defaultValue="http://"
                  placeholder="A link to the image online"
                  onChange={(e) => this.update('featured_image', e.target.value)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Link to RSVP</CellsTitle>
          <Form>
            <FormCell id='link'>
              <CellBody>
                <Input
                  type="text"
                  value={this.state.link}
                  defaultValue="http://"
                  placeholder="http://"
                  onChange={(e) => this.update('link', e.target.value)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Description</CellsTitle>
          <Form>
            <FormCell>
              <CellBody>
                <TextArea placeholder="Please stick to one paragraph long."
                          rows="3"
                          onChange={(e) => this.update('description', e.target.value)}
                          maxLength={200}>
                </TextArea>
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Venue</CellsTitle>
          <Form>
            <FormCell id='venue'>
              <CellBody>
                <Input
                  type="text"
                  value={this.state.venue}
                  placeholder="Add a landmark if possible"
                  onChange={(e) => this.update('venue', e.target.value)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Timing</CellsTitle>
          <Form>
            <FormCell>
              <CellHeader>
                <Label>Starts at:</Label>
              </CellHeader>
              <CellBody>
                <Input type="datetime-local"
                       value={this.state.start_time}
                       onChange={(e) => {
                         this.update('start_time', e.target.value)
                         this.update('end_time', e.target.value)
                       }}
                       defaultValue="" placeholder=""/>
              </CellBody>
            </FormCell>
            <FormCell>
              <CellHeader>
                <Label>Ends at:</Label>
              </CellHeader>
              <CellBody>
                <Input type="datetime-local"
                       id="end_time"
                       value={this.state.end_time}
                       onChange={(e) => this.update('end_time', e.target.value)}
                       defaultValue="" placeholder=""/>
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>This event is located in</CellsTitle>
          <Form>
            <FormCell select id='country'>
              <CellHeader>
                <Label>Country</Label>
              </CellHeader>
              <CellBody>
                <CountryDropdown
                  value={country}
                  onChange={(val) => this.update('country', val)} />
              </CellBody>
            </FormCell>

            <FormCell select id='region'>
              <CellHeader>
                <Label>Region</Label>
              </CellHeader>
              <CellBody>
                <RegionDropdown
                  country={country}
                  value={region}
                  onChange={(val) => this.update('region', val)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Your target audience are people interested in ...</CellsTitle>
          <Form>
            <FormCell id='interests'>
              <CellBody>
                <Input placeholder="Ruby, Backend, Software Architecture"
                       value={this.state.interests}
                       onChange={(e) => this.update('interests', e.target.value)} />
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Any special favors you'll like to ask?</CellsTitle>
          <Form>
            <FormCell id='comments'>
              <CellBody>
                <TextArea placeholder="How else could we help make your event awesome?"
                          rows="3"
                          value={this.state.comments}
                          onChange={(e) => this.update('comments', e.target.value)}
                          maxLength={200}>
                 </TextArea>
              </CellBody>
            </FormCell>
          </Form>
        </section>

        <ButtonArea className='see-options'>
          <Button onClick={() => this.submitEvent(userId)}
                  disabled={this.disableSubmit()} >
            Submit for review
          </Button>
        </ButtonArea>

        <Toast icon="success-no-circle" show={showToast}>Done</Toast>
        <Toast icon="loading" show={showLoading}>Processing ...</Toast>
      </div>
    );
  }
}
