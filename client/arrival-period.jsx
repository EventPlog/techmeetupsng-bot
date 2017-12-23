/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

import React from 'react';
import {CellBody, CellFooter, CellHeader, FormCell, Radio} from 'react-weui';
import PropTypes from 'proptypes';
import SelectedIndicator from './selected-indicator';

/**
 * Component for picking how recently released they would like their events to be
 * Conditionally renders a checkmark for the selected item
 */

const ArrivalPeriod = ({label, value, selected, setArrivalPeriod}) => {
  return (
    <FormCell radio>
      <CellHeader>
        <Radio
          name={value}
          value={value}
          onClick={() => setArrivalPeriod(value)}
        />
      </CellHeader>

      <SelectedIndicator on={selected} />

      <CellBody className='checkbox-text'>
        {label}
      </CellBody>
    </FormCell>
  );
};

ArrivalPeriod.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  setArrivalPeriod: PropTypes.func.isRequired,
};

export default ArrivalPeriod;
