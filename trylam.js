import 'dotenv/config';
import express from 'express';

let lambdaHandlerFileName = null;
let lambdaHandlerFunctionName = null;
let lambdaFile = null;
let lambdaHandler = null;

const app = express();
app.use(express.json());

// A lambda handler string is specified as: filename.methodname
// Extract the details from the handler and load the appropriate function
const loadHandler = async (handlerDetails) => {
  try {
    [lambdaHandlerFileName, lambdaHandlerFunctionName] = handlerDetails.split(".");
    // This generally runs in /node_modules/, so look in the root
    lambdaFile = await import(`../../${lambdaHandlerFileName}.js`);
    lambdaHandler = lambdaFile[lambdaHandlerFunctionName];
  } catch(exc) {
    console.log(`Current working directory: ${process.env.PWD}`);
    console.error(`Exception loading the Lambda handler: ${exc.message}`);
    throw new Error(`Unable to load the Lambda handler: ${handlerDetails}`);
  }
}

app.post('/', async (req, res) => {
  if (lambdaHandler) {
    try {
      const event = req.body;
      const context = {
        functionName: lambdaHandlerFunctionName,
        functionVersion: "1",
        memoryLimitInMB: "1024",
        functionVersion: "$LATEST",
        logGroupName: `/aws/lambda/${lambdaHandlerFunctionName}`,
        invokedFunctionArn: `arn:aws:lambda:LOCAL:123456789012:function:${lambdaHandlerFunctionName}`,
        logStreamName: "2024/12/08/[$LATEST]99999999999999999999",
        callbackWaitsForEmptyEventLoop: true,
        awsRequestId: "12345678-1234-1234-1234-123456789012"
    
      };
      const callback = null;
      const lambdaResults = await lambdaHandler(event, context, callback);
      res.json(lambdaResults);
    } catch(exc) {
      const msg = `Exception running the Lambda handler: ${exc.message}`;
      console.error(msg);
      res.status(400).json({message: msg})
    }
  } else {
    res.status(400).json({message: "Lambda handler not defined"});
  }
});


const port = process.env.TRYLAM_PORT ? process.env.TRYLAM_PORT : 9000;
const host = process.env.TRYLAM_HOST ? process.env.TRYLAM_HOST : 'localhost';

if (process.argv.length < 3) {
  console.log("Usage: node trylam <lambdafile.lambdahandler>");
  process.exit();
}

app.listen(port, host, async () => {
  console.log(`Hello, trylam is listening here: http://${host}:${port}`);
  await loadHandler(process.argv[2]);
  console.log(`Lambda function loaded and ready for action`);
});
