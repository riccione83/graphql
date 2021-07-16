import { ApolloCache } from "@apollo/client";
import { MeDocument, MeQuery } from "../generated/graphql";

export const updateMe = (cache: ApolloCache<any>, { data }: any) => {
  cache.writeQuery<MeQuery>({
    query: MeDocument,
    data: {
      __typename: "Query",
      me: data?.login?.user,
    },
  });
};

export const clearMe = (cache: ApolloCache<any>, { data }: any) => {
  console.info("clear me", data);
  cache.writeQuery<MeQuery>({
    query: MeDocument,
    data: {
      __typename: "Query",
      me: undefined,
    },
  });
};
