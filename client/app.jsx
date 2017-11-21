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

/* ----------  External UI Kit  ---------- */

import {
  Button,
  ButtonArea,
  CellBody,
  CellFooter,
  CellHeader,
  CellsTitle,
  Form,
  FormCell,
  Input,
  Slider,
  Switch,
} from 'react-weui';

/* ----------  Internal Components  ---------- */

import ArrivalPeriod from './arrival-period.jsx';
import Environment from './rating.jsx';
import GiftCategory from './event-category.jsx';
import Loading from './loading.jsx';
import SkinType from './skin-type.jsx';

/* ----------  Helpers  ---------- */

import WebviewControls from '../messenger-api-helpers/webview-controls';
import {dateString} from '../utils/date-string-format';

/* ----------  Models  ---------- */

import Gift from '../models/event';
import User from '../models/user';

const {ENVIRONMENTS} = User;

/* =============================================
   =            React Application              =
   ============================================= */

export default class App extends React.PureComponent {

  /* =============================================
     =               Configuration               =
     ============================================= */

  /* ----------  Top-level App Constants  ---------- */

  static dateConfig = {
    month: 'long',
    day: 'numeric',
  }

  /**
   * Keeping the display labels in the front end as a separation of concerns
   * The actual values are being imported later via static attributes on
   * the models
   *
   * We have introduced an ordering dependency, but this is also the order that
   * we wish to display the options in the UI.
   */

  static eventCategories = [
    {
      title: 'Moisturizers',
      subtitle: 'Daily moisturizers & night creams',
      image: 'moisturizers-filtered-cropped.jpg',
    },
    {
      title: 'Cleansers',
      subtitle: 'Face washes, wipes & exfoliators',
      image: 'cleansers-filtered-cropped.jpg',
    },
    {
      title: 'Masks',
      subtitle: 'Face & sheet masks',
      image: 'masks-filtered-cropped.jpg',
    },
    {
      title: 'Lip Treatments',
      subtitle: 'Balms & sunscreen',
      image: 'lip-treatments-filtered-cropped.jpg',
    },
  ]

  static interests = [
    'Acne or blemishes',
    'Oiliness',
    'Loss of tone',
    'Wrinkles',
    'Sensitivity',
    'Dehydration (tight with oil)',
    'Dryness (flaky with no oil)',
    'Scars',
  ]

  static interests = [
    'artificial intelligence',
    'angular',
    'content management',
    'data science',
    'digital marketing',
    'go',
    'javascript',
    'python',
    'php',
    'product management',
    'react',
    'ruby',
  ]

  static arrivalPeriods = [
    'Last 30 days',
    'Last 60 days',
    'Coming soon',
  ]

  /* ----------  React Configuration  ---------- */

  static propTypes = {
    userId: React.PropTypes.string.isRequired,
  }

