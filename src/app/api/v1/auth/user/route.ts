import {
  CreateUserInput,
  CreateUserSchema,
  FetchUserInput,
  FetchUsersSchema,
} from "@/features/user/schemas/user.schema";
import { CreateUser } from "@/features/user/services/create-user.service";
import { FetchUsers } from "@/features/user/services/fetch-users.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const GET = CreateApiRoute({
  moduleName: "FetchUsersAPI",
  schema: FetchUsersSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_ALL_USERS",
  },
  handler: async (req: FetchUserInput) => {
    return await FetchUsers(req);
  },
});

export const POST = CreateApiRoute({
  moduleName: "CreateUserAPI",
  schema: CreateUserSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_USER",
  },
  handler: async (body: CreateUserInput, session: any, logger: any) => {
    return await CreateUser(body, session, logger);
  },
});
