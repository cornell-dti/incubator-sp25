#!/usr/bin/env node
import { importCoursesForSemesters } from "./course/importSemester";

async function main() {
  // Get command line arguments (skipping the first two which are node and script path)
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log(
      "  npm run import-courses [semester]          # Import courses for a single semester"
    );
    console.log(
      "  npm run import-courses [semester1] [semester2] ...  # Import courses for multiple semesters"
    );
    console.log("");
    console.log("Examples:");
    console.log("  npm run import FA23");
    console.log("  npm run import SP24 FA24");
    process.exit(1);
  }

  // Get the semesters from the command line arguments
  const semesters = args;

  console.log(
    `***** Starting course import for semesters: ${semesters.join(", ")} *****`
  );

  try {
    const success = await importCoursesForSemesters(semesters);

    if (success) {
      console.log("***** Course import completed successfully *****");
      process.exit(0);
    } else {
      console.error("***** Course import completed with errors *****");
      process.exit(1);
    }
  } catch (error) {
    console.error("An unexpected error occurred during import:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
