var https = require('https'),
    http = require('http'),
    fs = require('fs'),
	url = require('url'),
//	request = require('request'),
	qs = require('querystring'),
	bodyParser = require('body-parser'),
    dateFormat = require('dateformat');
// not available locally, only on ACCS 
var oracledb = require('oracledb');
var sseMW = require('./sse');

var utils = require( "./proxy-utils.js" );
var settings = require( "./proxy-settings.js" );

var APP_VERSION = settings.APP_VERSION;


var employeesAPI = module.exports;
var apiURL = "/employee-api";

 // Realtime updates
var sseClients = new sseMW.Topic();
var votePollIntervalInSeconds = 2;

employeesAPI.registerListeners =
function(app) {
    // register for Server Sent Events
    console.log("go add sse");
    app.use(sseMW.sseMiddleware)

    app.get(apiURL+ '/about', function(req,res){
      console.log('employees-api'); 
      handleAbout(req, res); 
    } );
    app.get(apiURL+'/employees', function(req,res){
      handleGetEmployees(req, res); 
    } );
    app.get(apiURL+'/events', function(req,res){
      handleGetEvents(req, res); 
    } );
    app.get(apiURL+'/startpolling', function(req,res){
      console.log("start polling");
      initHeartbeat(4); 
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(  {"msg":"started polling"}));
        return;
    } );
    app.get(apiURL+'/employees/updates', function(req,res){
        console.log("coming for employees/updates");
        console.log("res (should have sseConnection)= "+res.sseConnection);
      var sseConnection = res.sseConnection;
        console.log("sseConnection= ");
      sseConnection.setup();
      sseClients.add(sseConnection);
//        console.log("send msg to new sseConnection");
//      sseConnection.send(      JSON.stringify({ "id" : 13, "newVoteCount": 42+parseInt(new Date().getMilliseconds())}));
    } );
    app.get(apiURL+'/votes', function(req,res){
        console.log("handle get votes");
      handleGetPresidentialVotes(req, res); 
    } );
    app.get(apiURL+'/employees/:employeeId', function(req,res){
      handleGetEmployee(req, res); 
    } );
    app.post(apiURL+'/employees/:employeeId/vote', function(req,res){
        console.log("handle post vote");
      handlePostVoteForEmployee(req, res); 
    } );

    app.get(apiURL+'/departments/:departmentId', function(req,res){
      console.log('employees-api/departments'); 
      handleGetDepartments(req, res); 
    } );
    app.post(apiURL+'/*', function(req,res){ employeesAPI.handlePost(req, res); });


    app.get(apiURL+'/*', function(req,res){
      console.log('employees-api'); 
      handleGet(req, res); 
    } );
}//registerListeners

               
function doClose(connection, resultSet)
{
  resultSet.close(
    function(err)
    {
      if (err) { console.error(err.message); }
      doRelease(connection);
    });
}

  handleGetPresidentialVotes = function (req, res) {
        retrievePresidentialVotes (req, res, function(req,res,err, result) {
            if(err) {
			  console.log('Error in execution of PL/SQL statament statement'+err.message);
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({
                status: 500,
                    message: "Error getting the presidential votes ",
                    detailed_message: err.message
               }));
	         
         } //if
         else { 
           console.log('db response with presidential votes is ready - handleGetPresidentialVotes '+JSON.stringify(result));
           res.writeHead(200, {'Content-Type': 'application/json'});
           res.end(JSON.stringify(  result.map( function(r){ return  {"id":  r.id, "votes" : r.votes};})));
           return;
         }//else 
        }); //retrievePresidentialVotes
    }//handleGetPresidentialVotes



