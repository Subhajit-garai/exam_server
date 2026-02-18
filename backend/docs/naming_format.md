# Naming Conventions & Structure Format

This document outlines the standard naming conventions and code structure for the project. Adhering to these guidelines ensures consistency, readability, and maintainability across the codebase.

## 1. Naming Conventions

### 1.1 Classes
-   **Format**: `PascalCase`
-   **Description**: Class names should be nouns or noun phrases that describe the object they represent.
-   **Examples**:
    -   `ExamService`
    -   `ExamManager`
    -   `UserController`

### 1.2 Methods and Functions
-   **Format**: `camelCase`
-   **Description**: Method names should be verbs or verb phrases that clearly indicate the action performed. Avoid snake_case (e.g., `update_targeted_exam_year`) in favor of camelCase.
-   **Examples**:
    -   `getExams`
    -   `createExamPattern`
    -   `updateTargetedExamYear` (Preferred over `update_targeted_exam_year`)
    -   `isExamSessionActive`

### 1.3 Variables and Properties
-   **Format**: `camelCase`
-   **Description**: Variables should be descriptive and concise using camelCase. Boolean variables should often start with `is`, `has`, or `should`.
-   **Examples**:
    -   `userId`
    -   `examPattern`
    -   `isActive`
    -   `totalQuestions`

### 1.4 Constants
-   **Format**: `UPPER_SNAKE_CASE`
-   **Description**: Constants that are immutable and known at compile time.
-   **Examples**:
    -   `MAX_RETRY_ATTEMPTS`
    -   `DEFAULT_PAGE_LIMIT`

### 1.5 File Names
-   **Format**: `kebab-case` or `dot.notation`
-   **Description**: File names should be lowercase. Use dots to separate type/functionality (e.g., `.service`, `.controller`, `.middleware`).
-   **Examples**:
    -   `exam.service.ts`
    -   `user.controller.ts`
    -   `global-error-handler.ts`

## 2. Code Structure (Service Layer)

Services should encapsulate business logic and interact with data access layers (like Prisma or Redis).

### 2.1 Dependencies
-   Import external libraries first.
-   Import internal modules/helpers second.
-   Initialize managers or singleton instances at the top level or within the constructor.

### 2.2 Methods Organization
-   **Public Methods**: Place the most important public methods at the top.
-   **Helper/Private Methods**: Place internal helper methods at the bottom of the class or file.
-   **CRUD Grouping**: Group related Create, Read, Update, Delete operations together logically.
    -   Ex: `createExam`, `getExam`, `updateExam`, `deleteExam`.

## 3. Example Implementation

```typescript
export class ExamService {
    // 1. Core Logic Matches
    async getExams(userId: string, type: ExamType) {
        // ...
    }

    async createExam(data: CreateExamDto) {
        // ...
    }

    // 2. Helper Methods (Private or Internal)
    private validateExamDates(start: Date, end: Date): boolean {
        // ...
    }
}
```

## 4. Anti-Patterns to Avoid
-   ❌ **Inconsistent Casing**: Mixing `snake_case` and `camelCase` for methods (e.g., `update_targeted_exam_year` vs `getExams`).
-   ❌ **Typographical Errors**: Ensure spelling is correct (e.g., `right` not `rignt`).
-   ❌ **Generic Names**: Avoid names like `data` or `item` without context; use `examData` or `questionItem`.
