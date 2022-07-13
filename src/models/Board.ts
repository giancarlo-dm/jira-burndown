export type Board = {
    id: number;
    name: string;
    self: string;
    type: string;
};

export class BoardFactory {
    create(id: number, name: string, self: string, type: string): Board {
        return {
            id: id,
            name: name,
            self: self,
            type: type
        };
    }
}