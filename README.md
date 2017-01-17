# Going Serverless with PouchDB

Some example code from my [Going Offline First with Serverless PouchDB](https://awkwardn.es/serverless-pouchdb/) talk.

In order to deploy, you first need to create a configuration file named `config.json` that contains the security credentials of a user that has full access permissions to DynamoDB (there's e.g. the `AmazonDynamoDBFullAccess` AWS Managed policy for that). The configuration file should look like this:
```yaml
{
  "dynamodb": {
    "region": "eu-central-1",
    "accessKeyId": "AKIAIA5BDFCNC7GDS23Q",
    "secretAccessKey": "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"
  }
}
```

If you haven't done so yet, you also need to install serverless:
```sh
npm install -g serverless
```

If everything is set up correctly, you should be able to deploy like this:
```sh
serverless deploy
```
