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

/* ----------  External UI Kit  ---------- */

import {
  Panel,
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

import Event from '../models/event';
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

  static IMPACTS = [
    'inspired',
    'connected',
    'discouraged',
    'indifferent'
  ];

  static RATING = [
    'Not at all',
    'Averagely true',
    'Definitely'
  ];

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
    userId: PropTypes.string.isRequired,
  }

  state = {
    event_impact: null,
    satisfaction_level: 2,
    net_promoter_score: 2,
    feedback_note: '',
    swags_present: true,
    resolve: '',
  }

  /* =============================================
     =               Helper Methods              =
     ============================================= */

  /* ----------  Communicate with Server  ---------- */

  /**
   * Pull saved data from the server, and populate the form
   * If there's an error, we log it to the console. Errors will not be availble
   * within the Messenger webview. If you need to see them 'live', switch to
   * an `alert()`. Anything no in the webview would be subtracted.
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

  setEventImpact(event_impact) {
    console.log(`Event Category: ${event_impact}`);
    this.setState({event_impact});
  }

  setRating(param, selectedIndex) {
    this.setState({[param]: RATING[selectedIndex]});
  }

  setFeedbackNote(feedback_note) {
    this.setState({feedback_note});
  }

  setResolve(resolve) {
    this.setState({resolve});
  }

  setSwagsPresent(swags_present) {
    this.setState({swags_present});
  }

  submitFeedback = () => {
    this.props.submitFeedback(this.state);
  }

  /* =============================================
     =              React Lifecycle              =
     ============================================= */

  componentWillMount() {
    // this.pullData(); // Initial data fetch
    this.setEventImpact(App.IMPACTS[0])
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
    if (!this.state.event_impact) {
      return <Loading />;
    }

    /* ----------  Setup Sections (anything dynamic or repeated) ---------- */

    const eventCategories =
      App.eventCategories.map(({title, subtitle, image}, index) => {
        const value = App.IMPACTS[index];

        return (
          <EventCategory
            key={value}
            title={title}
            subtitle={subtitle}
            image={image}
            selected={value === this.state.event_impact}
            setEventCategory={() => this.setEventImpact(value)}
          />
        );
      });

    const ratings = (param) =>
      App.RATING.map((label, index) => {
        return (
          <Rating
            key={label}
            {...{label, index}}
            active={label === this.state[param]}
          />
        );
      });

    const {swags_present} = this.state;
    const persistSwagSwitch = (
      <Switch
        defaultChecked={swags_present}
        onClick={() => this.setSwagsPresent(!swags_present)}
      />
    );

    /* ----------  Main Structure  ---------- */

    return (
      <div className='app feedback panel'>

        <section>
          <CellsTitle>After attending this event, I felt mostly</CellsTitle>
          <Form radio id='event-type'>{eventCategories}</Form>
        </section>

        <section>
          <CellsTitle>I'm absolutely satisfied with this event (drag slider)</CellsTitle>
          <div id='env-slider'>
            <Slider
              min={1}
              max={5}
              step={1}
              defaultValue={this.state.satisfaction_level}
              showValue={false}
              onChange={ value => this.setState({ satisfaction_level: value }) }
            />
            {ratings('satisfaction_level')}
          </div>
        </section>


        <section>
          <CellsTitle>I would recommend this event to my friends. (drag slider)</CellsTitle>
          <div id='env-slider'>
            <Slider
              min={1}
              max={5}
              step={1}
              defaultValue={this.state.net_promoter_score}
              showValue={false}
              onChange={ value => this.setState({ net_promoter_score: value }) }
            />
            {ratings('net_promoter_score')}
          </div>
        </section>

        <section>
          <Form>
            <FormCell switch>
              <CellBody>I got swags - tshirt, sticker, etc. (Turn switch off if you didn't)</CellBody>
              <CellFooter>{persistSwagSwitch}</CellFooter>
            </FormCell>
          </Form>
        </section>

        <section>
          <CellsTitle>What, in your opinion, could the organizers have done better?</CellsTitle>
          <TextArea
            value={this.state.feedback_note}
            placeholder="Something specific you noticed ..."
            onChange={ e => {
              this.setFeedbackNote(e.target.value)
            }}
            maxLength={200} />
        </section>

        <section>
          <CellsTitle>What do you resolve to do differently as a result of this event?</CellsTitle>
          <TextArea
            value={this.state.resolve}
            placeholder="Something specific you noticed ..."
            onChange={ e => {
              this.setResolve(e.target.value)
            }}
            maxLength={200} />
        </section>

        <ButtonArea className='see-options'>
          <Button onClick={this.submitFeedback}>Submit my feedback</Button>
        </ButtonArea>
      </div>
    );
  }
}
