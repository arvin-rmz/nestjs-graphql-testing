
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

    abstract createProfile(createProfileInput: CreateProfileInput): Profile | Promise<Profile>;

    abstract updateProfile(updateProfileInput: UpdateProfileInput): Profile | Promise<Profile>;

    abstract removeProfile(id: number): Nullable<Profile> | Promise<Nullable<Profile>>;
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

    abstract post(id?: Nullable<string>): PostPayload | Promise<PostPayload>;

    abstract posts(): PostsPayload | Promise<PostsPayload>;

    abstract profile(id: string): ProfilePayload | Promise<ProfilePayload>;

    abstract profiles(): ProfilesPayload | Promise<ProfilesPayload>;

    abstract users(): UsersPayload | Promise<UsersPayload>;

    abstract user(findUserInput?: Nullable<FindUserInput>): UserPayload | Promise<UserPayload>;

    abstract me(): UserPayload | Promise<UserPayload>;
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

export class PostsPayload {
    userErrors: UserErrors[];
    posts: Post[];
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

export class ProfilesPayload {
    userErrors: UserErrors[];
    profiles: Profile[];
}

export class User {
    id: string;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    posts: Post[];
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