  state = {
    dateOfBirth: null,
    eventCategory: null,
    arrivalPeriod: null,
    environment: null,
    interests: [],
    persist: true,
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
  pullData() {
    const endpoint = `/users/${this.props.userId}`;
    console.log(`Pulling data from ${endpoint}...`);

    fetch(endpoint)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }

        console.error(
          status,
          `Unable to fetch user data for User ${this.props.userId}'`
        );
      }).then((jsonResponse) => {
        console.log(`Data fetched successfully: ${jsonResponse}`);

        this.setState({
          ...jsonResponse,
          interests: new Set(jsonResponse.interests),
        });
      }).catch((err) => console.error('Error pulling data', err));
  }

  pushData() {
    const content = this.jsonState();
    console.log(`Push data: ${content}`);

    WebviewControls.close();
    fetch(`/users/${this.props.userId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: content,
    }).then((response) => {
      if (response.ok) {
        console.log('Data successfully updated on the server!');
        return;
      }

      console.error(
        response.status,
        `Unable to save user data for User ${this.props.userId}'`
      );
    }).catch((err) => console.error('Error pushing data', err)).then(() => {
      WebviewControls.close();
    });
  }

  /* ----------  Formatters  ---------- */

  // Format state for easy printing or transmission
  jsonState() {
    return JSON.stringify({
      ...this.state,
      interests: [...this.state.interests],
    });
  }

  /* ----------  State Handlers  ---------- */

  setGiftCategory(eventCategory) {
    console.log(`Gift Category: ${eventCategory}`);
    this.setState({eventCategory});
  }

  setArrivalPeriod(arrivalPeriod) {
    console.log(`Arrival Period: ${arrivalPeriod}`);
    this.setState({arrivalPeriod});
  }

  setEnvironment(envIndex) {
    const environment = ENVIRONMENTS[envIndex];
    console.log(`Environment: ${environment}`);
    this.setState({environment});
  }

  addInterest(type) {
    console.log(`Add interest: ${type}`);
    const oldInterests = this.state.interests;
    const interests = new Set(oldInterests);
    interests.add(type);
    this.setState({interests});
  }

  removeInterest(type) {
    console.log(`Remove Interest type: ${type}`);
    const oldInterests = this.state.interests;
    const interests = new Set(oldInterests);
    interests.delete(type);
    this.setState({interests});
  }

  setPersist(persist) {
    console.log(`Persist: ${JSON.stringify(persist)}`);
    this.setState({persist});
  }

  setDateOfBirth(dateOfBirth) {
    console.log(`Set date of birth: ${dateOfBirth}`);
    this.setState({dateOfBirth});
  }

  /* =============================================
     =              React Lifecycle              =
     ============================================= */

  componentWillMount() {
    this.pullData(); // Initial data fetch
  }

  /*
   * Provide the main structure of the resulting HTML
   * Delegates items out to specialized components
   *
   */
  render() {
    /**
     * If waiting for data, just show the loading spinner
     * and skip the rest of this function
     */
    if (!this.state.eventCategory) {
      return <Loading />;
    }

    /* ----------  Setup Sections (anything dynamic or repeated) ---------- */

    const interests = App.interests.map((label, index) => {
      const value = User.INTERESTS[index];
      const checked = this.state.interests.has(value);

      return (
        <SkinType
          key={value}
          value={value}
          label={label}
          checked={checked}
          addSkinType={this.addInterest.bind(this)}
          removeSkinType={this.removeInterest.bind(this)}
        />
      );
    });

    const eventCategories =
      App.eventCategories.map(({title, subtitle, image}, index) => {
        const value = Gift.CATEGORIES[index];

        return (
          <GiftCategory
            key={value}
            title={title}
            subtitle={subtitle}
            image={image}
            selected={value === this.state.eventCategory}
            setGiftCategory={() => this.setGiftCategory(value)}
          />
        );
      });

    const arrivalPeriods = App.arrivalPeriods.map((label, index) => {
      const value = User.ARRIVAL_PERIODS[index];
      return (
        <ArrivalPeriod
          key={label}
          label={label}
          value={value}
          selected={value === this.state.arrivalPeriod}
          setArrivalPeriod={this.setArrivalPeriod.bind(this)}
        />
      );
    });

    const environments = User.ENVIRONMENTS.map((label) => {
      return (
        <Environment
          key={label}
          label={label}
          active={label === this.state.environment}
        />
      );
    });

    const {persist} = this.state;
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
          <CellsTitle>Email Address</CellsTitle>
          <Form>
            <FormCell select id='email-address'>
              <Input
                type="text"
                value={this.state.emailAddress}
                placeholder="you@yourdomain.com"
              />
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>Which of these categories are you most interested in?</CellsTitle>
          <Form checkbox>{interests}</Form>
        </section>

        <section>
          <Form>
            <FormCell switch>
              <CellBody>Set as new default</CellBody>
              <CellFooter>{persistSwitch}</CellFooter>
            </FormCell>
          </Form>
        </section>
        <ButtonArea className='see-options'>
          <Button onClick={() => this.pushData()}>Save these settings</Button>
        </ButtonArea>
      </div>
    );
  }
}
