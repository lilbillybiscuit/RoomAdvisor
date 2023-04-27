require('module-alias/register')
const pool = require("@utils/database/pool")

// create users table
const createUsersTable = () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

    return pool.query(queryText);
};

// create reviews table
const createReviewsTable = () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS comments (
      uid SERIAL PRIMARY KEY,
      netid VARCHAR(60),
      roomid VARCHAR(60),
      review TEXT NOT NULL,
      rating REAL NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

    return pool.query(queryText);
};

// create comments table
const createCommentsTable = () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS comments (
      comment_id SERIAL PRIMARY KEY,
      review_id INTEGER REFERENCES reviews(review_id),
      parent_comment_id INTEGER REFERENCES comments(comment_id),
      user_id INTEGER REFERENCES users(user_id),
      text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

    return pool.query(queryText);
};

// create images table
const createImagesTable = () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS images (
      image_id SERIAL PRIMARY KEY,
      url VARCHAR(500) NOT NULL,
      item_id INTEGER REFERENCES items(item_id),
      review_id INTEGER REFERENCES reviews(review_id),
      comment_id INTEGER REFERENCES comments(comment_id)
    )
  `;

    return pool.query(queryText);
};

// execute all table creation queries
Promise.all([
    createUsersTable(),
    createReviewsTable(),
    createCommentsTable(),
    // createImagesTable()
])
    .then(() => console.log('Tables created successfully'))
    .catch(error => console.error('Error creating tables', error))
    .finally(() => pool.end());