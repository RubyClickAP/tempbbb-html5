import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

const intlMessages = defineMessages({
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
  startDescription: {
    id: 'app.streaming.startDescription',
    description: 'start streaming description',
  },
  stopDescription: {
    id: 'app.streaming.stopDescription',
    description: 'stop streaming description',
  },
  yesLabel: {
    id: 'app.audioModal.yes',
    description: 'label for yes button',
  },
  noLabel: {
    id: 'app.audioModal.no',
    description: 'label for no button',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  toggleStreaming: PropTypes.func.isRequired,
  streamingTime: PropTypes.number,
  streamingStatus: PropTypes.bool,
  amIModerator: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
};

const defaultProps = {
  streamingTime: -1,
  streamingStatus: false,
  amIModerator: false,
};

class StreamingComponent extends PureComponent {
  render() {
    const {
      intl,
      streamingStatus,
      streamingTime,
      amIModerator,
      closeModal,
      toggleStreaming,
      isMeteorConnected,
    } = this.props;

    let title;

    if (!streamingStatus) {
      title = streamingTime >= 0 ? intl.formatMessage(intlMessages.resumeTitle)
        : intl.formatMessage(intlMessages.startTitle);
    } else {
      title = intl.formatMessage(intlMessages.stopTitle);
    }

    if (!amIModerator) return null;
    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={title}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>
              {title}
            </div>
          </div>
          <div className={styles.description}>
            {`${intl.formatMessage(!streamingStatus
              ? intlMessages.startDescription
              : intlMessages.stopDescription)}`}
          </div>
          <div className={styles.footer}>
            <Button
              color="primary"
              className={styles.button}
              disabled={!isMeteorConnected}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={toggleStreaming}
            />
            <Button
              label={intl.formatMessage(intlMessages.noLabel)}
              className={styles.button}
              onClick={closeModal}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

StreamingComponent.propTypes = propTypes;
StreamingComponent.defaultProps = defaultProps;

export default injectIntl(StreamingComponent);
