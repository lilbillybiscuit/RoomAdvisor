const pool = require("@utils/database/pool");



/**
* getRooms gets all rooms under a given suite ID
* request params = suite id
* result json = array of room jsons
*/
exports.getRooms = function (request, result) {
    
    //Define request parameters
    const suite_id = request.params.id;

    //Get suites based on those parameters
    pool.query(`SELECT * FROM roomadvisor_rooms WHERE suite like '${suite_id}'`, (error, results) => {
        if (error) {
            throw error
        }
        return result.status(200).json(results.rows)
    })
}



/**
 * getRoomInfo gets the info on a room given the ID
 * request QUERY params = id
 * result json = room info
 */
exports.getRoomInfo = function (request, result) {
    const room_id = request.query.room_id

    pool.query(`SELECT * FROM roomadvisor_rooms WHERE id like '${room_id}'`, (error, results) => {

        if (error) {
            throw error
        }
        
        if (results.rows.length == 0) {
            return result.status(404).json("Room not found.")
        } else {
            return result.status(200).json(results.rows)
        }
    })
}



/**
 * addRoom takes all parameters needed for a new room and makes that room
 * TWO OPTIONS
 * Option 1: Create a room as part of a suite:
 * request **JSON**:
 * {
    "id": "string",
    "suite": "string",
    "tag": "string",
    "accessible": "boolean",
    "pictures": [
      "string"
    ],
    "size": "float",
    "owners": [
      "string"
   ],
   "single": "boolean"
   "standalone": "boolean" -> will be false, in this case
}
* OPTION 2: Create a standalone room
request **JSON**:
 * {
    "id": "string",
    "suite": "string",
    "tag": "string",
    "accessible": "boolean",
    "pictures": [
      "string"
    ],
    "size": "float",
    "owners": [
      "string"
   ],
   "single": "boolean"
   "standalone": "boolean" -> will be true

   *****
   TWO NEW VARIABLES IN JSON FOR SIMULT SUITE CREATION
   *****

   "college": "string"
   "entryway": "string"
}
* result json = new room that was created
*/
exports.addRoom = async function (request, result) {

    //Define variables to grab from JSON
    var suite_req
    var tag_req
    var new_id
    var accessible_req
    var pictures_req
    var size_req
    var owners_req
    var single_req
    var standalone_req

    //Try to grab from JSON. If any don't exist, bad request
    try {
        standalone_req = request.body.standalone

        suite_req = request.body.suite;
        tag_req = request.body.tag;
        accessible_req = request.body.accessible

        //Must stringify and change brackets to braces for json arrays to go into sql table
        pictures_req = JSON.stringify(request.body.pictures).replace('[', '{').replace(']', '}')
        size_req = request.body.size
        owners_req = updateOwnersAndCreateArr(request.body.owners)

        single_req = request.body.single
        if(standalone_req) {
            arr = createIDAndSuite(request.body, pictures_req, owners_req)
            new_id = arr[0]
            suite_req = arr[1]
            if(new_id === "bad") {
                throw error;
            }
        } else {
            new_id = await createIDFromSuite(suite_req, tag_req)
        }
    } catch (error) {
        return result.status(400).json("Bad Request")
    }

    //Insert variables into sql array
    pool.query(`INSERT INTO roomadvisor_rooms
    (id, suite, tag, accessible, pictures, size, owners, single, standalone)
    VALUES ('${new_id}', '${suite_req}', '${tag_req}', '${accessible_req}',
    '${pictures_req}', '${size_req}', '${owners_req}', '${single_req}', '${standalone_req}')
    RETURNING *`, (error, results) => {
    
        if (error) {
            return result.status(400).json("Bad Request")
        }

        return result.status(201).json(results.rows)
    })
}



//Generator for suite ID and push new ID to already existing suite
async function createIDFromSuite(suite_id, room_tag) {
    const lettersnumbers = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var length = 0
    var id = ""
    while (length < 6) {
        id += lettersnumbers.charAt(Math.floor(Math.random() * lettersnumbers.length));
        length += 1;
    }

    suite_parts = (suite_id).split("-")

    res = id + "-" + suite_parts[suite_parts.length - 2] + "-room" + room_tag

    var rooms_all = await pool.query(`SELECT rooms from roomadvisor_suites WHERE id like
    '${suite_id}';`)

    if(rooms_all.rows.length === 0) {
        return "bad"
    }

    rooms_all = rooms_all.rows[0].rooms



    ///////THIS USES THE API TO PUSH TO THE DATABASE. PLEASE CHANGE
    rooms_all.push("https://example.roomadvisor.io/api/rooms/" + res)


    rooms_all = JSON.stringify(rooms_all).replace("[", "{").replace("]", "}")

    //Pushes new room into roomadvisor_suite array
    pool.query(`UPDATE roomadvisor_suites SET rooms = '${rooms_all}' WHERE id
    like '${suite_id}'`, (error, results) => {
        if (error) {
            throw error;
        }
    })

    return res
}



//Only creates a room ID from suite ID and room tag
function createRoomID(suite_id, room_tag) {
    const lettersnumbers = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var length = 0
    var id = ""
    while (length < 6) {
        id += lettersnumbers.charAt(Math.floor(Math.random() * lettersnumbers.length));
        length += 1;
    }

    suite_parts = (suite_id).split("-")

    res = id + "-" + suite_parts[suite_parts.length - 2] + "-room" + room_tag

    return res
}



