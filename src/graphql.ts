
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class LoginInput {
    email: string;
    password: string;
}

export class SignupInput {
    email: string;
    password: string;
    firstName: string;
    lastName?: Nullable<string>;
}

export class CreatePetInput {
    name: string;
}

export class UpdatePetInput {
    id: number;
    name: string;
}

export class PostCreateInput {
    title: string;
    content: string;
}

export class CreateUserInput {
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    password: string;
}

export class FindUserInput {
    email: string;
}

export class Tokens {
    accessToken?: Nullable<string>;
}

export class LoginPayload {
    userErrors: UserErrors[];
    tokens?: Nullable<Tokens>;
    user?: Nullable<User>;
}

export abstract class IMutation {
    abstract login(loginInput?: Nullable<LoginInput>): LoginPayload | Promise<LoginPayload>;

    abstract signup(signupInput?: Nullable<SignupInput>): LoginPayload | Promise<LoginPayload>;

    abstract createPet(createPetInput: CreatePetInput): PetPayload | Promise<PetPayload>;

    abstract updatePet(updatePetInput: UpdatePetInput): PetPayload | Promise<PetPayload>;

    abstract removePet(id: number): Nullable<PetPayload> | Promise<Nullable<PetPayload>>;

    abstract postCreate(postCreateInput: PostCreateInput): PostPayload | Promise<PostPayload>;
}

export class Pet {
    id: number;
    name: string;
}

export class UserErrors {
    message: string;
    error?: Nullable<OriginalError>;
}

export class PetPayload {
    userErrors: UserErrors[];
    Pet?: Nullable<Pet>;
}

export abstract class IQuery {
    abstract pets(): Nullable<Pet>[] | Promise<Nullable<Pet>[]>;

    abstract pet(id: number): Nullable<Pet> | Promise<Nullable<Pet>>;

    abstract users(): UsersPayload | Promise<UsersPayload>;

    abstract user(findUserInput?: Nullable<FindUserInput>): UserPayload | Promise<UserPayload>;
}

export class Post {
    id: number;
    title: string;
    content: string;
    user: User;
}

export class PostPayload {
    userErrors: UserErrors[];
    Post?: Nullable<Post>;
}

export class User {
    id: number;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
}

export class OriginalError {
    message?: Nullable<string>;
    error?: Nullable<string>;
    statusCode?: Nullable<number>;
}

export class UsersPayload {
    userErrors: UserErrors[];
    users?: Nullable<Nullable<User>[]>;
}

export class UserPayload {
    userErrors: UserErrors[];
    user?: Nullable<User>;
}

type Nullable<T> = T | null;
