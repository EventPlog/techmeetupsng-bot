/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

import React from 'react';
import {CellBody, CellFooter, CellHeader, FormCell, Radio, Select} from 'react-weui';

import SelectedIndicator from './selected-indicator.jsx';

/**
 * Component for each event category
 * Conditionally renders an indicator is the categoyr is selected
 */

const EventCategory = ({title, subtitle, image, selected, setEventCategory}) => {
  const imagePath = `/media/${image}`;

  return (
    <FormCell
      radio
      className='event-category'
      onClick={() => setEventCategory()}
    >
      <CellHeader>
        <SelectedIndicator on={selected}/>
      </CellHeader>

      <CellBody className='event-title checkbox-text'>{title}</CellBody>
      <CellBody className='event-subtitle checkbox-text'>{subtitle}</CellBody>

      <CellFooter className='event-image'>
        <img src={imagePath} />
      </CellFooter>
    </FormCell>
  );
};

EventCategory.propTypes = {
  title: React.PropTypes.string.isRequired,
  subtitle: React.PropTypes.string.isRequired,
  image: React.PropTypes.string.isRequired, // name of file in `../public/media`
  selected: React.PropTypes.bool.isRequired,
  setEventCategory: React.PropTypes.func.isRequired,
};

export default EventCategory;
