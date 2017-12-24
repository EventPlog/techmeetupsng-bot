/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

import React from 'react';
import {CellBody, CellFooter, CellHeader, FormCell, Radio, Select} from 'react-weui';
import PropTypes from 'proptypes';
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
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired, // name of file in `../public/media`
  selected: PropTypes.bool.isRequired,
  setEventCategory: PropTypes.func.isRequired,
};

export default EventCategory;
