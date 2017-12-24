import React from 'react'
import {
  Panel,
  PanelHeader,
  PanelBody,
  PanelFooter,
  MediaBox,
  MediaBoxHeader,
  MediaBoxBody,
  MediaBoxTitle,
  MediaBoxDescription,
  MediaBoxInfo,
  MediaBoxInfoMeta,
} from 'react-weui';

const Speakers = ({
  speakers
}) =>
  <Panel className="panel">
    <PanelHeader>
      Speakers/Guests
    </PanelHeader>
    <PanelBody>
      {
        speakers.map(speaker =>
          <MediaBox type="appmsg" href="javascript:void(0);">
            <MediaBoxHeader><img src={speaker.avatar_url} /></MediaBoxHeader>
            <MediaBoxBody>
              <MediaBoxTitle>{speaker.full_name}</MediaBoxTitle>
              <MediaBoxDescription>
                {speaker.bio}
              </MediaBoxDescription>
            </MediaBoxBody>
          </MediaBox>
        )
      }
    </PanelBody>
  </Panel>

export default Speakers;