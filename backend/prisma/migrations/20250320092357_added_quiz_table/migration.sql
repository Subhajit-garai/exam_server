-- CreateTable
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "quizRegister_id" TEXT,
    "name" TEXT DEFAULT 'No name',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'No name',
    "examtype" TEXT NOT NULL DEFAULT 'quiz',
    "ansid" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'Private',
    "creationstatus" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '08:00 pm',
    "duration" TEXT NOT NULL DEFAULT '02:00 h',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" "ExamStage" NOT NULL DEFAULT 'Registration',

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizRegister" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT DEFAULT 'new_value_not_seted',
    "users" TEXT[],

    CONSTRAINT "quizRegister_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_id_key" ON "quiz"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_display_id_key" ON "quiz"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_ansid_key" ON "quiz"("ansid");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_id_key" ON "quizRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_quiz_id_key" ON "quizRegister"("quiz_id");

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_quizRegister_id_fkey" FOREIGN KEY ("quizRegister_id") REFERENCES "quizRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_ansid_fkey" FOREIGN KEY ("ansid") REFERENCES "AnsSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
