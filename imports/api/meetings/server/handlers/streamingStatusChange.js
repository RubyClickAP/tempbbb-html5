import { check } from 'meteor/check';
import { StreamMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleStreamingStatusChange({ body }, meetingId) {
  const { streaming } = body;
  check(streaming, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { streaming },
  };

  try {
    const { numberAffected } = StreamMeetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed meeting stream status id=${meetingId} straming=${streaming}`);
    }
  } catch (err) {
    Logger.error(`Changing stream status: ${err}`);
  }
}
