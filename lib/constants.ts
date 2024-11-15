export default {
  COMMANDS: {
    DEPLOY:
      'cdk deploy "prod/*" --json --outputs-file ./cdk-output.json --require-approval never',
    DESTROY: `cdk destroy "prod/*" --force`,
    BOOTSTRAP: "cdk bootstrap",
  },
  REPO: "https://github.com/telegraph-notify/telegraph-cdk.git",
  APP_NAME: "telegraph-cdk",
  CDK_OUTPUT_FILE: "cdk-output.json",
  APP_DEPENDENCIES: ["aws", "cdk", "git"],
  NPM_I: "npm install",
  ENV_FILE: ".env",
  HTTP_GW_STACK_NAME: "prod-HttpGWStack-prod",
  WS_GW_STACK_NAME: "prod-WebSocketGWStack-prod",
  WS_AUTH_FN_NAME: "WebSocketAuthorizerprod",
  DASH_AUTH_FN_NAME: "dashboardAuthorizerprod",
  HTTP_AUTH_FN_NAME: "HTTPAuthorizerprod",
};
