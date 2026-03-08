import { db } from "./server/db";
import { churches } from "./shared/schema";

async function seedChurches() {
  console.log("Seeding churches...");
  
  const churchNames = [
    "Anglicana da Videira",
    "Anglicana da Ressurreição",
    "Anglicana do Libertador",
    "Anglicana da Comunhão",
    "Anglicana da Esperança",
    "Anglicana da Paz",
    "Anglicana do Repouso",
    "Anglicana do Amanhecer",
    "Anglicana da Graça",
    "Anglicana da Redenção",
  ];

  for (const name of churchNames) {
    await db.insert(churches).values({ name }).onConflictDoNothing();
  }

  console.log("Churches seeded successfully!");
  process.exit(0);
}

seedChurches().catch(err => {
  console.error("Error seeding churches:", err);
  process.exit(1);
});
