import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useMeQuery } from "../generated/graphql";

export const useAuth = () => {
  const { data, loading } = useMeQuery();
  const history = useHistory();

  useEffect(() => {
    if (!loading && !data?.me) {
      history.push("/");
    }
  }, [loading, data, history]);

  return [data, loading];
};
