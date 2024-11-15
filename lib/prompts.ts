import inquirer from "inquirer";

export const askForSecretKey = async (): Promise<string> => {
  const { secretKey } = await inquirer.prompt<{ secretKey: string }>({
    type: "input",
    name: "secretKey",
    message: "Enter a secret key (or leave blank to generate one):",
  });
  return secretKey || "";
};

export const askForApiKey = async (): Promise<string> => {
  const { apiKey } = await inquirer.prompt<{ apiKey: string }>({
    type: "input",
    name: "apiKey",
    message: "Enter an API key (or leave blank to generate one):",
  });
  return apiKey || "";
};

export const askForEmail = async (): Promise<string> => {
  const { email } = await inquirer.prompt<{ email: string }>({
    type: "input",
    name: "email",
    message: "Enter the email address to use as the sender email:",
  });
  return email || "";
};
