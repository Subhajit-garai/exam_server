import { User } from "./user.js";

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
                user.send(type, payload);
            }
        });
    }
}
