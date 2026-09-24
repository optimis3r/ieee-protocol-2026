import type { EventData, Puzzle } from "./types";
export function initialData(): EventData {
  const descriptions = [
    [
      "The Blackout Audio",
      "SIGNAL",
      "Listen to the recording at the physical Node. Identify the intercepted time.",
      "17:45",
    ],
    [
      "The Pushpin Corkboard",
      "OBSERVATION",
      "Find the geometric center of the three pushpins on the campus map.",
      "",
    ],
    [
      "The UV Hidden Marker",
      "OBSERVATION",
      "Use the tethered UV flashlight to recover the cipher key.",
      "Caesar -3",
    ],
    [
      "The Red Filter / Cardan Grille",
      "LOGIC",
      "Use the red acrylic sheet, then decode the recovered message using the key from Node 03.",
      "Bypass Protocol Alpha",
    ],
    [
      "The Redacted Archive & Terminal",
      "SYSTEM",
      "Illuminate the redacted document from behind to identify the rogue asset.",
      "K-24",
    ],
    [
      "The Dead Drop Handler",
      "SOCIAL",
      "Find the volunteer with a yellow lanyard and green pen. Say: “The packet dropped at midnight.” Enter the envelope PIN.",
      "8391",
    ],
    [
      "Rogue Intel",
      "SOCIAL",
      "A CONFIDENTIAL LEAK claims Room 102. It is dated Tuesday, September 26, 2026, and signed by Agent M-88. Check the date and the terminated-agent record at Node 05.",
      "FLAG AS FORGED / COMPROMISED",
    ],
  ];
  const nodes: Puzzle[] = descriptions.map(
    ([title, category, description, answer], i) => ({
      id: `NODE-0${i + 1}`,
      title,
      category,
      description,
      instructions: "",
      input: i === 1 ? "select" : i === 5 ? "pin" : i === 6 ? "choice" : "text",
      options:
        i === 6
          ? ["AUTHORIZE AS VALID INTEL", "FLAG AS FORGED / COMPROMISED"]
          : [],
      answers: answer ? [answer] : [],
      patterns: [],
      exact: false,
      points: i === 6 ? 50 : 20,
      penalty: i === 6 ? 40 : 0,
      minSeconds: 300,
      attemptLimit: i === 6 ? 1 : 0,
      enabled: i !== 1,
      published: true,
      notes:
        i === 1
          ? "Configure the real location and dropdown options before enabling."
          : "",
      clue: answer,
      assets: [],
      revision: 1,
    }),
  );
  nodes[0].answers.push("1745", "17:45 hrs", "5:45 pm");
  nodes[2].answers.push("Shift -3", "-3");
  nodes[4].answers.push("K. Sharma", "K Sharma", "K. Sharma (K-24)");
  return {
    version: 1,
    rules: {
      phase: "SETUP",
      deadline: "2026-09-26T20:00:00+05:30",
      leaderboardVisible: false,
      whatsappUrl: "",
      starterCount: 1,
      nodeCap: 140,
      handshakePoints: 10,
      handshakeCap: 40,
      mainAttempts: 2,
      partialPoints: 40,
      fullPoints: 150,
      wrongPenalty: 25,
      trustCooperate: 30,
      trustDefect: 40,
      trustVictim: -10,
    },
    nodes,
    participants: [],
    transactions: [],
    audit: [],
    handshakes: [],
    encounters: [],
    broadcasts: [],
    requests: {},
    lockedLeaderboard: null,
  };
}
