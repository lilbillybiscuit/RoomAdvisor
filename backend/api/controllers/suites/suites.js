var pool = require("@utils/database/pool");



/**
* getSuites gets all suites matching the conditionals
* request query params = optional conditionals
* result json = array of suites
*/
exports.getSuites = function (request, result) {
    
    //Define request parameters
    const college_req = request.body.college || '%';
    const entryway_req = request.body.entryway || '%';
    const numpeople_req = request.body.numpeople || '%';
    const numsingles_req = request.body.numsingles || '%';
    const numdoubles_req = request.body.numdoubles || '%';

    //Get suites based on those parameters
    pool.query(`SELECT * FROM roomadvisor_suites WHERE college like '${college_req}' AND entryway like '${entryway_req}' AND numpeople::text like '${numpeople_req}' AND numsingles::text like '${numsingles_req}' AND numdoubles::text like '${numdoubles_req}'`, (error, results) => {
        if (error) {
            throw error
        }
        return result.status(200).json(results.rows)
    })
}



/**
 * getSuiteInfo gets the info on a suite given the ID
 * request params = suite ID
 * result json = suite info
 */
exports.getSuiteInfo = function (request, result) {

    const suite_id = request.params.id

    pool.query(`SELECT * FROM roomadvisor_suites WHERE id like '${suite_id}'`, (error, results) => {

        if (error) {
            throw error
        }

        if (results.rows.length == 0) {
            return result.status(404).json("Suite not found.")
        } else {
            return result.status(200).json(results.rows)
        }
    })
}



/**
 * addSuite takes all parameters needed for a new suite and makes that suite
 * request **JSON**:
 * {
"college": "string",
"entryway": "string",
"suite_number": "string",
"accessible": "boolean",
"pictures": [
    "string"
],
"size": "float",
"owners": [
    "string"
],
"numpeople": "number",
"numdoubles": "number",
"numsingles": "number",
"rooms": [
    "string"
]
}
* result json = new suite that was created
*/
exports.addSuite = function (request, result) {

    //Define variables to grab from JSON
    var college_req
    var entryway_req
    var suite_number_req
    var new_id
    var accessible_req
    var pictures_req
    var size_req
    var owners_req
    var user_id_req
    var name_req
    var url_req
    var numpeople_req
    var numdoubles_req
    var numsingles_req
    var rooms_req

    //Try to grab from JSON. If any don't exist, bad request
    try {
        college_req = request.body.college
        entryway_req = request.body.entryway
        suite_number_req = request.body.suite_number
        new_id = createID(college_req, suite_number_req)
        accessible_req = request.body.accessible
        pictures_req = JSON.stringify(request.body.pictures).replace('[', '{').replace(']', '}')
        size_req = request.body.size

        owners_req = updateOwnersAndCreateArr(request.body.owners)

        if(owners_req === "bad") {
            return result.status(400).json("Bad Request")
        }
        numpeople_req = request.body.numpeople
        numdoubles_req = request.body.numdoubles
        numsingles_req = request.body.numsingles
        rooms_req = JSON.stringify(request.body.rooms).replace('[', '{').replace(']', '}')

    } catch (error) {
        return result.status(400).json("Bad Request")
    }

    //Insert variables into sql array
    pool.query(`INSERT INTO roomadvisor_suites
    (id, college, entryway, suite_number, accessible, pictures, size, owners,
    numpeople, numdoubles, numsingles, rooms)
    VALUES ('${new_id}', '${college_req}', '${entryway_req}', '${suite_number_req}',
    '${accessible_req}', '${pictures_req}', '${size_req}', '${owners_req}','${numpeople_req}',
    '${numdoubles_req}', '${numsingles_req}', '${rooms_req}') RETURNING *`, (error, results) => {
    
        if (error) {
            return result.status(400).json("Bad Request")
        }

        return result.status(201).json(results.rows)
    })
}



//Temp/possible generator for suite ID
function createID(college, suite_number) {

    const lettersnumbers = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var length = 0
    var id = ""

    while (length < 6) {
        id += lettersnumbers.charAt(Math.floor(Math.random() * lettersnumbers.length));
        length += 1;
    }

    space_ind = college.indexOf(' ')

    if(space_ind > -1) {
        return college.substring(0, space_ind) + "-" +
        college.substring(space_ind + 1, college.length)
        + "-" + suite_number + "-" + id
    } else {
        return college + "-" + suite_number + "-" + id 
    }
}

