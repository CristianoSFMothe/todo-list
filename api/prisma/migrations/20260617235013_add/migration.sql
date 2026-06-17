/*
  Warnings:

  - A unique constraint covering the columns `[user_id,title]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tasks_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "tasks_user_id_title_key" ON "tasks"("user_id", "title");
