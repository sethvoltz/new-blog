import { SNS } from 'aws-sdk';

const options = {
  endpoint: "http://localhost:8001",
  region: "localhost",
};

const isOffline = function () {
    // Depends on serverless-offline plugion which adds IS_OFFLINE to process.env when running offline
    return process.env.IS_OFFLINE;
};

export default isOffline() ? new SNS(options) : new SNS();
