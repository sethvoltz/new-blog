'use strict';

import Article from './article';

// GET /articles
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

// GET /articles/{id}
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

// POST /articles
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

// POST /articles/{id}
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

// DELETE /articles/{id}
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

// POST /articles/{id}/publish
export const publishArticle = async (event, context) => {
  try {
    const article = new Article();
    const result = await article.publish(event.pathParameters.id);

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Could not publish article',
        error,
      }),
    }
  }
};

// DELETE /articles/{id}/publish
export const unpublishArticle = async (event, context) => {
  try {
    const article = new Article();
    const result = await article.unpublish(event.pathParameters.id);

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Could not unpublish article',
        error,
      }),
    }
  }
};

// GET /archives
// GET /archives/{year}
// GET /archives/{year}/{month}
export const archives = async (event, context) => {
  const article = new Article();

  let promise;
  if (event.pathParameters === null) {
    // /archives
    promise = article.archiveAllMonths()
      .then(data => (data.Items || [])
        .map(month => ({
          count: month.count,
          ids: month.ids.values,
          year: month.aggregate.split('-')[1],
          month: month.aggregate.split('-')[2],
        })));
  } else if (event.pathParameters.year && event.pathParameters.month) {
    // /archives/{year}/{month}
    promise = article.archiveByMonth(`${event.pathParameters.year}-${event.pathParameters.month}`)
      .then(data => {
        if (!data.Item) {
          return {}
        }

        return {
          count: data.Item.count,
          ids: data.Item.ids.values,
          year: data.Item.aggregate.split('-')[0],
          month: data.Item.aggregate.split('-')[1],
        }
      });
} else {
    // /archives/{year}
    promise = article.archiveMonthsByYear(event.pathParameters.year)
      .then(data => (data.Items || [])
        .map(month => ({
          count: month.count,
          ids: month.ids.values,
          year: month.aggregate.split('-')[0],
          month: month.aggregate.split('-')[1],
        })));
  }

  const result = await promise;
  return {
    statusCode: 200,
    body: JSON.stringify({data: result}),
  };
};
