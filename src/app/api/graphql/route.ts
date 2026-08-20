import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { analyticsTypeDefs } from "@/features/analytics/graphql/analytics.typedefs";
import { analyticsResolvers } from "@/features/analytics/graphql/analytics.resolvers";

const server = new ApolloServer({
  typeDefs: [analyticsTypeDefs],
  resolvers: [analyticsResolvers],
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req, res) => {
    return {
      req,
      res,
      reqId: crypto.randomUUID(),
    };
  },
});

export { handler as GET, handler as POST };
