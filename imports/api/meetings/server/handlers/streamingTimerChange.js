import { check } from 'meteor/check';
import { StreamMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleStreamingTimerChange({ body }, meetingId) {
  const { time } = body;

  check(meetingId, String);

  check(body, {
    time: Number,
  });

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { time },
  };

  try {
    StreamMeetings.upsert(selector, modifier);
  } catch (err) {
    Logger.error(`Changing streaming time: ${err}`);
  }
}
