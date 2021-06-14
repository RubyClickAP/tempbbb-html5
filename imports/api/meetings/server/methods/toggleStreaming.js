import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { StreamMeetings } from '/imports/api/meetings';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function toggleStreaming() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
  const EVENT_NAME = 'SetStreamingStatusCmdMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    let meetingStreamed;
    let allowedToStream;

    const streamObject = StreamMeetings.findOne({ meetingId });
    console.log('[[toggleStreaming.js-StreamMeetings.finOne()]]', streamObject);

    if (stramObject != null) {
      const {
        allowStartStopStreaming,
        streaming,
        stream,
      } = streamObject;

      meetingStreamed = streaming;
      allowedToStream = stream && allowStartStopStreaming; // TODO-- remove some day
    }

    const payload = {
      streaming: !meetingStreamed,
      setBy: requesterUserId,
    };

    const selector = {
      meetingId,
      userId: requesterUserId,
    };
    const user = Users.findOne(selector);

    if (allowedToStream && !!user && user.role === ROLE_MODERATOR) {
      Logger.info(`Setting the stream parameter to ${!meetingStreamed} for ${meetingId} by ${requesterUserId}`);
      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method toggleStraming ${err.stack}`);
  }
}
