import fs from "fs";
import path from "path";
import shell from "shelljs";
import ora from "ora";
import boxen from "boxen";
import chalk from "chalk";
import CONSTANTS from "../lib/constants.js";

const cdkRepoPath = path.join(process.cwd(), CONSTANTS.APP_NAME);
const envPath = path.join(process.cwd(), CONSTANTS.ENV_FILE);

export const deploy = async (): Promise<void> => {
  const spinner = ora();

  console.log("Starting deployment...");

  // Verify that init was done first
  if (!fs.existsSync(envPath)) {
    spinner.fail(
      `${chalk.italic(
        chalk.magenta(".env")
      )} file not found. Have you initalized the project?`
    );
    process.exit(1);
  }

  // Clone the CDK project
  spinner.start("Cloning the telegraph-cdk repository...");

  try {
    if (fs.existsSync(cdkRepoPath)) {
      fs.rmSync(cdkRepoPath, { recursive: true, force: true });
    }
    await new Promise((resolve, reject) => {
      shell.exec(
        `git clone ${CONSTANTS.REPO} ${cdkRepoPath}`,
        { silent: true, async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`Git clone failed: ${stderr}`));
          } else {
            resolve(stdout);
          }
        }
      );
    });

    // move .env file to cdk directory
    fs.renameSync(envPath, `${cdkRepoPath}/${CONSTANTS.ENV_FILE}`);

    spinner.succeed("Repository cloned successfully.");
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    } else {
      spinner.fail("Git clone failed.");
    }
    return;
  }

  shell.cd(`${CONSTANTS.APP_NAME}`);

  // Install dependencies
  spinner.start("Installing dependencies...");

  try {
    await new Promise((resolve, reject) => {
      shell.exec(
        `${CONSTANTS.NPM_I}`,
        { silent: true, async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(
              new Error(`Error: Dependency installation failed. ${stderr}`)
            );
          } else {
            resolve(stdout);
          }
        }
      );
    });

    spinner.succeed("Dependencies installed.");
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    } else {
      spinner.fail("Dependency installation failed.");
    }
    return;
  }

  // Bootstrap CDK
  spinner.start("Bootstrapping CDK resources...");

  try {
    await new Promise((resolve, reject) => {
      shell.exec(
        `${CONSTANTS.COMMANDS.BOOTSTRAP}`,
        { silent: true, async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`Error: Bootstrapping failed. ${stderr}`));
          } else {
            resolve(stdout);
          }
        }
      );
    });

    spinner.succeed("Bootstrapping completed.");
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    } else {
      spinner.fail("Bootstrapping failed.");
    }
    return;
  }

  // Deploy the CDK application
  spinner.start(
    "Deploying the Telegraph AWS resources... This could take up to twenty minutes."
  );
  try {
    shell.cd(cdkRepoPath);

    await new Promise<string>((resolve, reject) => {
      shell.exec(
        `${CONSTANTS.COMMANDS.DEPLOY}`,
        { silent: true, async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`CDK deployment failed: ${stderr}`));
          } else {
            resolve(stdout);
          }
        }
      );
    });

    spinner.succeed("AWS deployment complete!");
    handleDeploymentOutput();
  } catch (error) {
    spinner.fail((error as Error).message);
    return;
  }
};

function handleDeploymentOutput() {
  const outputData = fs.readFileSync(`./${CONSTANTS.CDK_OUTPUT_FILE}`, "utf8");
  const outputs = JSON.parse(outputData);

  const websocketApiUrl =
    outputs[`prod-WebSocketGWStack-prod`][`wssEndpointprod`];
  const httpApiUrl = outputs[`prod-HttpGWStack-prod`][`HttpApiInvokeUrlprod`];

  const envFileContent = fs.readFileSync(
    `${cdkRepoPath}/${CONSTANTS.ENV_FILE}`,
    "utf8"
  );
  const envLines = envFileContent.split("\n");
  const secretKeyLine = envLines.find((line) => line.startsWith("SECRET_KEY="));
  const secretKeyValue = secretKeyLine?.split("=")[1] || "defaultSecretKey";
  const apiKeyLine = envLines.find((line) => line.startsWith("API_KEY="));
  const apiKeyValue = apiKeyLine?.split("=")[1] || "defaultAPIKey";

  console.log(
    boxen(
      `Your secret key        : ${chalk.yellow(
        secretKeyValue
      )}\nYour dashboard API key : ${chalk.yellow(
        apiKeyValue
      )}\n\nHTTP API URL           : ${chalk.yellow(
        httpApiUrl
      )}\nWebSocket API URL      : ${chalk.yellow(websocketApiUrl)}`,
      {
        padding: 1,
        margin: 1,
        borderColor: "green",
        borderStyle: "round",
      }
    )
  );
}
