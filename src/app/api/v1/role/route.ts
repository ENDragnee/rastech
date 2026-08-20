import {
  CreateRoleInput,
  CreateRoleSchema,
  FetchRoleInput,
  FetchRoleSchema,
} from "@/features/role/schemas/role.schema";
import { CreateRole } from "@/features/role/services/create-role.service";
import { FetchRoles } from "@/features/role/services/fetch-roles.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateRoleAPI",
  schema: CreateRoleSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_ROLE",
  },
  handler: async (body: CreateRoleInput, session: any, logger: any) => {
    return await CreateRole(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchRoleAPI",
  schema: FetchRoleSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_ROLE",
  },
  handler: async (req: FetchRoleInput) => {
    return await FetchRoles(req);
  },
});
