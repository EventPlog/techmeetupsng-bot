import React from 'react';
import {
  Msg,
  Footer,
  FooterLinks,
  FooterLink,
  FooterText,
  Page
} from 'react-weui';

const SuccessFooter = ()=>(
  <Footer>
    <FooterLinks>
      <FooterLink href="#">Tech Meetups Ng</FooterLink>
    </FooterLinks>
    <FooterText>
      Copyright © 2008-2016 m.me/techmeetupsng
    </FooterText>
  </Footer>
);

const SuccessMsg = ({title, description, onClose}) => {
  return (
    <Page className="msg_success">
      <Msg
        type="success"
        title={title}
        description={description}
        buttons={onClose ? [{
          type: 'default',
          label: 'Close',
          onClick: onClose
        }]: undefined}
        footer={SuccessFooter}
      />
    </Page>
  )
}

export default SuccessMsg;