import React from 'react';
import {
  CellsTitle,
  Grids,
} from 'react-weui';

const InterestsSection = ({interests}) => {
  return (
    <section>
      <CellsTitle>I'm most interested in events related to</CellsTitle>
      <Grids data={interests}/>
    </section>
  )
}

export default InterestsSection;