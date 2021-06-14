import { check } from 'meteor/check';
import addMeeting from '../modifiers/addMeeting';

export default function handleMeetingCreation({ body }) {
  console.log('[[body0.prop]]', body.props);
  body.props.streamProp =  {
    allowStartStopStreaming: true,
    autoStartStreaming: false,
    stream: true,
  }
  //body.meetingProp.isBreakout = false;

  const meeting = body.props;
  console.log('[[body2.prop]]', body.props);
  const durationInSecods = (meeting.durationProps.duration * 60);
  meeting.durationProps.timeRemaining = durationInSecods;
  check(meeting, Object);

  return addMeeting(meeting);
}