// this function will get a JSON array with presential votes and return it to the callback function:
// callback (request, response, error, json-result)
retrievePresidentialVotes = function(req, res, callback) {
    handleDatabaseOperation( req, res, function (req, res, connection) {
    var bindvars = { cursor:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
                     };	
	  var plsqlStatement = "begin :cursor := employee_api.get_presidential_votes; end;";
      console.log('retrievePresidentialVotes: do plsqlstatement '+plsqlStatement);
      var options = {};  // commit the statement executed
      // see on ref cursor bind parameter handling: https://github.com/oracle/node-oracledb/blob/master/doc/api.md#refcursors 
	  connection.execute(   plsqlStatement , bindvars, options,  function (err, result) {
          
            if (err) {
                callback(req, res, JSON.stringify({
                status: 500,
                    message: "Error getting the presidential votes ",
                    detailed_message: err.message
                   })
  	            );  
              doRelease(connection);
              return;          
            } else {
		       console.log('db response with presidential votes is ready '+JSON.stringify(result));
		       console.log('db response with presidential votes is ready '+JSON.stringify(result.outBinds.cursor));
               console.log(result.outBinds.cursor.metaData);
               fetchVoteRowsFromRSForCallback(req, res, connection, result.outBinds.cursor, 1000, callback);
              }
          }
	  );
	});

}// retrievePresidentialVotes

function fetchVoteRowsFromRSForCallback(req, res, connection, resultSet, numRows, callback)
{
  resultSet.getRows( // get numRows rows
    numRows,
    function (err, rows)
    {
      if (err) {
        console.log(err);
        doClose(connection, resultSet); // always close the result set
                callback(req, res, JSON.stringify({
                status: 500,
                    message: "Error getting the presidential votes ",
                    detailed_message: JSON.stringify(err)
                   })
  	            );  
        return;  
      } else  {
        doClose(connection, resultSet); // always close the result set
        console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
        console.log(rows);
        callback( req,res, null
        , rows.map( function(r){ return  {"id":  r[0], "votes" : r[1]};})
        );
        return;
      }
    });
}//fetchVoteRowsFromRSForCallback


// Cast a vote
/*
employees.post('/:id/vote', (req: Request, res: Response) => {
    const employee = findEmployee(req);
    if (!employee) {
        res.sendStatus(404);
        return;
    }

    employee.votes = employee.votes + 1 || 1;
    res.sendStatus(200);

    clients.forEach(sendUpdates);
});
*/

handlePostVoteForEmployee = function(req, res) {
   var employeeIdentifier = parseInt(req.params.employeeId);
   console.log('handlePostVoteForEmployee');
   handleDatabaseOperation( req, res,  function (request, response, connection) {

      var bindvars = { employeeId: { val: employeeIdentifier , dir: oracledb.BIND_IN, type: oracledb.NUMBER }
                     , newVoteCount: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }                            
                     };	
	  var plsqlStatement = "begin employee_api.vote_for_employee(p_id => :employeeId, p_new_vote_count=> :newVoteCount); end;";
      console.log('do plsqlstatement '+plsqlStatement);
      var options = {"autoCommit":true};  // commit the statement executed
	  connection.execute(   plsqlStatement , bindvars, options,  function (err, result) {
         if(err) 
         { console.error('error in handlePostVoteForEmployee '+err.message);
           doRelease(connection); 
         } 
         else {
             //return result {"outBinds":{"newVoteCount":1}}
         console.log('return result '+JSON.stringify(result));
         var newNumberOfVotes = result.outBinds.newVoteCount;
         doRelease(connection);
         console.log('return newNumberOfVotes'+JSON.stringify(newNumberOfVotes));
         var vc = JSON.parse(newNumberOfVotes);
         console.log('vc '+JSON.stringify(vc));
         response.writeHead(200, {'Content-Type': 'application/json'});
         response.end(JSON.stringify({ "id" : employeeIdentifier, "newVoteCount": newNumberOfVotes}));
         // this next line can be used to inform all clients of the single vote that just came in
         // updateSseClients( { "id" : employeeIdentifier, "newVoteCount": newNumberOfVotes});
         }//else
       }); //callback for handleDatabaseOperation
   });//handleDatabaseOperation
} //handlePostVoteForEmployee


var m;
updateSseClients = function(message) {
    console.log("update all Sse Client with message "+message);
    var msg = message;
    this.m=message;
    sseClients.forEach( function(sseConnection) {console.log("send sse message - local msg "+this.msg);
    console.log("send sse message global m"+this.m);
    sseConnection.send(this.m); }
    , this // this second argument to forEach is the thisArg (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) 
    );
}

