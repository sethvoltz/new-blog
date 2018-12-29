'use strict';

import Article from './article';
import { eventNames } from 'cluster';

export const listArticles = async (event, context) => {
  try {
    const article = new Article();
    const result = await article.index();

    return {
      statusCode: 200,
      body: JSON.stringify({data: result.Items}),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching articles',
        error,
      }),
    };
  }
};

export const getArticle = async (event, context) => {
  try {
    const article = new Article();
    const result = await article.get(event.pathParameters.id);

    return {
      statusCode: 200,
      body: JSON.stringify({data: result.Item}),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching article',
        error,
      }),
    };
  }
}

export const createArticle = async (event, context) => {
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Malformed request',
        error,
      }),
    }
  }

  try {
    const article = new Article();
    const result = await article.create(data);

    return {
      statusCode: 200,
      body: JSON.stringify({data: result}),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Could not create article',
        error,
      }),
    }
  }
};

export const updateArticle = async (event, context) => {
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Malformed request',
        error,
      }),
    }
  }

  try {
    const article = new Article();
    const result = await article.update(event.pathParameters.id, data);

    return {
      statusCode: 200,
      body: JSON.stringify({data: result}),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Could not update article',
        error,
      }),
    }
  }
};

export const deleteArticle = async (event, context) => {
  try {
    const article = new Article();
    const result = await article.delete(event.pathParameters.id);

    return {
      statusCode: 200,
      body: JSON.stringify({data: result.Attributes}),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Could not update article',
        error,
      }),
    }
  }
};

export const articleCompute = async (event, context) => {
  event.Records.forEach((record) => {
    console.log(record.eventID)
    console.log(record.eventName)
    console.log('DynamoDB Record: %j', record.dynamodb)
    if (record.eventName === 'INSERT') {
      console.log('INSERT EVENT. DO WELCOME STUFF')
    }
    if (record.eventName === 'REMOVE') {
      console.log('REMOVAL EVENT. DO REMOVAL STUFF')
    }
  });

  return { message: `Successfully processed ${event.Records.length} records.`, event };
};
