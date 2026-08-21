import { FetchModulesWithPermissions } from "@/features/role/services/fetch-permissions.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const GET = CreateApiRoute({
  moduleName: "FetchPermissionsAPI",
  requiresAuth: {
    status: true,
    permission: "FETCH_ROLE",
  },
  handler: async () => {
    return await FetchModulesWithPermissions();
  },
});