var latestEventVersion=-1;
initHeartbeat = function(interval) {
    console.log("set interval initHeartbeat ");
    setInterval(function()  { 
        console.log("interval expired - latestEventVersion = "+latestEventVersion); 
   retrieveEvents(null, null, latestEventVersion, function (request, response, err, eventsArray) {
      if(err) 
         { console.error('heartbeat: error in get events '+err.msg);
              retrieveEvents(null, null, 40, function (request, response, err, eventsArray) {
                  
               console.log('after error tried fetch events for set value for eventversion threshold  retrieveEvents is error?'+JSON.stringify(err));                  
               console.log('after error tried fetch events for set value for eventversion threshold  retrieveEvents is events:'+JSON.stringify(eventsArray));                  
              });

	     } 
         else {
               console.log('return result from retrieveEvents '+JSON.stringify(eventsArray));
               if (eventsArray.length>0) {
                  // check if any of the events are of type vote
                  if (eventsArray.filter( function(e){ 
                                            console.log("Filter event "+JSON.stringify(e));
                                            console.log("Eventtype:"+e.eventType);
                                            console.log("Eventversion:"+e.eventVersion);

                      if (
                      'vote'==e.eventType && latestEventVersion< e.eventVersion) return e}).length>0) {
                      console.log("there was at least one new event of type vote that is later than starting event version, so fetch new vote standings");
                      // if one of the events was of type vote then do what is required:
                      // - retrievePresidentialVotes and updateSseClients
                      retrievePresidentialVotes (null, null, function(req,res,err, result) {
                        if(err) {
			              console.log('Error while retrieving fresh presidential votes '+err.message);
                        } //if
                       else {  
                         console.log('updated presidential votes are in - retrievePresidentialVotes '+JSON.stringify(result));
                         updateSseClients(  result);
                         return;
                       }//else 
                    }); //retrievePresidentialVotes
                  }// at least one event of type vote   
                  latestEventVersion= eventsArray[0].eventVersion;
                  console.log("NEXT  latestEventVersion = "+latestEventVersion); 
               }//if any new events found
         }  //else
       }); //callback for retrieveEvents
    }//interval function
    , interval?interval*1000:3000
    ); // setInterval 3000 is 3 secs
}//initHeartbeat


employeesAPI.handlePost = 
function (req, res) {
 if (req.url.indexOf('/rest/')> -1 ) { 
   employeesAPI.handleGet(req, res);
 } else 
 {

 addToLogFile( "\n["+dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT")+"] Handle EmployeesAPI POST "+req.method+" Request to "+req.url);
 addToLogFile( "\nBody:\n"+req.body+ "\n ");
}
}

handleGet = function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Employees-API - Version "+APP_VERSION+". No Data Requested, so none is returned; try /employees or /presidentialElection or something else");
    res.write("Supported URLs:");
    res.write("incoming headers" + JSON.stringify(req.headers)); 
    res.end();
}


handleAbout = function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Employees-API - About - Version "+APP_VERSION+". ");
    res.write("Supported URLs:");
    res.write("/employees-api/employees");
    res.write("/employees-api/votes");
    res.write("/employees-api/events");
    res.write("Access the associated front end at https://data-api-lucasjellema.apaas.em2.oraclecloud.com/employees-app/demo");
    res.write("/employees-api/employees/id (e.g. /employees-api/employees/7634)");
    res.write("incoming headers" + JSON.stringify(req.headers)); 
    res.end();
}


handleGetEmployees = function (req, res) {
   console.log("get employees - we oblige");
   getEmployeesFromDBAPI(req,res);
}
handleGetEmployee = function (req, res) {
   console.log("get a single rich employee - we oblige");
   getEmployeeFromDBAPI(req,res);
}

function addToLogFile( logEntry) {
  utils.addToLogFile('employeesAPI-'+logEntry);    
}


