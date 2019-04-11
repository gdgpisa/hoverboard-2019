import * as functions from 'firebase-functions';
import { firestore, messaging } from 'firebase-admin';
import moment from 'moment';

const FORMAT = 'HH:mm';

const sendPushNotificationToUsers = async (userIds, payload) => {
  console.log('sendPushNotificationToUsers user ids', userIds, 'with notification', payload);
  const tokensPromise = userIds.map(id => firestore().collection('notificationsUsers').doc(id).get());
  // console.log('# tokensPromise', tokensPromise);

  const usersTokens = await Promise.all(tokensPromise);
  // console.log('# usersTokens', usersTokens);
  const tokensToUsers = usersTokens.reduce((aggregator, userTokens) => {
    if (!userTokens.exists) return aggregator;
    const { tokens } = userTokens.data();
    // console.log('# tokens inner', tokens);
    // console.log('# aggregator inner', aggregator);
    // console.log('# userTokens inner', userTokens);
    const toReturn = { ...aggregator, ...tokens };
    // console.log('# toReturn inner', toReturn);
    return toReturn;
  }, {});
  console.log('# tokensToUsers', tokensToUsers);
  const tokens = Object.keys(tokensToUsers);
  console.log('# tokens (keys)', tokens);

  const tokensToRemove = {};
  const messagingResponse = await messaging().sendToDevice(tokens, payload);
  // console.log('# messagingResponse', messagingResponse);
  messagingResponse.results.forEach((result, index) => {
    const error = result.error;
    if (error) {
      console.error('Failure sending notification to', tokens[index], error);
      if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
        const token = tokens[index];
        tokensToRemove[token] = tokensToUsers[token];
      }
    }
  });

  return "sent";
};

const triggerNotifications = functions.pubsub.topic('schedule-tick').onPublish(async () => {
    const notificationsConfigPromise = firestore().collection('config').doc('notifications').get();
    const schedulePromise = firestore().collection('schedule').get();

    const [notificationsConfigSnapshot, scheduleSnapshot] = await Promise.all([notificationsConfigPromise, schedulePromise]);
    const notificationsConfig = notificationsConfigSnapshot.exists ? notificationsConfigSnapshot.data() : {};

    const schedule = scheduleSnapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data() }), {});
    const todayDay = moment().utcOffset(notificationsConfig.timezone).format('YYYY-MM-DD');
    if (schedule[todayDay]) {
      const beforeTime = moment().subtract(3, 'minutes');
      const afterTime = moment().add(3, 'minutes');

      const upcomingTimeslot = schedule[todayDay].timeslots
        .filter(timeslot => {
          const timeslotTime = moment(`${timeslot.startTime}${notificationsConfig.timezone}`, `${FORMAT}Z`).subtract(10, 'minutes');
          // console.log("@@@ Filtering ", timeslotTime);
          // console.log("@@@ Filtering ", `${timeslot.startTime}${notificationsConfig.timezone}`);
          // console.log("@@@ isBetween ", beforeTime, afterTime, timeslotTime.isBetween(beforeTime, afterTime));
          return timeslotTime.isBetween(beforeTime, afterTime);
        });
      const upcomingSessions = upcomingTimeslot.reduce((result, timeslot) =>
        timeslot.sessions.reduce((aggregatedSessions, current) => [...aggregatedSessions, ...current.items], []), []);
      console.log("### Upcoming sessions "+JSON.stringify(upcomingSessions));
      const usersIdsSnapshot = await firestore().collection('featuredSessions').get();
      
      upcomingSessions.forEach(async (upcomingSession, sessionIndex) => {
        // console.log("### SessionIndex "+sessionIndex);
        // console.log("### UpcomingSessions "+upcomingSession);
        const sessionInfoSnapshot = await firestore().collection('sessions').doc(String(upcomingSession)).get();
        // console.log("### sessionInfoSnapshot");
        if (!sessionInfoSnapshot.exists) return;

        const usersIds = usersIdsSnapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data() }), {});

        // console.log("### Line 101");
        const userIdsFeaturedSession = Object.keys(usersIds)
          .filter(userId => !!Object.keys(usersIds[userId])
            .filter(sessionId => (sessionId.toString() === upcomingSession.toString()))
            .length
          );

        // console.log("###")
        const session = sessionInfoSnapshot.data();
        const end = moment(`${upcomingTimeslot[0].startTime}${notificationsConfig.timezone}`, `${FORMAT}Z`);
        const fromNow = end.fromNow();

        if (userIdsFeaturedSession.length) {
          console.log('### Sending push notifications');
          sendPushNotificationToUsers(userIdsFeaturedSession, {
            data: {
              title: session.title,
              body: `Starts ${fromNow}`,
              click_action: `/schedule/${todayDay}?sessionId=${upcomingSessions[sessionIndex]}`,
              icon: notificationsConfig.icon
            }
          });
        }

        if (upcomingSessions.length) {
          console.log('Upcoming sessions', upcomingSessions);
        } else {
          console.log('There is no sessions right now');
        }
      });
    } else {
      console.log(todayDay, 'was not found in the schedule')
    }
    // res.status(200).send("over");
  }
);

export default triggerNotifications;
