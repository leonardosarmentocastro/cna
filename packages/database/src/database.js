const mongoose = require('mongoose');
const retry = require('async-retry')

const CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || `mongodb://${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE_NAME}`;
const isProduction = (process.env.NODE_ENV === 'production');
const connectedOnURI = isProduction ? '' : `URI: "${CONNECTION_STRING}"`;

exports.database = {
  connect: async () => {
    let retryCount = 0;
    const retries = 5;
    const minTimeout = 3000;
    const retryInSeconds = minTimeout / 1000;
    const options = {
      minTimeout,
      retries,
      onRetry: () => {
        retryCount++;

        const infoMessage = [
          `[ database::NOT_READY ] Failed to connect to database. Retry ${retryCount} of ${retries}.`
          `Retrying in ${retryInSeconds} seconds.`,
        ].join(' ');
        console.info(infoMessage);
      },
    };

    await retry(() => mongoose.connect(CONNECTION_STRING))
      .catch(err => {
        const errorMessage = [
          `[ database::ERROR ] Failed to connect to database. ${connectedOnURI}`,
          `[ database::STACKTRACE ] ${err}`
        ].join('\r\n');
        return Promise.reject(errorMessage);
      });

    const successMessage = `[ database::CONNECTED ] Connection to MongoDB was stablished. ${connectedOnURI}`.trim();
    return console.info(successMessage);
  },
};