function updateOwnersAndCreateArr(owners) {

    var res = "{"

    for(var i = 0; i < owners.length; i++) {
        //Define owner variables
        user_id_req = owners[i].user_id
        name_req = owners[i].name
        url_req = owners[i].url
        
        //If any are null, bad request
        if(user_id_req == null || name_req == null || url_req == null) {
            return "bad"
        }

        //See if owner already exists
        pool.query(`SELECT * from roomadvisor_owners WHERE user_id like '${user_id_req}'`, (err, res) => {

            //If not, insert it into owner table
            if(res.rows.length === 0) {
                pool.query(`BEGIN; INSERT INTO roomadvisor_owners (user_id, name, url)
            VALUES ('${user_id_req}', '${name_req}', '${url_req}'); COMMIT;`, (error, results) => {
                
                if(error) {
                    return "bad"
                }

            })

            //Otherwise, update its data if necessary
            } else {
                pool.query(`BEGIN; UPDATE roomadvisor_owners SET name = '${name_req}', url = '${url_req}' WHERE
                user_id like '${user_id_req}'; COMMIT;`
                , (error, results) => {
                
                if(error) {
                    return "bad"
                }

            })

            }
        })

        res += user_id_req + ", "
    }

    res = res.substring(0, res.length - 2) + "}"
    return res
}



/**
 * delSuite deletes a suite based on a given suite ID
 * request params = suite ID
 * result json = empty if succcessful
 */
exports.delSuite = function (request, result) {

    del_id = request.params.id

    //Check if suite exists, and delete it if so
    pool.query(`SELECT * from roomadvisor_suites WHERE id like '${del_id}'`, (err, res) => {
        if(res.rows.length == 0) {
            return result.status(404).json("Suite not found.")
        } else {
            pool.query(`DELETE FROM roomadvisor_suites WHERE id like '${del_id}'`, (error, results) => {      
                return result.status(204).json("")
            })
        }
    })
}



/**
 * modSuite modifies a suite based on a given suite ID
 * request params = suite ID
 * request **JSON** = all variables wanting to change, as noted in the json
 shown in the addSuite function
* result json = the new, modified suite object
*/
exports.modSuite = function (request, result) {

    const mod_id = request.params.id

    //Define variables to grab from JSON
    var college_req = request.body.college || ""
    var entryway_req = request.body.entryway || ""
    var suite_number_req = request.body.suite_number || ""
    var accessible_req = request.body.accessible || ""
    var pictures_req = request.body.pictures || ""
    var size_req = request.body.size || ""
    var owners_req = request.body.owners || ""
    var numpeople_req = request.body.numpeople || ""
    var numdoubles_req = request.body.numdoubles || ""
    var numsingles_req = request.body.numsingles || ""
    var rooms_req = request.body.rooms || ""

    //HARD CODED check each suite variable to see if it needs to be updated
    var query_str = "UPDATE roomadvisor_suites SET "

    if(college_req != "") {
        query_str += "college = \'" + college_req + "\', "
    }

    if(entryway_req != "") {
        query_str += "entryway = \'" + entryway_req + "\', "
    }

    if(suite_number_req != "") {
        query_str += "suite_number = \'" + suite_number_req + "\', "
    }

    if(accessible_req != "") {
        query_str += "accessible = \'" + accessible_req + "\', "
    }

    if(pictures_req != "") {
        query_str += "pictures = \'" + JSON.stringify(pictures_req).replace('[', '{').replace(']', '}') + "\', "
    }

    if(size_req != "") {
        query_str += "size = \'" + size_req + "\', "
    }

    if(owners_req != "") {
        owners_req = updateOwnersAndCreateArr(owners_req)
        query_str += "owners = \'" + owners_req + "\', "
    }

    if(numpeople_req != "") {
        query_str += "numpeople = \'" + numpeople_req + "\', "
    }

    if(numdoubles_req != "") {
        query_str += "numdoubles = \'" + numdoubles_req + "\', "
    }

    if(numsingles_req != "") {
        query_str += "numsingles = \'" + numsingles_req + "\', "
    }

    if(rooms_req != "") {
        query_str += "rooms = \'" + JSON.stringify(rooms_req).replace('[', '{').replace(']', '}') + "\', "
    }

    query_str = query_str.substring(0, query_str.length - 2) + " WHERE id like \'" + mod_id + "\' RETURNING *"
    
    pool.query(`${query_str}`, (error, results) => {

        if (results.rows.length === 0) {
            return result.status(404).json("Suite not found.")
        }
        
        return result.status(200).json(results.rows)
    })
}
