import {
  UpdateUserInput,
  UpdateUserSchema,
} from "@/features/user/schemas/user.schema";
import { DeleteUser } from "@/features/user/services/delete-user.service";
import { UpdateUser } from "@/features/user/services/update-user.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateUserAPI",
  schema: UpdateUserSchema,
  requiresAuth: {
    status: true,
    permission: "UPDATE_USER",
  },
  handler: async (
    body: UpdateUserInput,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await UpdateUser(body, session, params, logger);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteUserAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_USER",
  },
  handler: async (
    body: any,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await DeleteUser(session, params, logger);
  },
});
