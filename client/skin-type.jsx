/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

import React from 'react';
import {CellBody, CellHeader, Checkbox, FormCell} from 'react-weui';
import PropTypes from 'proptypes';

/**
 * Component for a single skin type option
 * Conditionally renders an indicator if this item is selected
 */

const SkinType = ({label, value, checked, addSkinType, removeSkinType}) => {
  const toggle = checked ? removeSkinType : addSkinType;

  return (
    <FormCell
      checkbox
      key={value}
    >
      <CellHeader>
        <Checkbox
          name={value}
          value={value}
          defaultChecked={checked}
          onClick={() => toggle(value)}
        />
      </CellHeader>

      <CellBody>{label}</CellBody>
    </FormCell>
  );
};

SkinType.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  addSkinType: PropTypes.func.isRequired,
  removeSkinType: PropTypes.func.isRequired,
};

export default SkinType;
