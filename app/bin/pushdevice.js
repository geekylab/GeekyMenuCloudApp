var AWS = require('aws-sdk');
var config = require('../config/auth.local.js');
AWS.config.update(config.aws);

var ARN = config.awsSnsApp.ARN_GCM
var sns = new AWS.SNS();

var params = {
  Message: 'Test for you', /* required */
  // MessageAttributes: {
  //   someKey: {mail
  //     DataType: 'STRING_VALUE', /* required */
  //     BinaryValue: new Buffer('...') || 'STRING_VALUE',
  //     StringValue: 'STRING_VALUE'
  //   },
  //   /* anotherKey: ... */
  // },
//  MessageStructure: 'STRING_VALUE',
  Subject: 'test',
  TargetArn: ARN + '/'
};

sns.publish(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});