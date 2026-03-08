import { db } from "./server/db";
import { attendances } from "./shared/schema";

async function seed() {
  console.log("Seeding database...");
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (i * 7));
    dates.push(d.toISOString().split('T')[0]);
  }

  for (const date of dates) {
    await db.insert(attendances).values({
      igreja: 'Sede',
      adultos: Math.floor(Math.random() * 50) + 100,
      criancas: Math.floor(Math.random() * 20) + 10,
      convidados: Math.floor(Math.random() * 10) + 5,
      veiculos: Math.floor(Math.random() * 30) + 20,
      data: date
    });
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
