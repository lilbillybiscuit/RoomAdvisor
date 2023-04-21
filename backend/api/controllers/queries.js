const Pool = require('pg').Pool
const pool = new Pool({
  user: 'carolinebaillie',
  host: 'localhost',
  database: 'api',
  port: 5432,
})

// get comment

const getComment = (request, response) => {
    const uid = request.params.uid
    pool.query('SELECT * FROM comments WHERE uid = $1', [uid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

// get reviews/ratings

const getReviews = (request, response) => {
    const rid = request.params.rid
    pool.query('SELECT review FROM comments WHERE roomid = $1', [rid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}
const getRatings = (request, response) => {
    const rid = request.params.rid
    pool.query('SELECT rating FROM comments WHERE roomid = $1', [rid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

// add review/rating

const addComment = (request, response) => {
    const roomid = request.body[0].roomid
    const review = request.body[0].review // get from input fields
    const rating = request.body[0].rating
    const netid = request.body[0].netid
    // const roomid = 'L32C'; // get from room clicked on
    // const netid = 'hid932'; // get from user
    pool.query('INSERT INTO comments (roomid, review, rating, netid) VALUES ($1, $2, $3, $4) RETURNING *', [roomid, review, rating, netid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

// delete review/rating

const deleteReview = (request, response) => {
    const uid = parseInt(request.params.uid)
    pool.query('DELETE review FROM comments WHERE uid = $1', [rid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}
const deleteRating = (request, response) => {
    const uid = parseInt(request.params.uid)
    pool.query('DELETE rating FROM comments WHERE uid = $1', [rid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

// edit review/rating

const editComment = (request, response) => {
    const uid = parseInt(request.params.uid)
    const { review, rating } = request.body[0]
    pool.query('UPDATE comments SET review = $1, rating = $2 WHERE uid = $3', [review, rating, uid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}



module.exports = { 
    getComment,
    getReviews,
    getRatings,
    addComment,
    deleteReview,
    deleteRating,
    editComment
}