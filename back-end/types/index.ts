type Role = 'ORGANISER' | 'CLIENT';

type UserInput = {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isOrganiser: boolean;
};

type EventInput = {
    name: string;
    description: string;
    date: string;
    location: string;
    organiserId: number;
};

type OrganiserViewInput = {
    organiserId: number;
    email: string;
    isOrganiser: boolean;
};

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
};

type AuthenticationResponse = {
    token: string;
    id: number;
    firstName: string;
    lastName: string;
    role: Role;
};

export { Role, UserInput, AuthenticationResponse, EventInput, User, OrganiserViewInput };
