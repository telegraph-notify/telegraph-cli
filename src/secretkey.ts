import { askForSecretKey } from "../lib/prompts.js";
import { generateSecretKey, getAllAuhotizerNames } from "../lib/helpers.js";
import boxen from "boxen";
import chalk from "chalk";
import ora from "ora";
import {
  LambdaClient,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient();

export const secretkey = async (): Promise<void> => {
  const spinner = ora();

  const secretKeyInput = await askForSecretKey();
  const secretKey = secretKeyInput || generateSecretKey();

  spinner.start("Changing the secret key on AWS...");

  try {
    const authorizers = getAllAuhotizerNames();
    for (let ind = 0; ind < authorizers.length; ind += 1) {
      const getCommand = new GetFunctionConfigurationCommand({
        FunctionName: authorizers[ind],
      });
      const config = await lambdaClient.send(getCommand);
      const envVariables = config.Environment?.Variables || {};
      envVariables["SECRET_KEY"] = secretKey;

      const updateCommand = new UpdateFunctionConfigurationCommand({
        FunctionName: authorizers[ind],
        Environment: { Variables: envVariables },
      });
      await lambdaClient.send(updateCommand);
    }

    spinner.succeed("Secret key changed successfully.");

    console.log(
      boxen(
        `Your new secret key : ${chalk.yellow(secretKey)}\n${chalk.magenta(
          "Be sure to update your SDKs."
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
      spinner.fail("Secret key change failed.");
    }
    return;
  }
};
