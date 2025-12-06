import prisma from "@repo/db/index.js";
import { ConvertInSlug } from "@/lib/slug.js";

export class CategoryService {
    async createCategory(data: any) {
        // Generate slug if not provided
        const slug = data.slug || ConvertInSlug(data.name);

        // Check for duplicate name or slug
        const existing = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: data.name },
                    { slug: slug }
                ]
            }
        });

        if (existing) {
            throw new Error("Category with same name or slug already exists");
        }

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: slug,
                shortName: data.shortName,
                description: data.description,
                iconUrl: data.iconUrl,
            },
        });
        return category;
    }

    async getAllCategories() {
        return await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { examPatterns: true, targetExams: true }
                }
            }
        });
    }

    async getCategoryById(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {

                examPatterns: true,
                targetExams: true
            }
        });
        if (!category) throw new Error("Category not found");
        return category;
    }

    async updateCategory(id: string, data: any) {
        // Check if category exists
        await this.getCategoryById(id);

        // If updating name/slug, check conflicts
        if (data.name || data.slug) {
            const slug = data.slug || (data.name ? ConvertInSlug(data.name) : undefined);
            const existing = await prisma.category.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        {
                            OR: [
                                ...(data.name ? [{ name: data.name }] : []),
                                ...(slug ? [{ slug: slug }] : [])
                            ]
                        }
                    ]
                }
            });
            if (existing) throw new Error("Category name or slug already taken");

            if (!data.slug && data.name) {
                data.slug = slug;
            }
        }

        return await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                shortName: data.shortName,
                description: data.description,
                iconUrl: data.iconUrl,
            },
        });
    }

    async deleteCategory(id: string) {
        return await prisma.category.delete({
            where: { id },
        });
    }
}

export const categoryService = new CategoryService();
