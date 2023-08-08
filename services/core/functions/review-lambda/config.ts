import { Duration, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

const OPENAI_API_KEY_PARAM_NAME = "GLOBAL_OPENAI_API_KEY"
export class ReviewLambda extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const lambda = new NodejsFunction(this, "review-lambda", {
      functionName: "review-lambda",
      entry: join(__dirname, "index.ts"),
      handler: "main",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        OPENAI_API_KEY_PARAM_NAME: OPENAI_API_KEY_PARAM_NAME,
      },
      timeout: Duration.seconds(60),
    });

    // Grant the Lambda function permissions to access Parameter Store
    const parameterStoreArn = Stack.of(this).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: OPENAI_API_KEY_PARAM_NAME,
    });
    
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [parameterStoreArn],
      })
    );
  }
}
