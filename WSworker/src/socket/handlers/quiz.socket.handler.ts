import { BaseSocketHandler } from "./base.socket.handler.js";
import { WebSocket } from "ws";
import { QuizManager } from "../../common/quizManager.js";


type QuizHandlerType = "JOIN_QUIZ" | "LEAVE_QUIZ" | "START_QUIZ" | "END_QUIZ" | "SUBMIT_ANSWER";

export class QuizSocketHandler extends BaseSocketHandler {
    private quizManager: QuizManager;

    constructor(ws: WebSocket, user: any) {
        super(ws, user);
        this.quizManager = QuizManager.getInstance();
    }

    async handleMessage(type: QuizHandlerType, payload: any): Promise<void> {
        switch (type) {
            case "JOIN_QUIZ":
                await this.handleJoinQuiz(payload);
                break;
            case "LEAVE_QUIZ":
                await this.handleLeaveQuiz(payload);
                break;
            case "START_QUIZ":
                await this.handleStartQuiz(payload);
                break;
            case "END_QUIZ":
                await this.handleEndQuiz(payload);
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
        console.log(" QuizHandler: handleJoinQuiz ", payload);

        try {
            await this.quizManager.addUser(quizId, this.user.id);
            console.log(`User ${this.user.id} joining quiz ${quizId}`);
            this.send("QUIZ_JOINED", { quizId, message: "Successfully joined quiz" });
        } catch (error) {
            this.error("Failed to join quiz");
        }
    }

    private async handleLeaveQuiz(payload: any) {
        console.log(" QuizHandler: handleLeaveQuiz ", payload);
        const { quizId } = payload;
        try {
            await this.quizManager.removeUser(quizId, this.user.id);
            console.log(`User ${this.user.id} leaving quiz ${quizId}`);
            this.send("QUIZ_LEFT", { quizId, message: "Successfully left quiz" });
        } catch (error) {
            this.error("Failed to leave quiz");
        }
    }

    private async handleStartQuiz(payload: any) {
        console.log(" QuizHandler: handleStartQuiz ", payload);
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

    private async handleEndQuiz(payload: any) {
        console.log(" QuizHandler: handleEndQuiz ", payload);
        const { quizId } = payload;
        try {
            const isUserInQuiz = await this.quizManager.isUserExist(quizId, this.user.id);
            if (!isUserInQuiz) {
                this.error("User not in quiz");
                return;
            }
            console.log(`User ${this.user.id} ending quiz ${quizId}`);
            this.send("QUIZ_ENDED", { quizId, endTime: new Date() });
        } catch (error) {
            this.error("Failed to end quiz");
        }
    }

    private async handleSubmitAnswer(payload: any) {
        const { quizId, questionId, answer, number, isMultiple } = payload;
        try {
            // await this.quizManager.submitAnswer(quizId, this.user.id, answer, number, isMultiple);
            console.log(`User ${this.user.id} submitted answer for ${questionId} in ${quizId}`);
            this.send("ANSWER_SUBMITTED", { questionId, message: "Answer received" });
        } catch (error) {
            this.error("Failed to submit answer");
        }
    }
}
