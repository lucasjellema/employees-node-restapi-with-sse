# employees-node-restapi-with-sse
Originally created for Oracle OpenWorld 2016, a REST/JSON API implemented with Node.JS and Express on top of PL/SQL API in Oracle Database

Support for SSE (Server Side Events)
Uses oracledb node database driver to invoke PL/SQL API
Can poll database for changes or receive push from sources (for example from Database trough UTL_HTTP) to be notified about changes (that should be pushed over SSE)

Works together with PL/SQL API defined in Git Repo https://github.com/lucasjellema/oracle-database-plsql-json-api 
