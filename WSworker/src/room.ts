import { User } from "@/user.js";
import { shuffleArraySeeded } from "@repo/utils/shuffle.js";

export class Room {
    public id: string;
    private users: Set<User> = new Set();

    constructor(id: string) {
        this.id = id;
    }

    public addUser(user: User) {
        this.users.add(user);
    }

    public removeUser(user: User) {
        this.users.delete(user);
    }

    public getUserCount(): number {
        return this.users.size;
    }

    public broadcast(type: string, payload: any, excludeUser?: User) {
        this.users.forEach(user => {
            if (user !== excludeUser) {
                let msgPayload = payload;

                if (type === "QUESTION" && payload.question && payload.question.options) {
                    // Clone payload to avoid side effects
                    // Shallow clone of payload, then deep clone needs for question and options
                    const newPayload = {
                        ...payload,
                        question: {
                            ...payload.question,
                            options: [...payload.question.options]
                        }
                    };

                    const seed = `${newPayload.quizId}:${user.id}:${newPayload.question.number}`;
                    const { shuffled } = shuffleArraySeeded(newPayload.question.options, seed);
                    newPayload.question.options = shuffled;
                    msgPayload = newPayload;
                }

                user.send(type, msgPayload);
            }
        });
    }
}
