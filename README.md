# NodeSearch
Node.js server search add-on to ServiceRegistry

copy server.js to target directory
open server.js 
check mongoConnStr username, pwd, host, port and db name are correct, 
eg mongoConnStr ="mongodb://Service:dhrproject@localhost:27017/ServiceRegistry”;
(string format mongodb://username:password@serve:port/DB name)

MongoDB should be updated with following indeces:
db.serviceregistry.createIndex({"$**":"text"},{ default_language: "finnish" })
db.serviceregistry.createIndex({"serviceDescription.serviceDataDescription.dataset.serviceDataType":1})

npm init
accept defaults, make sure entry point: (server.js)
npm install express --save
npm install mongodb --save
npm install --save object-assign