/*
app.get('/departments/:departmentId', function(req,res){
    */
  handleGetDepartments = function (req, res) {
    var departmentIdentifier = req.params.departmentId;
    handleDatabaseOperation( req, res, function (request, response, connection) {
	  var selectStatement = "SELECT employee_id, first_name, last_name, job_id FROM employees where department_id= :department_id";
	  connection.execute(   selectStatement   
		, [departmentIdentifier], {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err) {
			  console.log('Error in execution of select statement'+err.message);
              response.writeHead(500, {'Content-Type': 'application/json'});
              response.end(JSON.stringify({
                status: 500,
                    message: "Error getting the employees for the department "+departmentIdentifier,
                    detailed_message: err.message
               })
	          );  
            } else {
		       console.log('db response is ready '+result.rows);
               response.writeHead(200, {'Content-Type': 'application/json'});
               response.end(JSON.stringify(result.rows));
              }
			doRelease(connection);
          }
	  );
	});
} //handleGetDepartments

handleGetEvents = function (req, res) {
   console.log('handleGetEvents');
   retrieveEvents(req, res, -1, function (request, response, err, eventsArray) {
      if(err) 
         { console.error('error in get events '+err.message);
              response.writeHead(500, {'Content-Type': 'application/json'});
              response.end(JSON.stringify({
                status: 500,
                    message: "Error getting the events from the database ",
                    detailed_message: err.msg
               }));
	     } 
         else {
           response.writeHead(200, {'Content-Type': 'application/json'});
           response.end(JSON.stringify(eventsArray));
         }//else
       }); //callback for handleDatabaseOperation
} //handleGetEvents


retrieveEvents = function (req, res, minEventVersionThreshold, callback) {
   console.log('retrieveEvents from DB for eventVersionThreshold :'+minEventVersionThreshold);
   handleDatabaseOperation( req, res,  function (request, response, connection) {

      var bindvars = { eventVersionThreshold: { val: minEventVersionThreshold , dir: oracledb.BIND_IN, type: oracledb.NUMBER }
                     , events: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize:4000 } };	
	  var plsqlStatement = "begin :events := event_push_manager.fetch_recent_events(p_version_threshold => :eventVersionThreshold); end;";
      console.log('do plsqlstatement '+plsqlStatement +" for eventVersionThreshold = "+minEventVersionThreshold);
	  connection.execute(   plsqlStatement , bindvars,  function (err, result) {
            if (err) {
                console.log("error getting the events "+JSON.stringify(err));
                doRelease(connection); 
                callback(req, res, JSON.stringify({
                status: 500,
                    message: "Error getting the events ",
                    msg: err.message
                   })
  	            );
            }  
         else {
           console.log('return result get events '+JSON.stringify(result));
           var events = result.outBinds.events;
           doRelease(connection);
           var evts = JSON.parse(events);
           console.log('return events'+JSON.stringify(evts));
       /*    if (evts.length>0) {
             console.log('type  first evt  to verify success'+evts[1].eventType);
             var pp = evts[1].payload.replace(/quot/g,'"'); // use /quot/g  to globally replace quot - and not just the first occurrence
             var payload = JSON.parse(pp);
             console.log('parsed payload  first evt  to verify success'+JSON.stringify(payload));
           }
         */
           // need to transform event payload to proper format
           var eventsArray = evts.map( function(event){ event.payload =  JSON.parse(event.payload.replace(/quot/g,'"')); return event;  });
           callback(req, res, null, eventsArray);
         }//else
       }); //callback for handleDatabaseOperation
   });//handleDatabaseOperation
} //retrieveEvents




