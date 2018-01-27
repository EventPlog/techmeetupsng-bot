import React from 'react';
import {
  CellsTitle,
  Grids,
} from 'react-weui';

const InterestsSection = ({interests, title}) => {
  return (
    <section>
      <CellsTitle>{title || "I'm most interested in events related to"}</CellsTitle>
      <Grids data={interests}/>
    </section>
  )
}

export default InterestsSection;