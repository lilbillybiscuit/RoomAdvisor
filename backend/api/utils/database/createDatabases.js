const { Pool } = require('pg');

const pool = new Pool({
    user: 'your-username',
    host: 'your-hostname',
    database: 'your-database-name',
    password: 'your-database-password',
    port: 'your-database-port'
});

// create users table
const createUsersTable = () => {
    const queryText = `
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

    return pool.query(queryText);
};

// create items table
const createItemsTable = () => {
    const queryText = `
    CREATE TABLE items (
      item_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

    return pool.query(queryText);
};

// create reviews table
const createReviewsTable = () => {
    const queryText = `
    CREATE TABLE comments (
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
    CREATE TABLE comments (
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
    CREATE TABLE images (
      image_id SERIAL PRIMARY KEY,
      url VARCHAR(500) NOT NULL,
      item_id INTEGER REFERENCES items(item_id),
      review_id INTEGER REFERENCES reviews(review_id),
      comment_id INTEGER REFERENCES comments(comment_id)
    )
  `;

    return pool.query(queryText);
};

const createSuitesTable = () => {
    const queryText = `
    CREATE TABLE suites (
      id varchar(255),
      college varchar(255),
      entryway varchar(255),
      suite_number varchar(255),
      accessible boolean,
      pictures varchar(255)[],
      size float,
      owners varchar(255)[],
      numpeople integer,
      numdoubles integer,
      numsingles integer,
      rooms varchar(255)[]
    )
    `

    return pool.query(queryText)
}

const createRoomsTable = () => {
  const queryText = `
  CREATE TABLE rooms (
    id varchar(255),
    suite varchar(255),
    tag varchar(255),
    accessible boolean,
    pictures varchar(255)[],
    size float,
    owners varchar(255)[],
    single boolean,
    standalone boolean
  )  
  `

  return pool.query(queryText)
}

const createOwnersTable = () => {
  const queryText = `
  CREATE TABLE owners (
    user_id varchar(255),
    name varchar(255),
    url varchar(255)
  )
  `

  return pool.query(queryText)
}

// execute all table creation queries
Promise.all([
    createUsersTable(),
    createItemsTable(),
    createReviewsTable(),
    createCommentsTable(),
    createImagesTable(),
    createSuitesTable(),
    createRoomsTable(),
    createOwnersTable()
])
    .then(() => console.log('Tables created successfully'))
    .catch(error => console.error('Error creating tables', error))
    .finally(() => pool.end());