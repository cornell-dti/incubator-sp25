#!/usr/bin/env node
import { importCoursesForSemesters } from "./course/importSemester";
import { importSubjects } from "./subject/importSubjects";
import { importFinals, importPrelims } from "./syllabus/importExams";

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
    console.log(
      "  npm run import-subjects [semester]          # Import subjects for a single semester"
    );
    console.log(
      "  npm run import-syllabi prelims [semester]             # Import prelim exam dates"
    );
    console.log(
      "  npm run import-syllabi finals [semester]              # Import final exam dates"
    );
    console.log("");
    console.log("Examples:");
    console.log("  npm run import FA23");
    console.log("  npm run import SP24 FA24");
    console.log("  npm run import subjects SP25");
    console.log("  npm run import prelims SP25");
    console.log("  npm run import finals SP25");
    process.exit(1);
  }

  // Get the semesters from the command line arguments
  const semesters = args;

  if (args.includes("subjects")) {
    console.log("***** Starting subject import *****");

    try {
      const success = await importSubjects(semesters[1]);

      if (success) {
        console.log("***** Subjects import completed successfully *****");
        process.exit(0);
      } else {
        console.error("***** Subjects import completed with errors *****");
        process.exit(1);
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred during subject import:",
        error
      );
      process.exit(1);
    }
  } else if (args.includes("prelims")) {
    console.log("***** Starting prelim exam dates import *****");

    try {
      const success = await importPrelims(semesters[1]);

      if (success) {
        console.log(
          "***** Prelim exam dates import completed successfully *****"
        );
        process.exit(0);
      } else {
        console.error(
          "***** Prelim exam dates import completed with errors *****"
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred during prelim import:",
        error
      );
      process.exit(1);
    }
  } else if (args.includes("finals")) {
    console.log("***** Starting final exam dates import *****");

    try {
      const success = await importFinals(semesters[1]);

      if (success) {
        console.log(
          "***** Final exam dates import completed successfully *****"
        );
        process.exit(0);
      } else {
        console.error(
          "***** Final exam dates import completed with errors *****"
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred during final exam import:",
        error
      );
      process.exit(1);
    }
  } else {
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
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
