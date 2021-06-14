import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import { RecordMeetings, StreamMeetings}  from '/imports/api/meetings';

const processOutsideToggleRecording = (e) => {
  switch (e.data) {
    case 'c_record': {
      makeCall('toggleRecording');
      break;
    }
    case 'c_recording_status': {
      const recordingState = (RecordMeetings.findOne({ meetingId: Auth.meetingID })).recording;
      const recordingMessage = recordingState ? 'recordingStarted' : 'recordingStopped';
      this.window.parent.postMessage({ response: recordingMessage }, '*');
      break;
    }
    default: {
      // console.log(e.data);
    }
  }
};

const connectRecordingObserver = () => {
  // notify on load complete
  this.window.parent.postMessage({ response: 'readyToConnect' }, '*');
};

const processOutsideToggleStreaming = (e) => {
  switch (e.data) {
    case 'c_stream': {
      makeCall('toggleRecording');
      break;
    }
    case 'c_streaming_status': {
      const streamingState = (StreamMeetings.findOne({ meetingId: Auth.meetingID })).streaming;
      console.log('[[service.js-processOutsideToggleStreaming]]', streamingState);
      //const streamingState = (RecordMeetings.findOne({ meetingId: Auth.meetingID })).recording;
      const streamingMessage = streamingState ? 'streamingStarted' : 'streamingStopped';
      this.window.parent.postMessage({ response: streamingMessage }, '*');
      break;
    }
    default: {
      // console.log(e.data);
    }
  }
};

const connectStreamingObserver = () => {
  // notify on load complete
  this.window.parent.postMessage({ response: 'readyToConnect' }, '*');
};

export default {
  connectRecordingObserver: () => connectRecordingObserver(),
  processOutsideToggleRecording: arg => processOutsideToggleRecording(arg),
  connectStreamingObserver: () => connectStreamingObserver(),
  processOutsideToggleStreaming: arg => processOutsideToggleStreaming(arg),
};
