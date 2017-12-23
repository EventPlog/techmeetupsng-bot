import React from 'react';
import {
  Button,
  ButtonArea,
} from 'react-weui';


const CTAButtons = ({
  event,
  userId,
  isAttending,
  checkedInAt,
  checkIn,
  attendEvent
}) => {
  let attendBtnText = isAttending ? 'Attending' : 'Attend Event';
  let checkedInBtnText = checkedInAt ? 'Checked In' : 'Check In';

  if (isAttending && checkedInAt) return '';

  return (
    <ButtonArea className='see-options' direction='horizontal'>
      {!isAttending && <Button onClick={() => attendEvent(userId, event)}
                               disabled={isAttending}
                               className={isAttending ? 'attending' : ''}>
        {attendBtnText}
      </Button>}
      {(isAttending && !checkedInAt) && <Button onClick={() => checkIn(userId, event)}
                              disabled={checkedInAt}
                              className={checkedInAt ? 'checked-in' : 'check-in'}>
        Check In
      </Button>}
    </ButtonArea>
  )
}

export default CTAButtons;