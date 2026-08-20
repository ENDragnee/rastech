import {
  UpdateRoleInput,
  UpdateRoleSchema,
} from "@/features/role/schemas/role.schema";
import { DeleteRole } from "@/features/role/services/delete-role.service";
import { UpdateRole } from "@/features/role/services/update-role.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateRoleAPI",
  schema: UpdateRoleSchema,
  requiresAuth: {
    status: true,
    permission: "UPDATE_ROLE",
  },
  handler: async (
    body: UpdateRoleInput,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await UpdateRole(body, session, params, logger);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteRoleAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_ROLE",
  },
  handler: async (
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await DeleteRole(session, params, logger);
  },
});
