/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

import React from 'react';
import {CellFooter} from 'react-weui';
import PropTypes from 'proptypes';

// Helper function to capitalize the first letter of some text
const humanize = (text) => {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

/*
 * Component for the rating slider labels
 * The selected item is styled to indicate that it is selected
 */
const Rating = ({active, label, index}) => {
  const activeClass = active ? 'active' : null;

  return (
    <CellFooter className={`slider-option ${activeClass} rating-${index}`}>
      {humanize(label)}
    </CellFooter>
  );
};

Rating.propTypes = {
  active: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
};

export default Rating;
