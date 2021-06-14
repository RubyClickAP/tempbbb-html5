import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { StreamMeetings } from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { notify } from '/imports/ui/services/notification';
import VoiceUsers from '/imports/api/voice-users';
import StreamIndicator from './component';
import deviceInfo from '/imports/utils/deviceInfo';

const StreamIndicatorContainer = props => (
  <StreamIndicator {...props} />
);

export default withTracker(() => {
  const meetingId = Auth.meetingID;
  const streamObeject = StreamMeetings.findOne({ meetingId });
  console.log('[[StreamIndicatorContainer.withTracker]]', this.props );
  console.log('[[streamObeject]]', streamObeject);

  StreamMeetings.find({ meetingId: Auth.meetingID }, { fields: { streaming: 1 } }).observeChanges({
    changed: (id, fields) => {
      if (fields && fields.streaming) {
        this.window.parent.postMessage({ response: 'streamingStarted' }, '*');
      }

      if (fields && !fields.streaming) {
        this.window.parent.postMessage({ response: 'streamingStopped' }, '*');
      }
    },
  });

  const micUser = VoiceUsers.findOne({ meetingId, joined: true, listenOnly: false }, {
    fields: {
      joined: 1,
    },
  });

  // allowStartStopStreaming: !!(streamObeject && streamObeject.allowStartStopStreaming),
  return {
    allowStartStopStreaming: !!(streamObeject && streamObeject.allowStartStopStreaming),
    autoStartStreaming: streamObeject && streamObeject.autoStartStreaming,
    stream: streamObeject && streamObeject.stream,
    streaming: streamObeject && streamObeject.streaming,
    time: streamObeject && streamObeject.time,
    notify,
    micUser,
    isPhone: deviceInfo.isPhone,
  };
})(StreamIndicatorContainer);
