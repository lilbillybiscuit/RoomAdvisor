const pool = require("@utils/database/pool");

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

// get comments

const getComments = (request, response) => {
    const rid = request.params.rid
    if (rid == NULL) { // if no room provided return all comments
        pool.query('SELECT * FROM comments', (error, results) => {
            if (error) {
            throw error
            }
            response.status(200).json(results.rows)
        })
    } else { // if room provided return those comments
        pool.query('SELECT * FROM comments WHERE roomid = $1', [rid], (error, results) => {
            if (error) {
            throw error
            }
            response.status(200).json(results.rows)
        })
    }
    
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
    pool.query('UPDATE comments SET review = $1, rating = $2, updated_at = NOW() WHERE uid = $3', [review, rating, uid], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}



module.exports = { 
    getComment,
    getComments,
    getReviews,
    getRatings,
    addComment,
    deleteReview,
    deleteRating,
    editComment
}




// TO DELETE
exports.getReviews = function (request, result) {
    const str = [
        {
            name: "ViewReviews",
            msg: "Test",
        }
    ];
    result.json(str);
}

exports.addFavorite = function (request, result) {
    result.end("NA");
}