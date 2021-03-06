import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import VoiceUsers from '/imports/api/voice-users/';
import _ from 'lodash';
import SanitizeHTML from 'sanitize-html';
import addUserPsersistentData from '/imports/api/users-persistent-data/server/modifiers/addUserPersistentData';
import stringHash from 'string-hash';
import flat from 'flat';

import addVoiceUser from '/imports/api/voice-users/server/modifiers/addVoiceUser';

const COLOR_LIST = [
  '#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#98f4a6',
  '#311b92', '#3949ab', '#303f9f', '#669999', '#1a237e', '#1976d2', '#1565c0',
  '#669999', '#0277bd', '#01579b',
];

export default function addUser(meetingId, userData) {
  const user = userData;
  const sanitizedName = SanitizeHTML(userData.name, {
    allowedTags: [],
    allowedAttributes: {},
  });
  // if user typed only tags
  user.name = sanitizedName.length === 0
    ? _.escape(userData.name)
    : sanitizedName;

  check(meetingId, String);

  check(user, {
    intId: String,
    extId: String,
    name: String,
    role: String,
    guest: Boolean,
    authed: Boolean,
    waitingForAcceptance: Match.Maybe(Boolean),
    guestStatus: String,
    emoji: String,
    presenter: Boolean,
    locked: Boolean,
    avatar: String,
    clientType: String,
  });

  const userId = user.intId;

  const selector = {
    meetingId,
    userId,
  };
  const Meeting = Meetings.findOne({ meetingId });

  /* While the akka-apps dont generate a color we just pick one
    from a list based on the userId */
  const color = COLOR_LIST[stringHash(user.intId) % COLOR_LIST.length];

  const userInfos = Object.assign(
    {
      meetingId,
      sortName: user.name.trim().toLowerCase(),
      color,
      mobile: false,
      breakoutProps: {
        isBreakoutUser: Meeting.meetingProp.isBreakout,
        parentId: Meeting.breakoutProps.parentId,
      },
      effectiveConnectionType: null,
      inactivityCheck: false,
      responseDelay: 0,
      loggedOut: false,
    },
    flat(user),
  );

  const modifier = {
    $set: userInfos,
  };
  addUserPsersistentData(userInfos);
  // Only add an empty VoiceUser if there isn't one already and if the user coming in isn't a
  // dial-in user. We want to avoid overwriting good data
  if (user.clientType !== 'dial-in-user' && !VoiceUsers.findOne({ meetingId, intId: userId })) {
    addVoiceUser(meetingId, {
      voiceUserId: '',
      intId: userId,
      callerName: user.name,
      callerNum: '',
      muted: false,
      talking: false,
      callingWith: '',
      listenOnly: false,
      voiceConf: '',
      joined: false,
    });
  }

  try {
    const { insertedId } = Users.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding user to collection: ${err}`);
  }
}
