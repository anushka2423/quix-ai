"use client";

import { useState } from "react";
import "./wall-of-fame.css";

type Entry = {
  name: string;
  score?: number;
  file: string;
  w: number;
  h: number;
};

/* Real Slack posts from certified alumni, highest score first. */
const ENTRIES: Entry[] = [
  { name: "Madhuri M", score: 1000, file: "madhuri-1000", w: 1871, h: 252 },
  {
    name: "Bhushan Veerapaneni",
    score: 955,
    file: "bhushan-955",
    w: 1586,
    h: 163,
  },
  { name: "Darcy Feld", score: 941, file: "darcy-941", w: 1900, h: 164 },
  { name: "Divya Nagpal", score: 926, file: "divya-926", w: 1176, h: 205 },
  {
    name: "Veronica Rechul",
    score: 911,
    file: "veronica-911",
    w: 1752,
    h: 104,
  },
  { name: "Arlene Martinez", score: 911, file: "arlene-911", w: 1136, h: 166 },
  { name: "Sanjay", score: 867, file: "sanjay-867", w: 1290, h: 151 },
  { name: "Deepa Kasineni", score: 852, file: "deepa-852", w: 1907, h: 210 },
  { name: "Sheena Patel", score: 808, file: "sheena-808", w: 1255, h: 211 },
];

const INITIAL = 4;

export default function WallOfFame() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ENTRIES : ENTRIES.slice(0, INITIAL);
  return (
    <section
      className="section wof"
      id="wall-of-fame"
      aria-labelledby="wof-title"
    >
      <div className="container">
        <div className="wof__head" data-reveal>
          <span className="eyebrow">Wall of fame</span>
          <h2 className="t-h1" id="wof-title">
            Passed, and <span className="wof__accent">proud of it.</span>
          </h2>
          <p className="t-lead wof__intro">
            Real messages our alumni posted right after their Claude
            certification exam.
          </p>
        </div>

        <div className="wof__grid">
          {[0, 1].map((col) => (
            <ul className="wof__col" key={col}>
              {visible
                .filter((_, i) => i % 2 === col)
                .map((e) => (
                  <li className="wof__card" key={e.file}>
                    <div className="wof__top">
                      {e.score ? (
                        <span className="wof__score">
                          {e.score}
                          <small>/1000</small>
                        </span>
                      ) : (
                        <span className="wof__score wof__score--text">
                          Passed
                        </span>
                      )}
                      <span className="wof__badge">
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          aria-hidden="true"
                        >
                          <g
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
                          </g>
                        </svg>
                        Claude Certified
                      </span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="wof__shot"
                      src={`/wall-of-fame/${e.file}.png`}
                      alt={`Slack message from ${e.name}${e.score ? ` reporting a score of ${e.score}` : ""} after passing the Claude certification exam`}
                      width={e.w}
                      height={e.h}
                      loading="lazy"
                    />
                    <div className="wof__who">
                      <strong>{e.name}</strong>
                      <span>Passed · Claude certification</span>
                    </div>
                  </li>
                ))}
            </ul>
          ))}
        </div>

        {ENTRIES.length > INITIAL && (
          <div className="wof__more">
            <button
              type="button"
              className="btn btn--secondary"
              aria-expanded={showAll}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show less" : "Show all"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
