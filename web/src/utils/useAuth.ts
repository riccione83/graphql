import { NetworkStatus } from "@apollo/client";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useMeQuery } from "../generated/graphql";

export const useAuth = () => {
  const { data, loading, networkStatus } = useMeQuery();
  const history = useHistory();

  useEffect(() => {
    if (!loading && !data?.me && networkStatus !== NetworkStatus.error) {
      history.push("/");
    }
  }, [loading, data, history, networkStatus]);

  return [data, loading];
};
