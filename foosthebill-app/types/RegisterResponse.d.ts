export type RegisterResponse = {
    statusCode: number;
    message: string;
    data: {
        id: string;
        name: string;
        firstname: string;
        email: string;
        role: 'admin' | 'participant';
        creation_date: string;
    };
};