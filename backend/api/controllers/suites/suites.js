var pool = require("@utils/database/pool");
  
  /**
   * getSuites gets all suites matching the conditionals
   * request query params = optional conditionals
   * result json = array of suites
   */
  exports.getSuites = function (request, result) {
      
      const college_req = request.query.college || '%';
      const entryway_req = request.query.entryway || '%';
      const numpeople_req = request.query.numpeople || '%';
      const numsingles_req = request.query.numsingles || '%';
      const numdoubles_req = request.query.numdoubles || '%';
  
      pool.query(`SELECT * FROM roomadvisor_suites WHERE college like '${college_req}' AND entryway like '${entryway_req}' AND numpeople::text like '${numpeople_req}' AND numsingles::text like '${numsingles_req}' AND numdoubles::text like '${numdoubles_req}'`, (error, results) => {
          if (error) {
              throw error
          }
          result.status(200).json(results.rows)
      })
  }
  
  /**
   * getRoomInfo gets the info on a room given the ID
   * request params = room ID
   * result json = room info
   */
  exports.getRoomInfo = function (request, result) {
  
      const room_id = request.params.id
  
      pool.query(`SELECT * FROM roomadvisor_rooms WHERE id like ${room_id}`, (error, results) => {
          if (error) {
              throw error
          }
          
          if (results.rows.length == 0) {
              result.status(404).json("Room not found.")
          } else {
              result.status(200).json(results.rows)
          }
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
              result.status(404).json("Suite not found.")
          } else {
              result.status(200).json(results.rows)
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
      {
        "user_id": "string",
        "name": "string",
        "url": "string"
      }
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
      var owners_req = ""
      var numpeople_req
      var numdoubles_req
      var numsingles_req
      var rooms_req
  
      //Try to grab from JSON. If any don't exist, bad request
      try {
          college_req = request.body.college
          entryway_req = request.body.entryway
          suite_number_req = request.body.suite_number
  
          //Temp/possible generator for suite ID
          const lettersnumbers = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
          var length = 0
          var id = ""
          while (length < 6) {
              id += lettersnumbers.charAt(Math.floor(Math.random() * lettersnumbers.length));
              length += 1;
            }
            space_ind = college_req.indexOf(' ')
          if(space_ind > -1) {
              new_id = college_req.substring(0, space_ind) + "-" +
                college_req.substring(space_ind, college_req.length)
                + "-" + suite_number_req + "-" + id
          } else {
              new_id = college_req + "-" + suite_number_req + "-" + id 
          }
  
          accessible_req = request.body.accessible
          pictures_req = JSON.stringify(request.body.pictures).replace('[', '{').replace(']', '}')
          size_req = request.body.size
          owners_req = JSON.stringify(request.body.owners).replace('[', '{').replace(']', '}')
          numpeople_req = request.body.numpeople
          numdoubles_req = request.body.numdoubles
          numsingles_req = request.body.numsingles
          rooms_req = JSON.stringify(request.body.rooms).replace('[', '{').replace(']', '}')
      } catch (error) {
          result.status(401).json("Bad Request")
          throw error
      }
  
      //Insert variables into sql array
      pool.query(`INSERT INTO roomadvisor_suites
        (id, college, entryway, suite_number, accessible, pictures, size, owners,
        numpeople, numdoubles, numsingles, rooms)
        VALUES ('${new_id}', '${college_req}', '${entryway_req}', '${suite_number_req}',
        '${accessible_req}', '${pictures_req}', '${size_req}', '${owners_req}','${numpeople_req}',
        '${numdoubles_req}', '${numsingles_req}', '${rooms_req}')`, (error, results) => {
      
          if (error) {
              throw error
          }
          
          //Get and return the new suite object
          pool.query(`SELECT * from roomadvisor_suites WHERE id like '${new_id}'`, (error_two, results_two) => {
              result.status(200).json(results_two.rows)
          })
      })
  }
  
  /**
   * delSuite deletes a suite based on a given suite ID
   * request params = suite ID
   * result json = empty if succcessful
   */
  exports.delSuite = function (request, result) {
      del_id = request.params.id
      pool.query(`SELECT * from roomadvisor_suites WHERE id like '${del_id}'`, (err, res) => {
          if(res.rows.length == 0) {
              result.status(404).json("Suite not found.")
          } else {
              pool.query(`DELETE FROM roomadvisor_suites WHERE id like '${del_id}'`, (error, results) => {      
                  result.status(204).json("")
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

    var query_str = `UPDATE roomadvisor_suites SET `

    if(college_req != "") {
        query_str += `college = '${college_req}', `
    }

    if(entryway_req != "") {
        query_str += `entryway = '${entryway_req}', `
    }

    if(suite_number_req != "") {
        query_str += `suite_number = '${suite_number_req}', `
    }

    if(accessible_req != "") {
        query_str += `accessible = '${accessible_req}', `
    }

    if(pictures_req != "") {
        query_str += `pictures = '${pictures_req}', `
    }

    if(size_req != "") {
        query_str += `size = '${size_req}', `
    }

    if(owners_req != "") {
        query_str += `owners = '${owners_req}', `
    }

    if(numpeople_req != "") {
        query_str += `numpeople = '${numpeople_req}', `
    }

    if(numdoubles_req != "") {
        query_str += `numdoubles = '${numdoubles_req}', `
    }

    if(numsingles_req != "") {
        query_str += `numsingles = '${numsingles_req}', `
    }

    if(rooms_req != "") {
        query_str += `rooms = '${rooms_req}', `
    }

    query_str = query_str.substring(0, query_str.length - 2) ` WHERE id like '${mod_id}'`

      //Insert variables into sql array
      pool.query(query_str, (error, results) => {
  
      //ACTUALLY USE "RETURNING *" FOR THIS FUNCTION AND ADDSUITE TO AVOID SECOND POOLQUERY
          if (error) {
              throw error
          }
          
          //Get and return the new suite object
          pool.query(`SELECT * from roomadvisor_suites WHERE id like '${mod_id}'`, (error_two, results_two) => {
              result.status(200).json(results_two.rows)
          })
      })
  }

