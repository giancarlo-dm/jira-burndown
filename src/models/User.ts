export type User = {
    username: string;
    password: string;
};

export class UserFactory {

    static create(username: string, password: string): User {
        return {
            username: username,
            password: password
        };
    }
}