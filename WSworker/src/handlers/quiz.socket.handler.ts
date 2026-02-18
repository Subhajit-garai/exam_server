import { BaseSocketHandler } from "@/handlers/base.socket.handler.js";
import { WebSocket } from "ws";
import { QuizManager } from "@/manager/quizManager.js";
import { logger } from "@repo/utils/logger.js";
import { catchAsyncSocket } from "@repo/utils/socketAsyncWrapper.js";
import {
    QuizHandlerType,
    JoinQuizPayload,
    LeaveQuizPayload,
    EndQuizPayload,
    SubmitAnswerPayload,
} from "@/types/ws.types.js";
import { SocketManager } from "@/manager/socket.manager.js";


export class QuizSocketHandler extends BaseSocketHandler {
    private quizManager: QuizManager;

    constructor(ws: WebSocket, user: any) {
        super(ws, user);
        this.quizManager = QuizManager.getInstance();
    }

    async handleMessage(type: QuizHandlerType, payload: any): Promise<void> {
        switch (type) {
            case "JOIN_QUIZ":
                await this.handleJoinQuiz(payload as JoinQuizPayload);
                break;
            case "LEAVE_QUIZ":
                await this.handleLeaveQuiz(payload as LeaveQuizPayload);
                break;
            // case "END_QUIZ":
            //     await this.handleEndQuiz(payload as EndQuizPayload);
            // break;
            case "SUBMIT_ANSWER":
                await this.handleSubmitAnswer(payload as SubmitAnswerPayload);
                break;
            default:
                logger.error(`[UNKNOWN_TYPE] Unknown message type for QuizHandler: ${type}`);
        }
    }


    @catchAsyncSocket
    private async handleJoinQuiz(payload: JoinQuizPayload) {


        const { quizId } = payload;
        logger.info(`[JOIN_QUIZ] Handler processing for quiz ${quizId}`, payload);

        // Add to local room FIRST
        let socketManager = (global as any).socketManager;
        if (!socketManager) {
            socketManager = SocketManager.getInstance();
        }
        socketManager.joinRoom(quizId, this.user);

        try {
            await this.quizManager.addUser(
                quizId,
                this.user.id,
                this.user.data.name,
                this.user.data.avater
            );
            this.send("QUIZ_JOINED", { quizId, message: "Successfully joined quiz" });
        } catch (error) {
            // Rollback if Redis add fails
            socketManager.leaveRoom(quizId, this.user);
            throw error;
        }
    }

    @catchAsyncSocket
    private async handleLeaveQuiz(payload: LeaveQuizPayload) {
        const { quizId } = payload;
        logger.info(`[LEAVE_QUIZ] Handler processing for quiz ${quizId}`, payload);

        await this.quizManager.removeUser(quizId, this.user.id);

        // Remove from local room
        let socketManager = (global as any).socketManager;
        if (!socketManager) {
            socketManager = SocketManager.getInstance();
        }
        socketManager.leaveRoom(quizId, this.user);

        logger.success(`[LEAVE_QUIZ] User ${this.user.id} left quiz ${quizId}`);
        this.send("QUIZ_LEFT", { quizId, message: "Successfully left quiz" });
    }

    @catchAsyncSocket
    private async handleEndQuiz(payload: EndQuizPayload) {
        const { quizId } = payload;
        logger.info(`[END_QUIZ] Handler processing for quiz ${quizId}`, payload);

        const isUserInQuiz = await this.quizManager.isUserExist(quizId, this.user.id);
        if (!isUserInQuiz) {
            logger.error(`[END_QUIZ] User ${this.user.id} tried to end quiz ${quizId} but is not a member`);
            this.error("User not in quiz");
            return;
        }
        logger.success(`[QUIZ_ENDED] User ${this.user.id} ending quiz ${quizId}`);
        this.send("QUIZ_ENDED", { quizId, endTime: new Date() });
    }

    @catchAsyncSocket
    private async handleSubmitAnswer(payload: SubmitAnswerPayload) {
        const { quizId, questionId, answer, number, isMultiple } = payload;
        logger.info(`[SUBMIT_ANSWER] Handler processing for quiz ${quizId}, question ${questionId}`);

        // Pass the time if provided, or use current time string
        const submissionTime = new Date().toISOString();

        await this.quizManager.submitAnswer(
            quizId,
            this.user.id,
            answer,
            number,
            isMultiple,
            submissionTime
        );

        logger.info(`[ANSWER_SUBMITTED] User ${this.user.id} submitted answer for ${questionId} in ${quizId}`);
        this.send("ANSWER_SUBMITTED", { questionId, message: "Answer received" });
    }
}
