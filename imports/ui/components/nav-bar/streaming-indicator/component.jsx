import React, { PureComponent, Fragment } from 'react';
//import RecordingContainer from '/imports/ui/components/recording/container';
import StreamingContainer from '/imports/ui/components/streaming/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import Tooltip from '/imports/ui/components/tooltip/component';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { styles } from './styles';

const intlMessages = defineMessages({
  notificationStreamingStart: {
    id: 'app.notification.streamingStart',
    description: 'Notification for when the streaming starts',
  },
  notificationStreamingStop: {
    id: 'app.notification.streamingStop',
    description: 'Notification for when the streaming stops',
  },
  streamingAriaLabel: {
    id: 'app.notification.streamingAriaLabel',
    description: 'Notification for when the streaming stops',
  },
  startTitle: {
    id: 'app.streaming.startTitle',
    description: 'start streaming title',
  },
  stopTitle: {
    id: 'app.streaming.stopTitle',
    description: 'stop streaming title',
  },
  resumeTitle: {
    id: 'app.streaming.resumeTitle',
    description: 'resume streaming title',
  },
  streamingIndicatorOn: {
    id: 'app.navBar.streaming.on',
    description: 'label for indicator when the session is being live-stream',
  },
  streamingIndicatorOff: {
    id: 'app.navBar.streaming.off',
    description: 'label for indicator when the session is not being live-stream',
  },
  emptyAudioBrdige: {
    id: 'app.navBar.emptyAudioBrdige',
    description: 'message for notification when streaming starts with no users in audio bridge',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
  amIModerator: PropTypes.bool,
  stream: PropTypes.bool,
  streaming: PropTypes.bool,
  mountModal: PropTypes.func.isRequired,
  time: PropTypes.number,
  allowStartStopStreaming: PropTypes.bool.isRequired,
};

const defaultProps = {
  amIModerator: false,
  stream: false,
  streaming: false,
  time: 0,
};

class StreamingIndicator extends PureComponent {
  constructor(props) {
    super(props);
    console.log('[[[[[streaming-indicator]]]]');
    console.log('props: ', props);
    this.state = {
      time: (props.time ? props.time : 0),
    };

    this.incrementTime = this.incrementTime.bind(this);
  }

  componentDidUpdate() {
    const { streaming } = this.props;
    console.log('[[[[[streaming-indicator.componentDidUpdate]]]]');
    console.log('props: ', this.props);
    if (!streaming) {
      clearInterval(this.interval);
      this.interval = null;
    } else if (this.interval === null) {
      this.interval = setInterval(this.incrementTime, 1000);
    }
  }

  incrementTime() {
    const { time: propTime } = this.props;
    const { time } = this.state;

    if (propTime > time) {
      this.setState({ time: propTime + 1 });
    } else {
      this.setState({ time: time + 1 });
    }
  }

  render() {
    const {
      stream,
      streaming,
      mountModal,
      amIModerator,
      intl,
      allowStartStopStreaming,
      notify,
      micUser,
      isPhone,
    } = this.props;

    const { time } = this.state;
    if (!stream) return null;

    if (!this.interval && streaming) {
      this.interval = setInterval(this.incrementTime, 1000);
    }

    const title = intl.formatMessage(streaming ? intlMessages.streamingIndicatorOn
      : intlMessages.streamingIndicatorOff);

    let recordTitle = '';

    if (!isPhone) {
      if (!streaming) {
        recordTitle = time > 0
          ? intl.formatMessage(intlMessages.resumeTitle)
          : intl.formatMessage(intlMessages.startTitle);
      } else {
        recordTitle = intl.formatMessage(intlMessages.stopTitle);
      }
    }

    const streamingToggle = () => {
      if (!micUser && !streaming) {
        notify(intl.formatMessage(intlMessages.emptyAudioBrdige), 'error', 'warning');
      }
      mountModal(<StreamingContainer amIModerator={amIModerator} />);
      document.activeElement.blur();
    };

    const streamingIndicatorIcon = (
      <span data-test="mainWhiteboard" className={cx(styles.streamingIndicatorIcon, (!isPhone || streaming) && styles.presentationTitleMargin)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="100%" version="1" viewBox="0 0 20 20">
          <g stroke="#FFF" fill="#FFF" strokeLinecap="square">
            <circle
              fill="none"
              strokeWidth="1"
              r="9"
              cx="10"
              cy="10"
            />
            <circle
              stroke={streaming ? '#F00' : '#FFF'}
              fill={streaming ? '#F00' : '#FFF'}
              r="4"
              cx="10"
              cy="10"
            />
          </g>
        </svg>
      </span>
    );

    //const showButton = amIModerator && allowStartStopStreaming;
    const showButton = true;

    const streamMeetingButton = (
      <div
        aria-label={title}
        className={streaming ? styles.streamingControlON : styles.streamingControlOFF}
        role="button"
        tabIndex={0}
        key="streaming-toggle"
        onClick={streamingToggle}
        onKeyPress={streamingToggle}
      >
        {streamingIndicatorIcon}

        <div className={styles.presentationTitle}>
          {streaming
            ? (
              <span className={styles.visuallyHidden}>
                {`${intl.formatMessage(intlMessages.streamingAriaLabel)} ${humanizeSeconds(time)}`}
              </span>
            ) : null
          }
          {streaming
            ? <span aria-hidden>{humanizeSeconds(time)}</span> : <span>{recordTitle}</span>}
        </div>
      </div>
    );

    const recordMeetingButtonWithTooltip = (
      <Tooltip title={intl.formatMessage(intlMessages.stopTitle)}>
        {streamMeetingButton}
      </Tooltip>
    );

    const streamingButton = streaming ? recordMeetingButtonWithTooltip : streamMeetingButton;

    return (
      <Fragment>
        {stream
          ? <span className={styles.presentationTitleSeparator} aria-hidden>|</span>
          : null}
        <div className={styles.streamingIndicator}>
          {showButton
            ? streamingButton
            : null}

          {showButton ? null : (
            <Tooltip
              title={`${intl.formatMessage(streaming
                ? intlMessages.notificationStreamingStart
                : intlMessages.notificationStreamingStop)}`}
            >
              <div
                aria-label={`${intl.formatMessage(streaming
                  ? intlMessages.notificationStreamingStart
                  : intlMessages.notificationStreamingStop)}`}
                className={styles.recordingStatusViewOnly}
              >
                {streamingIndicatorIcon}

                {streaming
                  ? <div className={styles.presentationTitle}>{humanizeSeconds(time)}</div> : null}
              </div>
            </Tooltip>
          )}
        </div>
      </Fragment>
    );
  }
}

StreamingIndicator.propTypes = propTypes;
StreamingIndicator.defaultProps = defaultProps;

export default injectIntl(StreamingIndicator);
