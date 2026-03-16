import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

async function main() {
  // Register the prompt
  inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"));

  // Use the prompt
  inquirer
    .prompt([
      {
        type: "fuzzypath",
        name: "path",
        message: "Select a target directory for your component:",
        rootPath: "../..",
        //itemType: "any", // Can be 'any', 'directory' or 'file'
        // ... other options
      },
    ])
    .then((answers) => {
      console.log("Selected path:", answers.path);
    });
}

main().catch((err) => {
  console.error("Setup failed: ", err);
  process.exit(1);
});
