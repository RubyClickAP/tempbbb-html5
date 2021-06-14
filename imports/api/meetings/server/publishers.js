import { Meteor } from 'meteor/meteor';
import Meetings, { RecordMeetings, MeetingTimeRemaining, StreamMeetings } from '/imports/api/meetings';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function meetings(role) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Meetings was requested by unauth connection ${this.connection.id}`);
    return Meetings.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing meeting', { meetingId, userId });

  const selector = {
    $or: [
      { meetingId },
    ],
  };

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1 } });
  if (!!User && User.role === ROLE_MODERATOR) {
    selector.$or.push({
      'meetingProp.isBreakout': true,
      'breakoutProps.parentId': meetingId,
    });
  }

  const options = {
    fields: {
      password: false,
      'welcomeProp.modOnlyMessage': false,
    },
  };

  return Meetings.find(selector, options);
}

function publish(...args) {
  const boundMeetings = meetings.bind(this);
  return boundMeetings(...args);
}

Meteor.publish('meetings', publish);

function recordMeetings() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing RecordMeetings was requested by unauth connection ${this.connection.id}`);
    return RecordMeetings.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing RecordMeetings for ${meetingId} ${userId}`);

  return RecordMeetings.find({ meetingId });
}
function recordPublish(...args) {
  const boundRecordMeetings = recordMeetings.bind(this);
  return boundRecordMeetings(...args);
}

Meteor.publish('record-meetings', recordPublish);

// Add Streaming
function streamMeetings() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing StreamMeetings was requested by unauth connection ${this.connection.id}`);
    return StreamMeetings.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing StreamMeetings for ${meetingId} ${userId}`);

  return StreamMeetings.find({ meetingId });
}
function streamPublish(...args) {
  const boundStreamMeetings = streamMeetings.bind(this);
  return boundStreamMeetings(...args);
}

Meteor.publish('stream-meetings', streamPublish);

function meetingTimeRemaining() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing MeetingTimeRemaining was requested by unauth connection ${this.connection.id}`);
    return MeetingTimeRemaining.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;
  Logger.debug(`Publishing MeetingTimeRemaining for ${meetingId} ${userId}`);

  return MeetingTimeRemaining.find({ meetingId });
}
function timeRemainingPublish(...args) {
  const boundtimeRemaining = meetingTimeRemaining.bind(this);
  return boundtimeRemaining(...args);
}

Meteor.publish('meeting-time-remaining', timeRemainingPublish);
