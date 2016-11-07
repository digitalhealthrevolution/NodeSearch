var express = require('express');
var app = express();
var port = 8081;
var MongoClient = require('mongodb').MongoClient;
//var mongoConnStr = "mongodb://Service:dhrproject@localhost:27017/serviceregistry";
//Dockerize: localhost -> mongo
var mongoConnStr = "mongodb://Service:dhrproject@mongo:27017/serviceregistry";
var version = "v1";
var basePath = "/api/" + version;

// MongoDB should be updated with following indeces:
// db.serviceregistry.createIndex({"$**":"text"},{ default_language: "finnish" })
// db.serviceregistry.createIndex({"serviceDescription.serviceDataDescription.dataset.serviceDataType":1})
app.get(basePath + '/services/search', function (req, res, next){
  
  var searchTerm = req.query.searchTerm;
  var serviceType = req.query.serviceType;
  if (serviceType != null && serviceType.length > 0 && (serviceType == 'input' || serviceType == 'output')) {}
  else {
  	serviceType = { $in: ['input', 'output'] };
  }
  var groupBy = req.query.groupBy; //Does nothing at the moment

	if (searchTerm != null && searchTerm.length > 0) {
	  MongoClient.connect(mongoConnStr, function(err, db) {
		if (err) {
		  return next(err);
		}
		db.collection('serviceregistry')
		.aggregate([
		  { $match: { $text: { $search: searchTerm } } },
		  { $sort: { score: { $meta: "textScore" }} },
		  {$match: {"serviceDescription.serviceDataDescription.dataset.serviceDataType": serviceType}}
		])
		.toArray(function(err, result) {
		  if (err) {
			return next(err);
		  }
		  res.send(JSON.stringify(result));
		  db.close();
		});
	  });
	}
	else {res.send("?searchTerm={searchTerm}");}
  
});

app.get(basePath + '/services', function (req, res, next){

  var serviceType = req.query.serviceType;
  if (serviceType != null && serviceType.length > 0 && (serviceType == 'input' || serviceType == 'output')) {}
  else {
  	serviceType = { $in: ['input', 'output'] };
  }
  var groupBy = req.query.groupBy; //Does nothing at the moment

  MongoClient.connect(mongoConnStr, function(err, db) {
    if (err) {
		return next(err);
    }
    db.collection('serviceregistry').find({"serviceDescription.serviceDataDescription.dataset.serviceDataType": serviceType})
    .toArray(function(err, result) {
      if (err) {
		return next(err);
      }
      res.send(JSON.stringify(result));
      db.close();
    });
  });
});

app.get(basePath + '/services/:service_id', function (req, res, next){

  MongoClient.connect(mongoConnStr, function(err, db) {
    if (err) {
		return next(err);
    }
    
    db.collection('serviceregistry').find( {"serviceId" : req.params.service_id} ).toArray(function(err, result) {
      if (err) {
		return next(err);
      }
      res.send(JSON.stringify(result));
      db.close();
    });
  });
});

app.get(basePath + '/services/:service_id/compatible', function (req, res, next){

  var serviceType = req.query.serviceType;
  if (serviceType != null && serviceType.length > 0 && (serviceType == 'input' || serviceType == 'output')) {}
  else {
  	serviceType = { $in: ['input', 'output'] };
  }
  var groupBy = req.query.groupBy; //Does nothing at the momentnpm 

  MongoClient.connect(mongoConnStr, function(err, db) {
    if (err) {
		return next(err);
    }
    
    db.collection('serviceregistry')
    .find( {"serviceId" : req.params.service_id}, { "serviceDescription.compatibleServices" : 1 } )
    .toArray(function(err, result) {
      if (err) {
		return next(err);
      }
      if (result.length > 0) {
          db.collection('serviceregistry')
          .find( {"serviceId" : { $in : result[0].serviceDescription.compatibleServices },
            "serviceDescription.serviceDataDescription.dataset.serviceDataType": serviceType} )
          .toArray(function(err, result2) {
            if (err) {
		  		return next(err);
            }
            res.send(JSON.stringify(result2));
            db.close();
          });
	  }
	  else {
	    res.send(JSON.stringify(result));
        db.close();
      }
    });
  });
});

app.use(function(err, req, res, next) {
	res.status(500);
	res.send(err.message);
});

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("ServiceRegistry search  app listening at http://%s:%s", host, port)

})
