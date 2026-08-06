"use client";

import { useState } from "react";
import { Intro } from "./Intro";
import { Chrome } from "./Chrome";
import { HorizontalTrack, type TrackPosition } from "./HorizontalTrack";
import { StationIndex } from "./stations/StationIndex";
import { StationThesis } from "./stations/StationThesis";
import { StationWork } from "./stations/StationWork";
import { StationTrajectory } from "./stations/StationTrajectory";
import { StationProof } from "./stations/StationProof";
import { StationSignal } from "./stations/StationSignal";
import type { SiteContent } from "@/content/types";

const STATION_COUNT = 6;

export function Catalog({ content }: { content: SiteContent }) {
  const [position, setPosition] = useState<TrackPosition>({
    progress: 0,
    index: 0,
    name: "INDEX",
  });

  const { settings, projects, experience, awards } = content;

  return (
    <>
      <Intro name={settings.name} role={settings.role} />

      <Chrome
        name={settings.name}
        stationIndex={position.index}
        stationCount={STATION_COUNT}
        stationName={position.name}
        progress={position.progress}
      />

      <HorizontalTrack onPosition={setPosition}>
        {(containerAnimation) => (
          <>
            <StationIndex
              settings={settings}
              containerAnimation={containerAnimation}
            />
            <StationThesis
              settings={settings}
              containerAnimation={containerAnimation}
            />
            <StationWork
              projects={projects}
              workIntro={settings.workIntro}
              containerAnimation={containerAnimation}
            />
            <StationTrajectory
              experience={experience}
              containerAnimation={containerAnimation}
            />
            <StationProof
              awards={awards}
              containerAnimation={containerAnimation}
            />
            <StationSignal
              settings={settings}
              containerAnimation={containerAnimation}
            />
          </>
        )}
      </HorizontalTrack>
    </>
  );
}
