let lambdaHandlerFileName = null;
let lambdaHandlerFunctionName = null;
let lambdaFile = null;
let lambdaHandler = null;

// A lambda handler string is specified as: filename.methodname
// Extract the details from the handler and load the appropriate function
const loadHandler = async (entryPoint, pathFromProjectRoot, fileExtension) => {
  try {
    [lambdaHandlerFileName, lambdaHandlerFunctionName] = entryPoint.split(".");
    // This generally runs in /node_modules/, so look in the root
    lambdaFile = await import(`../../${pathFromProjectRoot}/${lambdaHandlerFileName}${fileExtension}`);
    lambdaHandler = lambdaFile[lambdaHandlerFunctionName];
  } catch(exc) {
    const msg = `Unable to load the Lambda handler: ${entryPoint}`;
    console.error(msg);
    throw new Error(msg);
  }
}

// Given a valid POST body, invoke the Lambda function
const invokeLambda = async (reqBody) => {
  try {
    const event = reqBody;
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
    const lambdaResults = await lambdaHandler(event, context, null);
    return lambdaResults;
  } catch(exc) {
    const msg = `Exception running the Lambda handler: ${exc.message}`;
    console.error(msg);
    throw exc;
  }
}

// Create a server and listen for HTTP POST requests
import { createServer } from 'http';
import path from 'path';
const server = createServer( async (req, res) => {
  if (req.method == 'POST' && req.url == '/2015-03-31/functions/function/invocations') {
    let body = '';
    req.on('data', part=> body += part.toString());
    req.on('end', async () => {
      if (lambdaHandler) {
        try {
          const invocationResponse = await invokeLambda(JSON.parse(body));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(invocationResponse));
        } catch(exc) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Exception invoking Lambda handler ${lambdaHandlerFunctionName}: ${exc.message}`);
        }
      }
    });
  } else {
    // Not a valid request. Handle with a 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = process.env.TRYLAM_PORT ? process.env.TRYLAM_PORT : 9000;
const host = process.env.TRYLAM_HOST ? process.env.TRYLAM_HOST : 'localhost';

if (process.argv.length < 3) {
  process.exit("Usage: node trylam <lambdafile.lambdahandler>");
}

server.listen(port, host, async () => {
  console.log(`Hello, trylam is listening here: http://${host}:${port}`);
  const entryPoint = process.argv[2];
  const pathFromProjectRoot = (process.argv.length > 3) ? process.argv[3] : ".";
  let fileExtension = ".js";
  if (process.argv.length > 4) {
    fileExtension = process.argv[4] == 'NONE' ? '' : process.argv[4];
  }
  console.log(`Entry point: ${entryPoint} Path: ${pathFromProjectRoot} File extension: ${fileExtension}`)
  await loadHandler(entryPoint, pathFromProjectRoot, fileExtension);
  console.log(`Lambda function loaded and ready for action`);
});