//Creates room/suites IDs and related suite for standalone room
function createIDAndSuite(room_data, pictures, owners) {

    suite_id = createStandaloneSuiteID(room_data.college, room_data.entryway, room_data.tag)
    created_id = createRoomID(suite_id, room_data.tag)
    id_for_rooms = "https://example.roomadvisor.io/api/rooms/" + created_id

    rooms = `{"${id_for_rooms}"}`
    if(room_data.college == null || room_data.entryway == null) {
        return "bad"
    }

    pool.query(`INSERT INTO roomadvisor_suites (id, college, entryway, suite_number,
        accessible, pictures, size, owners, numpeople, numdoubles, numsingles, rooms)
        VALUES ('${suite_id}', '${room_data.college}', '${room_data.entryway}',
        '${room_data.tag}', '${room_data.accessible}', '${pictures}', '${room_data.size}',
        '${owners}', '1', '0', '1', '${rooms}')`, (error, results) => {
        if (error) {
            throw error
        }
    })
    return [created_id, suite_id]
}



//Temp/possible generator for suite ID for standalone room
function createStandaloneSuiteID(college, entryway, tag) {
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
        college.substring(space_ind + 1, college.length) + "-" + entryway
         + tag + "-" + id
    } else {
        return college + "-" + entryway + tag + "-" + id 
    }
}



//Function that creates owner objects and then creates new owner id array for suite
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

    //Edge case. If there are no owners yet, return empty postgresql array
    if(res === "{") {
        return "{}"
    }

    res = res.substring(0, res.length - 2) + "}"
    return res
}



/**
 * delRoom deletes a room based on a given room ID
 * request params = room ID
 * result json = empty if succcessful
 */
exports.delRoom = function (request, result) {

    del_id = request.params.id

    //Check if room exists
    pool.query(`SELECT * from roomadvisor_rooms WHERE id like '${del_id}'`, (err, res) => {
        if(res.rows.length == 0) {
            return result.status(404).json("Room not found.")
        } 
        
        //If it does exist, and the room is standalone
        else if(res.rows[0].standalone) {
            //Delete the related suite object
            pool.query(`DELETE FROM roomadvisor_suites WHERE id like '${res.rows[0].suite}'`, (error, results) => {
                if (error) {
                    throw error;
                }
            })

            //Delete the related room object
            pool.query(`DELETE FROM roomadvisor_rooms WHERE id like '${del_id}'`, (error, results) => {      
                return result.status(200).json({
                    message: "Room " + del_id + " deleted successfully",
                })
            })
        }
        //If the room exists, and it is not standalone
        else {
            //Get list of rooms from suite
            pool.query(`SELECT rooms from roomadvisor_suites WHERE id like
            '${res.rows[0].suite}'`, (error, results) => {
                if (error) {
                    throw error;
                }
                //Get list of rooms alone
                rooms_lst = results.rows[0].rooms

                //Remove the room we are deleting
                rooms_lst.splice(rooms_lst.indexOf("https://example.roomadvisor.io/api/rooms/" + del_id), 1)

                rooms_lst = JSON.stringify(rooms_lst).replace("[", "{").replace("]", "}")

                //Update suite with new rooms array
                pool.query(`UPDATE roomadvisor_suites SET rooms = '${rooms_lst}' WHERE id
                like '${res.rows[0].suite}'`, (error, results) => {
                    if (error) {
                        throw error;
                    }
                })

            })

            //Delete the room
            pool.query(`DELETE FROM roomadvisor_rooms WHERE id like '${del_id}'`, (error, results) => {      
                return result.status(200).json({
                    message: "Room " + del_id + " deleted successfully",
                })
            })
        }
    })
}



/**
 * modRoom modifies a room based on a given room ID
 * request params = room ID
 * request **JSON** = all variables wanting to change, as noted in the json
 shown in the addRoom function
 * NOTE: only allowed to change tag, accessible, pictures, size, owners,
 * and single right now.
* result json = the new, modified eoom object
*/
exports.modRoom = function (request, result) {

    const mod_id = request.params.id

    //Define variables to grab from JSON
    var tag_req = request.body.tag || ""
    var accessible_req = request.body.accessible || ""
    var pictures_req = request.body.pictures || ""
    var size_req = request.body.size || ""
    var owners_req = request.body.owners || ""
    var single_req = request.body.single || ""

    //HARD CODED check each room variable to see if it needs to be updated
    var query_str = "UPDATE roomadvisor_rooms SET "

    if(tag_req != "") {
        query_str += "tag = \'" + tag_req + "\', "
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

    //Similar function as in addSuite, adds and updates owners table
    if(owners_req != "") {
        owners_req = updateOwnersAndCreateArr(request.body.owners)
        query_str += "owners = \'" + owners_req + "\', "
    }

    if(single_req != "") {
        query_str += "single = \'" + single_req + "\', "
    }

    query_str = query_str.substring(0, query_str.length - 2) + " WHERE id like \'" + mod_id + "\' RETURNING *"

    pool.query(`${query_str}`, (error, results) => {

        if (error) {
            return result.status(400).json("Bad Request: No parameters given.")
        }

        if (results.rows.length === 0) {
            return result.status(404).json("Room not found.")
        }
        
        return result.status(200).json(results.rows)
    })
}
