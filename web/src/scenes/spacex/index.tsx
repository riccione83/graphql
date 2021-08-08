import React from "react";
import { useGet } from "../../hooks/useGet";

interface SpaceXFlight {
  flight_number: number;
  mission_name: string;
  mission_id: string[];
  upcoming: boolean;
  launch_year: number;
  launch_date_unix: number;
  launch_date_utc: string;
  launch_date_local: string;
  is_tentative: boolean;
  tentative_max_precision: number;
  tbd: boolean;
  launch_window: number;
  rocket: {
    rocket_id: string;
    rocket_name: string;
    rocket_type: string;
    first_stage: {
      cores: [
        {
          core_serial: string;
          flight: 1;
          block?: string;
          gridfins: boolean;
          legs: boolean;
          reused: boolean;
          land_success?: string;
          landing_intent: boolean;
          landing_type?: string;
          landing_vehicle?: string;
        }
      ];
    };
    second_stage: {
      block: 1;
      payloads: [
        {
          payload_id: string;
          norad_id: string[];
          reused: boolean;
          customers: string[];
          nationality: string;
          manufacturer: string;
          payload_type: string;
          payload_mass_kg: number;
          payload_mass_lbs: number;
          orbit: string;
          orbit_params: {
            reference_system: string;
            regime: string;
            longitude?: string;
            semi_major_axis_km?: string;
            eccentricity?: string;
            periapsis_km: number;
            apoapsis_km: number;
            inclination_deg: number;
            period_min?: string;
            lifespan_years?: string;
            epoch?: string;
            mean_motion?: string;
            raan?: string;
            arg_of_pericenter?: string;
            mean_anomaly?: string;
          };
        }
      ];
    };
    fairings: {
      reused: boolean;
      recovery_attempt: boolean;
      recovered: boolean;
      ship?: string;
    };
  };
  ships: [];
  telemetry: {
    flight_club?: string;
  };
  launch_site: {
    site_id: string;
    site_name: string;
    site_name_long: string;
  };
  launch_success: boolean;
  launch_failure_details: {
    time: number;
    altitude?: string;
    reason: string;
  };
  links: {
    mission_patch: string;
    mission_patch_small: string;
    reddit_campaign?: string;
    reddit_launch?: string;
    reddit_recovery?: string;
    reddit_media?: string;
    presskit?: string;
    article_link: string;
    wikipedia: string;
    video_link: string;
    youtube_id: string;
    flickr_images: [];
  };
  details: string;
  static_fire_date_utc: string;
  static_fire_date_unix: number;
  timeline: {
    webcast_liftoff: number;
  };
}

const SpaceXComponent: React.FC = () => {
  const { data, isError, isLoading } = useGet<SpaceXFlight>(
    "https://api.spacexdata.com/v3/launches"
  );

  if (isError) {
    return <div>Error on loading the data</div>;
  }
  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div>
      {data.map((flight) => {
        return (
          <div>
            {flight.mission_name}{" "}
            {flight.links.article_link && (
              <a
                href={`${flight.links.article_link}`}
                target="_blank"
                rel="noreferrer"
              >
                Link
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SpaceXComponent;
