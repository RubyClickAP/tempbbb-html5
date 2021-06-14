import { StreamMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function meetingHasEnded(meetingId) {
  try {
    const numberAffected = StreamMeetings.remove({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared stream prop from meeting with id ${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error on clearing stream prop from meeting with id ${meetingId}. ${err}`);
  }
}
