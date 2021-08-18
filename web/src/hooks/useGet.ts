import { useEffect, useState } from "react";
import axios from "axios";

export const useGet = <T>(url: string) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [trigger, setTrigger] = useState(0);

  const refetch = () => {
    setIsError(false);
    setIsLoading(true);
    setTrigger(Date.now());
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await axios(url);
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [url, trigger]);

  return { data, isLoading, isError, refetch };
};
