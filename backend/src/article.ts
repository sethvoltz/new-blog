import { DynamoDB } from 'aws-sdk';
import * as dynamodb from 'serverless-dynamodb-client';
import * as uuid from 'uuid';
import { format } from 'date-fns';

import Validator from './validator';
import Aggregate from './aggregate';

declare var process: {
  env: {
    ARTICLES_TABLE: string, // guarantee this exists
    IS_OFFLINE: boolean,
  },
};

class Article {
  db: DynamoDB.DocumentClient;
  validator: Validator;

  constructor() {
    this.db = dynamodb.doc;
    this.validator = new Validator();
  }

  index() {
    const params = {
      TableName: process.env.ARTICLES_TABLE,
    };

    return this.db.scan(params).promise();
  }

  async get(id) {
    const params = {
      TableName: process.env.ARTICLES_TABLE,
      Key: { id },
    };

    return this.db.get(params).promise();
  }

  async create(article) {
    const timestamp = new Date().getTime();
    const id = uuid.v4();
    const params = {
      TableName: process.env.ARTICLES_TABLE,
      Item: Object.assign({
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
        aggregates: {
          monthly: format(new Date(timestamp), 'YYYY-MM'),
        }
      }, article),
    };

    await this.validator.validate(article, '/Article');
    await this.db.put(params).promise();
    return params.Item;
  }

  async update(id, article) {
    const timestamp = new Date().getTime();
    const params = {
      TableName: process.env.ARTICLES_TABLE,
      Key: { id },
      ExpressionAttributeValues: {
        ':title': article.title,
        ':content': article.content,
        ':updatedAt': timestamp,
      },
      UpdateExpression: 'SET title = :title, content = :content, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW',
    };

    await this.validator.validate(article, '/Article');
    return this.db.update(params).promise();
  }

  async delete(id) {
    const params = {
      TableName: process.env.ARTICLES_TABLE,
      Key: { id },
      ReturnValues: 'ALL_OLD',
    };

    return this.db.delete(params).promise();
  }

  async archiveMonths() {
    const aggregate = new Aggregate();
    return aggregate.getByType('monthly');
  }

  // monthCode: yyyy-mm
  async getByMonth(monthCode) {
    const aggregate = new Aggregate();
    const results = await aggregate.get(`monthly-${monthCode}`);
    const params = {
      RequestItems: {
        [process.env.ARTICLES_TABLE]: {
          Keys: (results.Item || {}).ids.map(id => ({ id })),
        },
      },
    };
    return this.db.batchGet(params);
  }
}

export default Article
