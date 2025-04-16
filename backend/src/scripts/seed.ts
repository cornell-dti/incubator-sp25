import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";

async function seedUserCourses(userId: string) {
  try {
    console.log(`Starting to update courses for user: ${userId}`);

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }

    const newCourses = [
      {
        courseCode: "CS 1110",
        courseName:
          "Introduction to Computing: A Design and Development Perspective",
        semester: "SP25",
        sections: [
          {
            sectionId: "001",
            instructor: "Michael Clarkson, Lillian Lee",
          },
        ],
        id: "Dpfo4FYT3Te4RklMOglF",
      },
      {
        courseCode: "CS 2800",
        courseName: "Mathematical Foundations of Computing",
        semester: "SP25",
        sections: [
          {
            sectionId: "001",
            instructor: "Joe Halpern, Eva Tardos",
          },
        ],
        id: "D67uR24KqWRMM8G9rQaG",
      },
    ];

    // Update the user's courses
    await userRef.update({
      courses: newCourses,
      updatedAt: Timestamp.now(),
    });

    console.log(`Successfully updated courses for user: ${userId}`);
    console.log(`Added courses: CS 1110, CS 2800`);

    return true;
  } catch (error) {
    console.error("Error in seed courses script:", error);
    throw error;
  }
}

async function seedUserTodos(userId: string) {
  try {
    console.log(`Starting to seed todos for user: ${userId}`);

    // Check if user exists
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }

    // Helper function to add days to current date
    const addDays = (days: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };

    // Define example todos with relative dates
    const todos = [
      {
        userId: userId,
        courseCode: "CS 1110",
        title: "Complete Lab Assignment #3",
        date: Timestamp.fromDate(addDays(5)),
        eventType: "Assignment",
      },
      {
        userId: userId,
        courseCode: "CS 1110",
        title: "Submit Project Proposal",
        date: Timestamp.fromDate(addDays(14)),
        eventType: "Assignment",
      },
      {
        userId: userId,
        courseCode: "CS 2800",
        title: "Problem Set 2 Due",
        date: Timestamp.fromDate(addDays(10)),
        eventType: "Assignment",
      },
      {
        userId: userId,
        courseCode: "CS 2800",
        title: "Group Project Presentation",
        date: Timestamp.fromDate(addDays(30)),
        eventType: "Presentation",
      },
    ];

    // Clear existing todos for this user
    const todosRef = db.collection("todos");
    const existingTodosSnapshot = await todosRef
      .where("userId", "==", userId)
      .get();

    // Delete existing todos in a batch
    const batch = db.batch();
    existingTodosSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(
      `Cleared ${existingTodosSnapshot.size} existing todos for user`
    );

    // Add new todos
    for (const todo of todos) {
      await todosRef.add(todo);
    }

    console.log(`Successfully added ${todos.length} todos for user: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error in seed todos script:", error);
    throw error;
  }
}

// Main function to run both seed operations
async function seedUserData(userId: string) {
  try {
    console.log("=== Starting user data seeding process ===");

    // Step 1: Seed user courses
    console.log("\n=== SEEDING COURSES ===");
    await seedUserCourses(userId);

    // Step 2: Seed user todos
    console.log("\n=== SEEDING TODOS ===");
    await seedUserTodos(userId);

    console.log("\n=== All seeding operations completed successfully ===");
    return true;
  } catch (error) {
    console.error("\n=== Seeding process failed ===", error);
    process.exit(1);
  }
}

// Get userId from command line arguments
const userId = process.argv[2];

// Check if userId was provided
if (!userId) {
  console.error("Error: User ID is required");
  console.log("Usage: ts-node seed.ts <userId>");
  process.exit(1);
}

// Run the seed functions
seedUserData(userId)
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
