import React from "react";
import { useGet } from "../../hooks/useGet";

interface Props {}

const SpaceXComponent: React.FC<Props> = ({ ...props }: Props) => {
  const { data, isError, isLoading } = useGet(
    "https://api.spacexdata.com/v3/launches"
  );

  if (isError) {
    return <div>Error on loading the data</div>;
  }
  return isLoading ? <div>Loading...</div> : <div>{JSON.stringify(data)}</div>;
};

export default SpaceXComponent;
