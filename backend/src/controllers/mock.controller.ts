import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { MockService } from "../services/mock.service.js";

const mockService = new MockService();

export const SelectRandomQuestion = asyncHandler(async (req: any, res: any) => {
    const userId = req.user;
    const { mockid } = req.params;
    if (!mockid) throw new Error("Mock Set ID is required");


    const response = await mockService.selectRandomQuestion(mockid, userId);

    if (!response) throw new Error("Mock set not added for refresh");

    res.json({
        success: true,
        message: "Mock set addded for refresh",
    });
});
export const refreshMock = asyncHandler(async (req: any, res: any) => {
    const userId = req.user;
    const { mockid } = req.params;
    if (!mockid) throw new Error("Mock Set ID is required");


    const response = await mockService.refresh(mockid, userId);

    if (!response) throw new Error("Mock set not added for refresh");

    res.json({
        success: true,
        message: "Mock set addded for refresh",
    });
});



export const get_all_mock = asyncHandler(async (req: any, res: any) => {
    const userId = req.user;
    const response = await mockService.getAllMock(userId);

    res.json({
        success: true,
        message: response.length < 1 ? "No Mock Sets found" : "All Mock Quesiton Sets",
        data: response
    });
});

export const get_mock_by_id = asyncHandler(async (req: any, res: any) => {
    const { id } = req.query;
    if (!id) throw new Error("Mock Set ID is required");

    const response = await mockService.getMockById(id as string);

    res.json({
        success: true,
        data: response
    });
});

export const get_mock = asyncHandler(async (req: any, res: any) => {
    const { id } = req.query;
    if (!id) throw new Error("Mock Set ID is required");

    const response = await mockService.getMockSetQuestions(id as string);

    res.json({
        success: true,
        message: "Questions for Mock Set",
        data: response
    });
});

export const getExampatternFormock = asyncHandler(async (req: any, res: any) => {
    const { id } = req.query;
    if (!id) throw new Error("Mock Set ID is required");

    const response = await mockService.getExamPatterForMock(id as string);

    res.json({
        success: true,
        data: response
    });
});

export const AddQuestionIntoMock = asyncHandler(async (req: any, res: any) => {
    // POST request expected, so body.
    const { mockId, questionId, part, number } = req.body;

    if (!mockId || !questionId) throw new Error("mockId and questionId are required");

    const response = await mockService.addQuestionToMock(mockId, questionId, part, number);

    res.json({
        success: true,
        message: "Question added to Mock Set",
        data: response
    });
});

export const RemoveQuestionFromMock = asyncHandler(async (req: any, res: any) => {
    // POST/DELETE request expected.
    const { mockId, questionId } = req.body;

    if (!mockId || !questionId) throw new Error("mockId and questionId are required");

    const response = await mockService.removeQuestionFromMock(mockId, questionId);

    res.json({
        success: true,
        message: "Question removed from Mock Set",
        data: response
    });
});

export const getAvailableMock = asyncHandler(async (req: any, res: any) => {
    const response = await mockService.getAvailableMock();
    res.json({
        success: true,
        data: response
    });
});
export const getmockQuestion = asyncHandler(async (req: any, res: any) => {
    let id = req.query.id;
    let info: "full" | "Onlyid" = req.query.info;
    if (!id) throw new Error("Mock Set ID is required");
    const response = await mockService.getMockQuestions(id as string, info);
    res.json({
        success: true,
        data: response
    });
});


