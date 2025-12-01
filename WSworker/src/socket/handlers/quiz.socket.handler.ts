import { BaseSocketHandler } from "./base.socket.handler.js";
import { WebSocket } from "ws";
import { QuizManager } from "../../common/quizManager.js";

export class QuizSocketHandler extends BaseSocketHandler {
    private quizManager: QuizManager;

    constructor(ws: WebSocket, user: any) {
        super(ws, user);
        this.quizManager = QuizManager.getInstance();
    }

    async handleMessage(type: string, payload: any): Promise<void> {
        switch (type) {
            case "JOIN_QUIZ":
                await this.handleJoinQuiz(payload);
                break;
            case "START_QUIZ":
                await this.handleStartQuiz(payload);
                break;
            case "SUBMIT_ANSWER":
                await this.handleSubmitAnswer(payload);
                break;
            default:
                console.warn(`Unknown message type for QuizHandler: ${type}`);
        }
    }

    private async handleJoinQuiz(payload: any) {
        const { quizId } = payload;
        try {
            await this.quizManager.addUser(quizId, this.user.id);
            console.log(`User ${this.user.id} joining quiz ${quizId}`);
            this.send("QUIZ_JOINED", { quizId, message: "Successfully joined quiz" });
        } catch (error) {
            this.error("Failed to join quiz");
        }
    }

    private async handleStartQuiz(payload: any) {
        const { quizId } = payload;
        try {
            const isUserInQuiz = await this.quizManager.isUserExist(quizId, this.user.id);
            if (!isUserInQuiz) {
                this.error("User not in quiz");
                return;
            }
            console.log(`User ${this.user.id} starting quiz ${quizId}`);
            this.send("QUIZ_STARTED", { quizId, startTime: new Date() });

            // Send first question
            const question = await this.quizManager.getQuestion("current", quizId, this.user.id, 1);
            if (question) {
                this.send("NEW_QUESTION", { quizId, question });
            }
        } catch (error) {
            this.error("Failed to start quiz");
        }
    }

    private async handleSubmitAnswer(payload: any) {
        const { quizId, questionId, answer, number, isMultiple } = payload;
        try {
            await this.quizManager.submitAnswer(quizId, this.user.id, answer, number, isMultiple);
            console.log(`User ${this.user.id} submitted answer for ${questionId} in ${quizId}`);
            this.send("ANSWER_SUBMITTED", { questionId, message: "Answer received" });
        } catch (error) {
            this.error("Failed to submit answer");
        }
    }
}
