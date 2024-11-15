import { askForApiKey } from "../lib/prompts.js";
import {
  generateSecretKey,
  getDashboardAuthorizerNames,
} from "../lib/helpers.js";
import boxen from "boxen";
import chalk from "chalk";
import ora from "ora";
import {
  LambdaClient,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient();

export const apikey = async (): Promise<void> => {
  const spinner = ora();

  const apiKeyInput = await askForApiKey();
  const apiKey = apiKeyInput || generateSecretKey();

  spinner.start("Changing the dashboard API key on AWS...");

  try {
    const authorizers = getDashboardAuthorizerNames();
    for (let ind = 0; ind < authorizers.length; ind += 1) {
      const getCommand = new GetFunctionConfigurationCommand({
        FunctionName: authorizers[ind],
      });
      const config = await lambdaClient.send(getCommand);
      const envVariables = config.Environment?.Variables || {};
      envVariables["API_KEY"] = apiKey;

      const updateCommand = new UpdateFunctionConfigurationCommand({
        FunctionName: authorizers[ind],
        Environment: { Variables: envVariables },
      });
      await lambdaClient.send(updateCommand);
    }

    spinner.succeed("Dashboard API key changed successfully.");

    console.log(
      boxen(
        `Your new dashboard API key : ${chalk.yellow(apiKey)}\n${chalk.magenta(
          "Be sure to update your dashboard app."
        )}`,
        {
          padding: 1,
          margin: 1,
          borderColor: "green",
          borderStyle: "round",
        }
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    } else {
      spinner.fail("Dashboard API key change failed.");
    }
    return;
  }
};
