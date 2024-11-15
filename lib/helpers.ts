import fs from "fs";
import crypto from "crypto";
import CONSTANTS from "./constants.js";

export const generateSecretKey = (): string =>
  crypto.randomBytes(16).toString("hex");

export const saveSecretKey = (key: string, filePath: string): void => {
  fs.appendFileSync(filePath, `SECRET_KEY=${key}\n`, "utf-8");
};

export const saveApiKey = (key: string, filePath: string): void => {
  fs.appendFileSync(filePath, `API_KEY=${key}\n`, "utf-8");
};

export const saveEmail = (email: string, filePath: string): void => {
  fs.writeFileSync(filePath, `SENDER_EMAIL=${email}\n`, "utf-8");
};

export const getDashboardAuthorizerNames = (): string[] => {
  const outputData = fs.readFileSync(
    `./${CONSTANTS.APP_NAME}/${CONSTANTS.CDK_OUTPUT_FILE}`,
    "utf8"
  );
  const outputs = JSON.parse(outputData);

  const dashboardAuthorizer =
    outputs[CONSTANTS.HTTP_GW_STACK_NAME][CONSTANTS.DASH_AUTH_FN_NAME];

  return [dashboardAuthorizer];
};

export const getAllAuhotizerNames = (): string[] => {
  const outputData = fs.readFileSync(
    `./${CONSTANTS.APP_NAME}/${CONSTANTS.CDK_OUTPUT_FILE}`,
    "utf8"
  );
  const outputs = JSON.parse(outputData);

  const websocketAuthorizer =
    outputs[CONSTANTS.WS_GW_STACK_NAME][CONSTANTS.WS_AUTH_FN_NAME];

  const httpAuthorizer =
    outputs[CONSTANTS.HTTP_GW_STACK_NAME][CONSTANTS.HTTP_AUTH_FN_NAME];

  const dashboardAuthorizer =
    outputs[CONSTANTS.HTTP_GW_STACK_NAME][CONSTANTS.DASH_AUTH_FN_NAME];

  return [websocketAuthorizer, httpAuthorizer, dashboardAuthorizer];
};
