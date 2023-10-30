
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum FileType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT"
}

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
    files?: Nullable<Nullable<Upload>[]>;
}

export class FileUploadInput {
    title: string;
    content: string;
    files: Upload[];
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

export class UserError {
    message: string;
    field?: Nullable<string>;
    code: string;
}

export class AuthPayload {
    userErrors: UserError[];
    accessToken?: Nullable<string>;
    refreshToken?: Nullable<string>;
    user?: Nullable<User>;
}

export abstract class IMutation {
    abstract login(loginInput?: Nullable<LoginInput>): AuthPayload | Promise<AuthPayload>;

    abstract signup(signupInput?: Nullable<SignupInput>): AuthPayload | Promise<AuthPayload>;

    abstract refresh(): AuthPayload | Promise<AuthPayload>;

    abstract logout(): string | Promise<string>;

    abstract createPet(createPetInput: CreatePetInput): PetPayload | Promise<PetPayload>;

    abstract updatePet(updatePetInput: UpdatePetInput): PetPayload | Promise<PetPayload>;

    abstract removePet(id: number): Nullable<PetPayload> | Promise<Nullable<PetPayload>>;

    abstract postCreate(postCreateInput: PostCreateInput): PostPayload | Promise<PostPayload>;

    abstract fileUpload(files: FileUploadInput): boolean | Promise<boolean>;

    abstract profileCreate(createProfileInput: CreateProfileInput): ProfilePayload | Promise<ProfilePayload>;

    abstract profileUpdate(updateProfileInput: UpdateProfileInput): ProfilePayload | Promise<ProfilePayload>;

    abstract profileDelete(id: number): string | Promise<string>;
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

    abstract posts(): Nullable<Nullable<Post>[]> | Promise<Nullable<Nullable<Post>[]>>;

    abstract profile(id: string): Nullable<Profile> | Promise<Nullable<Profile>>;

    abstract profiles(): Profile[] | Promise<Profile[]>;

    abstract me(): Nullable<User> | Promise<Nullable<User>>;

    abstract user(findUserInput?: Nullable<FindUserInput>): Nullable<User> | Promise<Nullable<User>>;

    abstract users(): User[] | Promise<User[]>;
}

export class File {
    filename: string;
    mimetype: string;
    encoding: string;
    url: string;
    type: FileType;
    index: number;
}

export class Post {
    id: string;
    title: string;
    content: string;
    files: File[];
    user: User;
}

export class PostPayload {
    userErrors: UserError[];
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

export class UserPayload {
    user?: Nullable<User>;
    userErrors: UserError[];
}

export type Upload = any;
export type PostResult = Post | UserError;
type Nullable<T> = T | null;
