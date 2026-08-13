import { asyncHandler } from "@/utils/asyncHandler.js";
import { ProfileService } from "./service.js";
import { deleteSocialLinksZodSchema, updateAcademicProfileZodSchema, updateSocialLinksZodSchema } from "@/zod/user.zod.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";

const profileService = new ProfileService();

export const getProfile = asyncHandler(async (req: any, res: any) => {
    // req.user is the userId from the auth middleware
    const user = await profileService.getProfile(req.user);

    res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        data: user,
    });
});

export const updateAcademicProfile = asyncHandler(async (req: any, res: any) => {
    const data = updateAcademicProfileZodSchema.safeParse(req.body);

    if (!data.success) {
        return ZodDataSafeParse(data);
    }

    const updatedUser = await profileService.updateAcademicProfile(req.user, data.data);

    res.status(200).json({
        success: true,
        message: "User academic profile updated successfully",
        data: updatedUser,
    });
});

export const updateSocialLinks = asyncHandler(async (req: any, res: any) => {
    const data = updateSocialLinksZodSchema.safeParse(req.body);

    if (!data.success) {
        return ZodDataSafeParse(data);
    }

    const updatedUser = await profileService.updateSocialLinks(req.user, data.data);

    res.status(200).json({
        success: true,
        message: "User social links updated successfully",
        data: updatedUser,
    });
});

export const deleteSocialLinksRecord = asyncHandler(async (req: any, res: any) => {
    const data = deleteSocialLinksZodSchema.safeParse({
        platform: req.params.platform,
    });

    if (!data.success) {
        return ZodDataSafeParse(data);
    }

    const deletedSocialLink = await profileService.deleteSocialLinksRecord(req.user, data.data);

    res.status(200).json({
        success: true,
        message: "User social links deleted successfully",
        data: deletedSocialLink,
    });
});