/* API Design:
[{"id":1,"name":"The Boss","job":"Boss"},{"id":2,"name":"His Righthand","job":"Hand of the Boss"},{"id":3,"name":"First Employee","job":"Clerk"}]

result from Database:
[{"id":"7369","name":"SMITH","job":"CLERK"}
,{"id":"7499","name":"ALLEN","job":"SALESMAN"},{"id":"7521","name":"WARD","job":"SALESMAN"},{"id":"7566","name":"JONES","job":"MANAGER"},{"id":"7654","name":"MARTIN","job":"SALESMAN"},{"id":"7782","name":"CLARK","job":"MANAGER"},{"id":"7788","name":"SCOTT","job":"ANALYST"},{"id":"7839","name":"KING","job":"PRESIDENT"},{"id":"7844","name":"TURNER","job":"SALESMAN"},{"id":"7876","name":"ADAMS","job":"CLERK"},{"id":"7900","name":"JAMES","job":"CLERK"},{"id":"7902","name":"FORD","job":"ANALYST"},{"id":"7934","name":"MILLER","job":"CLERK"}]

id is String in Database and Number in API design
Job is initcapped in API Design

 

*/
capitalize = function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
} 

transformEmps= function (emps) {
    return emps.map( function(e){ e.id = parseInt(e.id); e.job = capitalize(e.job); e.votes = parseInt(e.votes); return e;  })
}

 getEmployeesFromDBAPI=function(req, res) {
   console.log('getEmployeesFromDBAPI');
   handleDatabaseOperation( req, res,  function (request, response, connection) {

      var bindvars = { employees: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize:4000 } };	
	  var plsqlStatement = "begin :employees := employee_json_api.get_employees_json; end;";
      console.log('do plsqlstatement '+plsqlStatement);
	  connection.execute(   plsqlStatement , bindvars,  function (err, result) {
         if(err) 
         { console.error('error in get_last_modified '+err.message);
           doRelease(connection); 
         } 
         else {
         console.log('return result '+JSON.stringify(result));
         var employees = result.outBinds.employees;
         doRelease(connection);
         var emps = JSON.parse(employees);
         console.log('return employees'+JSON.stringify(employees));
         console.log('return emps'+JSON.stringify(emps));
         console.log('name first emp to verify success'+emps[1].name);
         emps = transformEmps(emps);
         console.log('return transformed emps'+JSON.stringify(emps));
         // need to transform emps to proper format
              response.writeHead(200, {'Content-Type': 'application/json'});
               response.end(JSON.stringify(emps));
         }//else
       }); //callback for handleDatabaseOperation
   });//handleDatabaseOperation
} //getEmployeesFromDBAPI


