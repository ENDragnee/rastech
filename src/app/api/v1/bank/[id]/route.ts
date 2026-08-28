import {
  UpdateBankSchema,
  UpdateBankInput,
} from "@/features/bank/schemas/bank.schema";
import { UpdateBank } from "@/features/bank/services/update-bank.service";
import { DeleteBank } from "@/features/bank/services/delete-bank.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateBankAPI",
  schema: UpdateBankSchema,
  requiresAuth: {
    status: true,
    permission: "UPDATE_BANK",
  },
  handler: async (body: UpdateBankInput, session: any, context: any) => {
    return await UpdateBank(context.id, body);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteBankAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_BANK",
  },
  handler: async (body: any, session: any, context: any) => {
    return await DeleteBank(context.id);
  },
});
