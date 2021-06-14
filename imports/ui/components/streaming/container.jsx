import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import { StreamMeetings } from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import StreamingComponent from './component';

const StreamingContainer = props => <StreamingComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => {
  const { streaming, time } = StreamMeetings.findOne({ meetingId: Auth.meetingID });

  return ({
    closeModal: () => mountModal(null),

    toggleStreaming: () => {
      makeCall('toggleStreaming');
      mountModal(null);
    },

    streamingStatus: streaming,
    streamingTime: time,
    isMeteorConnected: Meteor.status().connected,

  });
})(StreamingContainer));
