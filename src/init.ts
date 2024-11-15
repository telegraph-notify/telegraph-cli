import { askForSecretKey, askForEmail, askForApiKey } from "../lib/prompts.js";
import {
  generateSecretKey,
  saveSecretKey,
  saveEmail,
  saveApiKey,
} from "../lib/helpers.js";
import CONSTANTS from "../lib/constants.js";
import path from "path";
import boxen from "boxen";
import chalk from "chalk";
import shell from "shelljs";

export const init = async (): Promise<void> => {
  console.log(chalk.blue("Initializing Telegraph CLI..."));

  // check for missing dependencies
  const missingDependencies: string[] = [];
  CONSTANTS.APP_DEPENDENCIES.forEach((dep) => {
    if (!shell.which(dep)) {
      missingDependencies.push(dep);
    }
  });

  if (missingDependencies.length > 0) {
    console.error(
      chalk.red(`Missing dependencies: \n${missingDependencies.join(", ")}`)
    );
    console.log(
      chalk.yellow("Please install the missing dependencies before proceeding.")
    );
    return;
  }

  console.log(chalk.green("All dependencies are installed."));

  // ask for email to use for email service
  const email = await askForEmail();
  const envFilePath = path.resolve(process.cwd(), CONSTANTS.ENV_FILE);
  saveEmail(email, envFilePath);

  // ask for secret key
  const secretKeyInput = await askForSecretKey();
  const secretKey = secretKeyInput || generateSecretKey();

  saveSecretKey(secretKey, envFilePath);

  // ask for API key
  const apiKeyInput = await askForApiKey();
  const apiKey = apiKeyInput || generateSecretKey();

  saveApiKey(apiKey, envFilePath);

  console.log(
    boxen(
      `Your email             : ${chalk.yellow(
        email
      )}\n\nYour secret key        : ${chalk.yellow(
        secretKey
      )}\n${chalk.magenta("You will need this to use the SDKs.")}
      \nYour dashboard API key : ${chalk.yellow(apiKey)}\n${chalk.magenta(
        "You will need this to use the dashboard."
      )}
      \n${chalk.magenta("Store these keys somewhere safe.")}`,
      {
        padding: 1,
        margin: 1,
        borderColor: "green",
        borderStyle: "round",
      }
    )
  );
};
