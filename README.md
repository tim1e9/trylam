# trylam

## What is it?
Try out a Lambda function locally before you upload it to the cloud.

## How do I use it?

Trylam runs as a small NodeJS library. It can be installed as a development dependency,
so that it adds nothing to the production runtime. 

A typical setup involves doing the following:
1. Add a development dependency to the Lambda NodeJS project:
    ```
    npm install trylam --save-dev
    ```

2. Once installed, start up Trylam as follows:
    ```
    node ./node_modules/trylam/trylam.js index.handler
    ```
   Where `index.handler` is the Lambda file name and function name respectively.

3. To invoke Trylam, make an HTTP call on port 9000 (the default port). For example:
    ```
    curl --request POST --url http://localhost:9000/ --data '{ "key1": "value1", "key2": [ "item21","item22"]}'
    ```
    **NOTE**: The `--data` will be used as the `event` parameter to the Lambda function.
    
    After running, you should see the results of the invocation on the console. Example:
    ```
    {"statusCode":200,"body":"\"Hello from Lambda!\""}
    ```

4. To Use Visual Studio Code to debug the function:
   Add a launch configuration:
    ```
    {
        "version": "0.2.0",
        "configurations": [
            {
                "type": "node",
                "request": "launch",
                "name": "Launch Program",
                "skipFiles": [
                    "<node_internals>/**"
                ],
                "program": "${workspaceFolder}/node_modules/trylam/trylam.js",
                "args": ["index.handler"]
            }
        ]
    }
    ```
   **NOTE::** The above configuration assumes the Lambda entry point is named `handler()`
   and the name of the Lambda file is `index.js`.

   Set a breakpoint in the Lambda handler, and invoke the function via a curl call:
    ```
    curl --request POST --url http://localhost:9000/ --data '{ "key1": "value1", "key2": [ "item21","item22"]}'
    ```

## Then what?

I'm not sure, but I'll say this. The next step is NOT to add infrastructure deployment code to this library.
Use your normal CI/CD process to build, deploy, and verify things. Geez Louise, what's wrong w/ that stuff -
it worked for decades... why are you trying to ditch it? Did it start wearing Dad Jeans or something?


## And Then?

It's probably obvious, but you can call Cloud services by simply setting AWS credentials in your environment
before starting trylam. There are numerous ways to do this, but the simplest is probably just setting the
three environment variables in the terminal. (`AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN`)

## And Then?

That's it. At least for now.

## And Then?

No and then.