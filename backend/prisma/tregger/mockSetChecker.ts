import prisma from "../../db";
async function createTrigger() {
  await prisma.$executeRawUnsafe(
    `CREATE OR REPLACE FUNCTION notify_question_set_update() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('mock_questions_set_update', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`
  );

  console.log("✅ Trigger and function created successfully");
}
async function applyTrigger() {
  await prisma.$executeRawUnsafe(`

        CREATE TRIGGER question_set_notify_trigger
AFTER INSERT OR UPDATE ON "mock_questions_set"
FOR EACH ROW
EXECUTE FUNCTION notify_question_set_update();

    `);

  console.log("✅ Trigger applied successfully");
}
createTrigger()
  .then(() => {
    applyTrigger()
      .catch((e) => {
        console.error("❌ Error applying trigger:", e);
      })
      .finally(() => prisma.$disconnect());
  })
  .catch((e) => {
    console.error("❌ Error creating trigger:", e);
  })
  .finally(() => prisma.$disconnect());
