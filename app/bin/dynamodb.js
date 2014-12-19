var AWS = require('aws-sdk');
var config = require('../config/auth.local.js');
AWS.config.update(config.aws);
var dynamoDB = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });



var tableName = "OrderLog";
// Describe table here.
var table = {
  AttributeDefinitions: [ // Defining Primary Key
    {
      AttributeName: 'order_id',
      AttributeType: 'N'
    }
    // Define Secondary key here.
  ],
  KeySchema: [ // Defining Key Type Here.
    {
      AttributeName: 'order_id',
      KeyType: 'HASH'
    }
    // Define Secondary Key Type Here.
  ],
  // Define read per second and write per second here.
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: tableName // table Name
};

function callback () {
	dynamoDB.listTables(function (err, data)
	{
	   console.log('listTables',err,data);
	});
}

dynamoDB.createTable(table, function (error, data) {
  if (error) {
    console.log("Error: ", error, error.stack);
    callback(error);
  } else {
    console.log("Table ", tableName, " Created!");
    callback(null);
  }
});


