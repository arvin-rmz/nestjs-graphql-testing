
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

export class CreateProfileInput {
    id?: Nullable<string>;
}

export class UpdateProfileInput {
    id: string;
}

export class CreateUserInput {
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    password: string;
}

export class FindUserInput {
    id: string;
}

export class Tokens {
    accessToken?: Nullable<string>;
}

export class AuthPayload {
    userErrors: UserErrors[];
    tokens?: Nullable<Tokens>;
    user?: Nullable<User>;
}

export abstract class IMutation {
    abstract login(loginInput?: Nullable<LoginInput>): AuthPayload | Promise<AuthPayload>;

    abstract signup(signupInput?: Nullable<SignupInput>): AuthPayload | Promise<AuthPayload>;

    abstract createPet(createPetInput: CreatePetInput): PetPayload | Promise<PetPayload>;

    abstract updatePet(updatePetInput: UpdatePetInput): PetPayload | Promise<PetPayload>;

    abstract removePet(id: number): Nullable<PetPayload> | Promise<Nullable<PetPayload>>;

    abstract postCreate(postCreateInput: PostCreateInput): PostPayload | Promise<PostPayload>;

    abstract createProfile(createProfileInput: CreateProfileInput): ProfilePayload | Promise<ProfilePayload>;

    abstract updateProfile(updateProfileInput: UpdateProfileInput): ProfilePayload | Promise<ProfilePayload>;

    abstract removeProfile(id: number): string | Promise<string>;
}

export class Pet {
    id: number;
    name: string;
}

export class UserErrors {
    message: string;
}

export class PetPayload {
    userErrors: UserErrors[];
    Pet?: Nullable<Pet>;
}

export abstract class IQuery {
    abstract pets(): Nullable<Pet>[] | Promise<Nullable<Pet>[]>;

    abstract pet(id: number): Nullable<Pet> | Promise<Nullable<Pet>>;

    abstract post(id?: Nullable<string>): Nullable<Post> | Promise<Nullable<Post>>;

    abstract posts(): Post[] | Promise<Post[]>;

    abstract profile(id: string): Nullable<Profile> | Promise<Nullable<Profile>>;

    abstract profiles(): Profile[] | Promise<Profile[]>;

    abstract me(): Nullable<User> | Promise<Nullable<User>>;

    abstract user(findUserInput?: Nullable<FindUserInput>): Nullable<User> | Promise<Nullable<User>>;

    abstract users(): User[] | Promise<User[]>;
}

export class Post {
    id: string;
    title: string;
    content: string;
    user: User;
}

export class PostPayload {
    userErrors: UserErrors[];
    post?: Nullable<Post>;
}

export class Profile {
    id: string;
    userId: number;
    user: User;
}

export class ProfilePayload {
    userErrors: UserErrors[];
    profile?: Nullable<Profile>;
}

export class User {
    id: string;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    posts: Post[];
}

type Nullable<T> = T | null;
