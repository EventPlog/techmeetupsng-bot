import React from 'react';
import {
  Panel,
  PanelHeader,
  PanelBody,
  MediaBox,
  MediaBoxTitle,
  MediaBoxDescription,
  MediaBoxInfo,
  MediaBoxInfoMeta,
} from 'react-weui';


const Agenda = ({
  agenda
}) =>
  <Panel className="panel">
    <PanelHeader>
      Agenda
    </PanelHeader>
    <PanelBody>
      {
        agenda.map(item =>
          <MediaBox type="text">
            <MediaBoxTitle>{item.duration}</MediaBoxTitle>
            <MediaBoxDescription>
              {item.description}
            </MediaBoxDescription>
            <MediaBoxInfo>
              <span className="agenda-speaker-prefix">By</span>
              {
                item.speakers.map((speaker, index) =>
                  <MediaBoxInfoMeta key={index} extra>{speaker.full_name}</MediaBoxInfoMeta>
                )
              }
            </MediaBoxInfo>
          </MediaBox>
        )
      }
    </PanelBody>
  </Panel>

export default Agenda;