/* API design:

{"id":1,"name":"The Boss","job":"Boss","hiredate":"2011-04-01","salary":100000,"commission":35000
, "manager":{"id":1,"name":"The Boss","job":"Boss","votes":0}
,"subordinates":[{"id":2,"name":"His Righthand","job":"Hand of the Boss"},{"id":3,"name":"First Employee","job":"Clerk"}]
,"department":{"id":100,"name":"Management","location":"Penthouse"}}

from DB:
{"id":"7782","name":"CLARK","job":"MANAGER","department_name":"Accounting","department_location":"New York","department_id":"10","salary":"2450"
,"commission":"","hiredate":"1981-06-09"
,"manager":{"id":"7839","name":"KING","job":"PRESIDENT"}
,"staff":[{"id":"7934","name":"MILLER","job":"CLERK"}]
}
*/

 transformEmp = function(emp) {
     var e = {"id": parseInt(emp.id),"name": emp.name,"job":capitalize(emp.job),"hiredate":emp.hiredate
             ,"salary":parseInt(emp.salary),"commission":parseInt(emp.commission)
             ,"manager": (emp.manager && emp.manager.id ?{"id":parseInt(emp.manager.id),"name":emp.manager.name,"job":emp.manager.job}:{})
             ,"subordinates":emp.staff.map( function(e){ var s={}; s.id = parseInt(e.id); s.job =  capitalize(e.job); s.name = e.name; return s;  })
             ,"department":{"id":parseInt(emp.department_id),"name":emp.department_name,"location":emp.department_location}
             };
     return e;
 }


 getEmployeeFromDBAPI=function(req, res) {
    var employeeIdentifier = parseInt(req.params.employeeId);
   console.log('getEmployeeFromDBAPI');
   handleDatabaseOperation( req, res,  function (request, response, connection) {

      var bindvars = { employee: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize:4000 } 
                     , employeeId: { val: employeeIdentifier , dir: oracledb.BIND_IN, type: oracledb.NUMBER }     
                     };	
	  var plsqlStatement = "begin :employee := employee_json_api.get_employee_json(p_id => :employeeId); end;";
      console.log('do plsqlstatement '+plsqlStatement);
	  connection.execute(   plsqlStatement , bindvars,  function (err, result) {
         if(err) 
         { console.error('error in getEmployeeFromDBAPI '+err.message);
           doRelease(connection); 
         } 
         else {
         console.log('return result '+JSON.stringify(result));
         var employee = result.outBinds.employee;
         doRelease(connection);
         var emp = JSON.parse(employee);
         console.log('return employee'+JSON.stringify(employee));
         console.log('return emp'+JSON.stringify(emp));
         console.log('name  emp to verify success'+emp.name);
         
         if (emp && emp.id) {
           // need to transform emps to proper format
           emp = transformEmp(emp);
           console.log('return transformed emp'+JSON.stringify(emp));     
              response.writeHead(200, {'Content-Type': 'application/json'});
              response.end(JSON.stringify(emp));
         } else {
              response.status(404)        // HTTP status 404: NotFound
                 .send('Employee Not found');             
         } // no data found     
         }//else
       }); //callback for handleDatabaseOperation
   });//handleDatabaseOperation
} //getEmployeeFromDBAPI


 // this implementation requires Promise support
 //  The native Promise implementation is used in Node 0.12 and greater. Promise support is not enabled by default in Node 0.10.
 getEmployeeFromDBAPIWithPromise=function(req, res) {
    var employeeIdentifier = parseInt(req.params.employeeId);
    var connectString = "140.86.4.91:1521/demos.lucasjellema.oraclecloud.internal";
    if  (process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR) { connectString = process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR.replace("PDB1", "demos");}
    
    
    oracledb.getConnection( {
    user          : process.env.DB_USER,
    password      : process.env.DB_PASSWORD,
    connectString : connectString
    })
    .then(function(conn) {
       var bindvars = { employee: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize:4000 } 
                      , employeeId: { val: employeeIdentifier , dir: oracledb.BIND_IN, type: oracledb.NUMBER }     
                      };	
	   var plsqlStatement = "begin :employee := employee_json_api.get_employee_json(p_id => :employeeId); end;";
       return conn.execute(
         plsqlStatement, 
         bindvars
       )
        .then(function(result) {
           var employee = result.outBinds.employee;
           var emp = JSON.parse(employee);
           if (emp && emp.id) {             
             emp = transformEmp(emp); // need to transform emps to proper format
             response.json(emp); // return transformed object as application/json
           } else {
               response.status(404)        // HTTP status 404: NotFound
                 .send('Employee Not found');             
           } // no data found     
          return conn.close();
         })
        .catch(function(err) {
           console.error(err); // todo: add better error handling!
           return conn.close();
         });
     })
    .catch(function(err) {
       console.error(err); // todo: add better error handling!
     });
} //getEmployeeFromDBAPI



function handleDatabaseOperation( request, response, callback) {
 //connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "140.86.4.91:1521/demos.lucasjellema.oraclecloud.internal",
 // var connectString = process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR.replace("PDB1", "demos");
  var connectString = "140.86.4.91:1521/demos.lucasjellema.oraclecloud.internal";
  if  (process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR) { connectString = process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR.replace("PDB1", "demos");}
  console.log('ConnectString :' + connectString);
  oracledb.getConnection(
  {
    user          : process.env.DB_USER || "hr",
    password      : process.env.DB_PASSWORD || "hr",
    connectString : connectString
  },
  function(err, connection)
  {
    if (err) {
	  console.log('Error in acquiring connection ...');
	  console.log('Error message '+err.message);

      return;
    }        
    // do with the connection whatever was supposed to be done
	console.log('Connection acquired ; go execute - call callback ');
	callback(request, response, connection);
 });
}//handleDatabaseOperation


function doRelease(connection)
{
    console.log('relese db connection' );
  connection.release(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}

// only run after the function has been created
console.log("call initHeartbeat");
initHeartbeat(votePollIntervalInSeconds);
