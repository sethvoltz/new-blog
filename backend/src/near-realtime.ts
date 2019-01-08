import { DynamoDB } from 'aws-sdk';
import Aggregate from './aggregate';

// Triggered by publishing to the publish-pipeline SNS pubsub
export const atom = async (event, context) => {
  event.Records.forEach(record => {
    console.log('SNS record', JSON.parse(record.Sns.Message));
  });
  return {};
}

// Triggered by DDB stream, processes aggregations and other reverse index tables
export const articleCompute = async (event, context) => {
  const aggregate = new Aggregate();

  await event.Records.map((record) => {
    if (record.eventName === 'INSERT') {
      const image = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      if (image.aggregates) {
        return aggregate.add(image.id, image.aggregates);
      }
    }
    if (record.eventName === 'REMOVE') {
      const image = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
      if (image.aggregates) {
        return aggregate.remove(image.id, image.aggregates);
      }
    }
  });

  return { message: `Successfully processed ${event.Records.length} records.`, event };
};
