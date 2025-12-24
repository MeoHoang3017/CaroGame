export interface UserModel {
    id: string;
    email: string;
    password: string;
    username: string;
    isGuest: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginUser {
    email: string;
    password: string;
}

export interface RegisterUser {
    username: string;
    isGuest: boolean;
    email: string;
    password: string;
}

