import { DynamoDB } from 'aws-sdk';
import * as dynamodb from 'serverless-dynamodb-client';

declare var process: {
  env: {
    AGGREGATES_TABLE: string, // guarantee this exists
    AGGREGATES_TYPE_INDEX: string,
  },
};

class Article {
  db: DynamoDB.DocumentClient;

  constructor() {
    this.db = dynamodb.doc;
  }

  async add(id, aggregates) {
    for (const type in aggregates) {
      const aggregate = `${type}-${aggregates[type]}`;
      const params = {
        TableName: process.env.AGGREGATES_TABLE,
        Key: { aggregate },
        ExpressionAttributeNames: {
          '#type': 'type',
          '#count': 'count',
          '#ids': 'ids',
        },
        ExpressionAttributeValues: {
          ':type': type,
          ':none': 0,
          ':increment': 1,
          ':ids': this.db.createSet([id]),
        },
        UpdateExpression: 'SET #type = if_not_exists(#type, :type), #count = if_not_exists(#count, :none) + :increment ADD #ids :ids',
        ReturnValues: 'ALL_NEW',
      };

      this.db.update(params).promise();
    }
  }

  async remove(id, aggregates) {
    for (const type in aggregates) {
      const aggregate = `${type}-${aggregates[type]}`;

      const params = {
        TableName: process.env.AGGREGATES_TABLE,
        Key: { aggregate },
        ExpressionAttributeNames: {
          '#type': 'type',
          '#count': 'count',
          '#ids': 'ids',
        },
        ExpressionAttributeValues: {
          ':type': type,
          ':none': 0,
          ':decrement': 1,
          ':ids': this.db.createSet([id]),
        },
        UpdateExpression: 'SET #type = if_not_exists(#type, :type), #count = if_not_exists(#count, :none) - :decrement DELETE #ids :ids',
        ReturnValues: 'ALL_NEW',
      };

      this.db.update(params).promise();
    }
  }

  async get(aggregate) {
    const params = {
      TableName: process.env.AGGREGATES_TABLE,
      Key: { aggregate },
    };

    return this.db.get(params).promise();
  }

  async getByType(type) {
    const params = {
      TableName: process.env.AGGREGATES_TABLE,
      IndexName: process.env.AGGREGATES_TYPE_INDEX,
      KeyConditionExpression: "#type = :type",
      ExpressionAttributeNames: {
        '#type': 'type',
        '#aggregate': 'aggregate',
        '#count': 'count',
        '#ids': 'ids',
      },
      ExpressionAttributeValues: {
        ':type': type,
        ':zero': 0,
      },
      FilterExpression: '#count > :zero',
      ProjectionExpression: '#type, #aggregate, #count, #ids',
      ScanIndexForward: false,
    };

    return this.db.query(params).promise();
  }
}

export default Article
