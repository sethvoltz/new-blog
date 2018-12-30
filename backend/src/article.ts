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

  async bulkGet(ids) {
    const params = {
      RequestItems: {
        [process.env.ARTICLES_TABLE]: {
          Keys: ids.map(id => ({ id })),
        },
      },
    };

    return this.db.batchGet(params);
  }

  async create(article) {
    const timestamp = new Date();
    const id = uuid.v4();
    const params = {
      TableName: process.env.ARTICLES_TABLE,
      Item: Object.assign({
        id,
        createdAt: timestamp.getTime(),
        updatedAt: timestamp.getTime(),
        aggregates: {
          month: format(timestamp, 'YYYY-MM'),
          year: format(timestamp, 'YYYY'),
          [format(timestamp, 'YYYY')]: format(timestamp, 'MM'),
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

  async archiveAllMonths() {
    const aggregate = new Aggregate();
    return aggregate.getByType('month');
  }

  async archiveAllYears() {
    const aggregate = new Aggregate();
    return aggregate.getByType('year');
  }

  // year: yyyy
  async archiveMonthsByYear(year) {
    const aggregate = new Aggregate();
    return aggregate.getByType(year);
  }

  // monthCode: yyyy-mm
  async archiveByMonth(monthCode) {
    const aggregate = new Aggregate();
    return aggregate.get(`month-${monthCode}`);
  }

  // // monthCode: yyyy-mm
  // async getByMonth(monthCode) {
  //   const aggregate = new Aggregate();
  //   const results = await aggregate.get(`month-${monthCode}`);
  //   return this.bulkGet((results.Item || {}).ids || []);
  // }

  // // year: yyyy
  // async getByYear(year) {
  //   const aggregate = new Aggregate();
  //   const results = await aggregate.get(`year-${year}`);
  //   return this.bulkGet((results.Item || {}).ids || []);
  // }
}

export default Article
