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
  Slider,
  Switch,
  Input,
  TextArea,
} from 'react-weui';

/* ----------  Internal Components  ---------- */

import ArrivalPeriod from './arrival-period.jsx';
import Rating from './rating.jsx';
import EventCategory from './event-category.jsx';
import Loading from './loading.jsx';
import SkinType from './skin-type.jsx';

/* ----------  Helpers  ---------- */

import WebviewControls from '../messenger-api-helpers/webview-controls';
import {dateString} from '../utils/date-string-format';

/* ----------  Models  ---------- */

import Gift from '../models/event';
import User from '../models/user';

const {ENVIRONMENTS, RATING} = User;

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
      title: 'Inspired',
      subtitle: 'To get better',
      image: 'moisturizers-filtered-cropped.jpg',
    },
    {
      title: 'Connected',
      subtitle: 'With just the right people!',
      image: 'lip-treatments-filtered-cropped.jpg',
    },
    {
      title: 'Discouraged',
      subtitle: "Not sure I'll explore the topics discussed",
      image: 'masks-filtered-cropped.jpg',
    },
    {
      title: 'Indifferent',
      subtitle: "Meh. Just there. Just okay.",
      image: 'cleansers-filtered-cropped.jpg',
    },
  ]

  static skinTypes = [
    'Acne or blemishes',
    'Oiliness',
    'Loss of tone',
    'Wrinkles',
    'Sensitivity',
    'Dehydration (tight with oil)',
    'Dryness (flaky with no oil)',
    'Scars',
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
    emailAddress: '',
    dateOfBirth: null,
    eventCategory: null,
    arrivalPeriod: null,
    environment: null,
    skinTypes: [],
    eventRating: 1,
    netPromoterScore: 1,
    textFeedback: '',
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
          skinTypes: new Set(jsonResponse.skinTypes),
        });
      }).catch((err) => console.error('Error pulling data', err));
  }

  pushData() {
    const content = this.jsonState();
    console.log(`Push data: ${content}`);

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
      WebviewControls.close();
    }).catch((err) => console.error('Error pushing data', err)).then(() => {
      WebviewControls.close();
    });
  }

  /* ----------  Formatters  ---------- */

  // Format state for easy printing or transmission
  jsonState() {
    return JSON.stringify({
      ...this.state,
      skinTypes: [...this.state.skinTypes],
    });
  }

  /* ----------  State Handlers  ---------- */

  setEventCategory(eventCategory) {
    console.log(`Gift Category: ${eventCategory}`);
    this.setState({eventCategory});
  }

  setArrivalPeriod(arrivalPeriod) {
    console.log(`Arrival Period: ${arrivalPeriod}`);
    this.setState({arrivalPeriod});
  }

  setNetPromoterScore(envIndex) {
    const netPromoterScore = RATING[envIndex];
    console.log(`net promoter score: ${netPromoterScore}`);
    this.setState({netPromoterScore});
  }

  setRating(envIndex) {
    const rating = RATING[envIndex];
    console.log(`rating: ${rating}`);
    this.setState({rating});
  }

  addSkinType(type) {
    console.log(`Add skin type: ${type}`);
    const oldSkinTypes = this.state.skinTypes;
    const skinTypes = new Set(oldSkinTypes);
    skinTypes.add(type);
    this.setState({skinTypes});
  }

  removeSkinType(type) {
    console.log(`Remove skin type: ${type}`);
    const oldSkinTypes = this.state.skinTypes;
    const skinTypes = new Set(oldSkinTypes);
    skinTypes.delete(type);
    this.setState({skinTypes});
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

    const skinTypes = App.skinTypes.map((label, index) => {
      const value = User.SKIN_TYPES[index];
      const checked = this.state.skinTypes.has(value);

      return (
        <SkinType
          key={value}
          value={value}
          label={label}
          checked={checked}
          addSkinType={this.addSkinType.bind(this)}
          removeSkinType={this.removeSkinType.bind(this)}
        />
      );
    });

    const eventCategories =
      App.eventCategories.map(({title, subtitle, image}, index) => {
        const value = Gift.CATEGORIES[index];

        return (
          <EventCategory
            key={value}
            title={title}
            subtitle={subtitle}
            image={image}
            selected={value === this.state.eventCategory}
            setEventCategory={() => this.setEventCategory(value)}
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
        <Rating
          key={label}
          label={label}
          active={label === this.state.environment}
        />
      );
    });

    const ratings = User.RATING.map((label) => {
      return (
        <Rating
          key={label}
          label={label}
          active={label === this.state.rating}
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
          <CellsTitle>After attending this event, I felt</CellsTitle>
          <Form radio id='event-type'>{eventCategories}</Form>
        </section>

        <section>
          <CellsTitle>How much did you like this event</CellsTitle>
          <div id='env-slider'>
            <Slider
              min={0}
              max={2}
              step={1}
              defaultValue={this.state.eventRating}
              showValue={false}
              onChange={ value => this.setState({ eventRating: value }) }
            />
            {ratings}
          </div>
        </section>


        <section>
          <CellsTitle>How willing would you be to refer someone to this event?</CellsTitle>
          <div id='env-slider'>
            <Slider
              min={0}
              max={2}
              step={1}
              defaultValue={this.state.netPromoterScore}
              showValue={false}
              onChange={ value => this.setState({ netPromoterScore: value }) }
            />
            {ratings}
          </div>
        </section>

        <section>
          <CellsTitle>Anything else you might want to point out?</CellsTitle>
          <TextArea
            value={this.state.textFeedback}
            placeholder="Something specific you noticed ..."
            onChange={ e => {
              console.log(e);
              this.setState({textFeedback: e.target.value })
            }}
            maxLength={200} />
        </section>


        <section>
          <Form>
            <FormCell switch>
              <CellBody>Send my email address</CellBody>
              <CellFooter>{persistSwitch}</CellFooter>
            </FormCell>
          </Form>
        </section>
        <ButtonArea className='see-options'>
          <Button onClick={this.pushData}>Submit my feedback</Button>
        </ButtonArea>
      </div>
    );
  }
}
