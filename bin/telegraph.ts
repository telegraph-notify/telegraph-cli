#!/usr/bin/env node

import { program } from "commander";
import { init, deploy, destroy, secretkey, apikey } from "../src/main.js";

program
  .command("init")
  .description("Initialize Telegraph for deployment")
  .action(init);

program.command("deploy").description("Deploy Telegraph to AWS").action(deploy);

program
  .command("destroy")
  .description("Delete Telegraph resources from AWS")
  .action(destroy);

program
  .command("secretkey")
  .description("Change the SDK secret key")
  .action(secretkey);

program
  .command("apikey")
  .description("Change the dashboard API key")
  .action(apikey);

program.parse(process.argv);
