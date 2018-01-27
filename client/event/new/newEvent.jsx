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
import processRequest from '../../../messenger-api-helpers/webAPI';

// import iconSrc from './media/ui/unchecked.png';

/* ----------  Helpers  ---------- */

import {dateString} from '../../../utils/date-string-format';

/* ----------  Models  ---------- */


/* =============================================
   =            React Application              =
   ============================================= */

const interests = {
  'artificial intelligence': {id: 1, event_count: 2, selected: false},
  'angular': {id: 2, event_count: 4, selected: false},
  'content management': {id: 3, event_count: 2, selected: true},
  'data science': {id: 4, event_count: 2, selected: true},
  'digital marketing': {id: 5, event_count: 4, selected: false},
  'go': {id: 6, event_count: 2, selected: false},
  'javascript': {id: 7, event_count: 2, selected: false},
  'python': {id: 8, event_count: 2, selected: false},
  'php': {id: 9, event_count: 2, selected: false},
  'product management': {id: 10, event_count: 2, selected: false},
  'react': {id: 11, event_count: 2, selected: false},
  'ruby': {id: 12, event_count: 2, selected: false},
}

const toTitleCase = (str) => {
  return str[0].toUpperCase() + str.substr(1)
}

const showNonTestEmails = (email) =>
  (email.indexOf('tmntest') == -1) ? email : '';

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
    interests: [],
    persist: true,
    showLoading: false,
    showToast: false,
    title: null,
    organizer: null,
    featured_image: null,
    link: null,
    description: null,
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

  getInterestsIds = (interests) => {
    let interests_ids = [];
    for (let interest in interests) {
      if (interests[interest].selected) {
        interests_ids.push(interests[interest].id)
      }
    }
    return interests_ids;
  }

  preparePayload = () => {
    const {email, region, country, interests} = this.state;
    // let interests_ids = this.getInterestsIds(interests);
    // return {email, region, country, interests_ids}
    return this.state;
  }

  getPreferences = async(userId) => {
    logger.fbLog('preferences_success', {email: this.state.email}, userId);
    this.setState({showLoading: true});
    try {
      let response = await processRequest(`/users/${userId}/preferences`, 'GET', {});
      if (response) {
        if (response.user_id) {
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
      let response = await processRequest(`/users/${userId}/events/new`, 'POST', {event: this.preparePayload()});
      if (response) {
        if (response.user_id) {
          this.showSuccessToast();
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

  // Format state for easy printing or transmission
  jsonState() {
    return JSON.stringify({
      ...this.state,
      interests: [...this.state.interests],
    });
  }

  initState() {
    this.setState({interests})
  }

  setPersist(persist) {
    console.log(`Persist: ${JSON.stringify(persist)}`);
    this.setState({persist});
  }

  toggleInterest = (interest) => {
    const {interests} = this.state;
    this.setState({
      interests: {...interests,
        [interest]: {
          ...interests[interest],
          selected: !interests[interest].selected
        }}
    })
  }

  data = () => {
    let interestData = [];
    const {interests} = this.state;
    for (let interest in interests) {
      interestData.push({
        icon: <img onClick={(e) => this.toggleInterest(interest)}
                   src={`/media/ui/${interests[interest].selected ? 'checked' : 'unchecked'}.png`} />,
        label: interest,
        children: <Badge preset="header">{interests[interest].event_count} </Badge>,
        href: 'javascript:;'
      })
    }
    return interestData;
  }

  selectCountry = (val) => {
    this.setState({ country: val });
  }

  update = (property, val) => {
    this.setState({ [property]: val });
  }

  /* =============================================
     =              React Lifecycle              =
     ============================================= */

  componentWillMount() {
    // this.getPreferences(this.props.userId); // Initial data fetch
    // this.initState();
  }

  render() {
    /**
     * If waiting for data, just show the loading spinner
     * and skip the rest of this function
     */
    if (!this.state.eventCategory) {
      // return <Loading />;
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
            <FormCell select id='title'>
              <Input
                type="text"
                value={this.state.title}
                placeholder="As concise as possible"
                onChange={(e) => this.update('title', e.target.value)} />
            </FormCell>
          </Form>
        </section>


        <section>
          <CellsTitle>Organizer</CellsTitle>
          <Form>
            <FormCell select id='organizer'>
              <Input
                type="text"
                value={this.state.organizer}
                placeholder="Affiliate organization"
                onChange={(e) => this.update('organizer', e.target.value)} />
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Link to featured image</CellsTitle>
          <Form>
            <FormCell select id='email-address'>
              <Input
                type="text"
                value={this.state.featured_image}
                placeholder="A link to the image online"
                onChange={(e) => this.update('email', e.target.value)} />
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Registration link</CellsTitle>
          <Form>
            <FormCell select id='link'>
              <Input
                type="text"
                value={this.state.link}
                placeholder="http://"
                onChange={(e) => this.update('link', e.target.value)} />
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Description</CellsTitle>
          <Form>
            <FormCell>
              <CellBody>
                <TextArea placeholder="Enter your comments"
                          rows="3"
                          onChange={(e) => this.update('description', e.target.value)}
                          maxLength={200}>
                </TextArea>
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
                       onChange={(e) => this.update('starts_at', e.target.value)}
                       defaultValue="" placeholder=""/>
              </CellBody>
            </FormCell>
            <FormCell>
              <CellHeader>
                <Label>Ends at:</Label>
              </CellHeader>
              <CellBody>
                <Input type="datetime-local"
                       onChange={(e) => this.update('ends_at', e.target.value)}
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

        <InterestsSection
          title="And closely relates to"
          interests={this.data()} />

        {/*<section>*/}
          {/*<Form>*/}
            {/*<FormCell switch>*/}
              {/*<CellBody>Message me when an event is available</CellBody>*/}
              {/*<CellFooter>{persistSwitch}</CellFooter>*/}
            {/*</FormCell>*/}
          {/*</Form>*/}
        {/*</section>*/}
        <ButtonArea className='see-options'>
          <Button onClick={() => this.submitEvent(userId)}>Save these settings</Button>
        </ButtonArea>

        <Toast icon="success-no-circle" show={showToast}>Done</Toast>
        <Toast icon="loading" show={showLoading}>Processing ...</Toast>
      </div>
    );
  }
}
