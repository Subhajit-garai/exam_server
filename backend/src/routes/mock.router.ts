import { AddQuestionIntoMock, get_all_mock, get_mock_by_id, getAvailableMock, getExampatternFormock, getmockQuestion, refreshMock, RemoveQuestionFromMock, SelectRandomQuestion } from "@/controllers/mock.controller.js";
import { Router } from "express";


export const mockRouter = Router();


// mock set


mockRouter.post("/refresh/:mockid", refreshMock);
mockRouter.post("/question/random/:mockid", SelectRandomQuestion);
mockRouter.get("/getall", get_all_mock);
mockRouter.get("/get", get_mock_by_id);
mockRouter.get("/get/questions", getmockQuestion);
mockRouter.get(
    "/topics",
    getExampatternFormock
);
mockRouter.post(
    "/question/add",
    AddQuestionIntoMock
);
mockRouter.post(
    "/question/remove",
    RemoveQuestionFromMock
);
mockRouter.get("/getids", getAvailableMock);