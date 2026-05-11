import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ===== SUPABASE =====
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function App() {
  const [club, setClub] = useState(null);
  const [players, setPlayers] = useState([]);
  const [result, setResult] = useState("");

  // ===== CREATE CLUB =====
  async function createClub() {
    const { data } = await supabase
      .from("clubs")
      .insert([{ club_name: "My FC", coins: 1000 }])
      .select();

    const newClub = data[0];

    const starterPlayers = [];

    for (let i = 0; i < 11; i++) {
      starterPlayers.push({
        club_id: newClub.id,
        name: "Player " + (i + 1),
        rating: 50 + Math.floor(Math.random() * 30),
        pace: 50 + Math.floor(Math.random() * 30),
        shooting: 50 + Math.floor(Math.random() * 30),
        passing: 50 + Math.floor(Math.random() * 30),
      });
    }

    await supabase.from("players").insert(starterPlayers);

    loadClub(newClub.id);
  }

  // ===== LOAD CLUB =====
  async function loadClub(id) {
    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", id)
      .single();

    const { data: playerData } = await supabase
      .from("players")
      .select("*")
      .eq("club_id", id);

    setClub(clubData);
    setPlayers(playerData);
  }

  // ===== MATCH SIMULATION =====
  function playMatch() {
    let teamStrength = 0;

    players.forEach((p) => {
      teamStrength += p.rating;
    });

    const enemyStrength = 600 + Math.random() * 250;

    const winChance = teamStrength / (teamStrength + enemyStrength);
    const roll = Math.random();

    let coins = club.coins;

    if (roll < winChance) {
      coins += 300;
      setResult("🔥 WIN 2-1 (+300 coins)");
    } else {
      coins += 50;
      setResult("😢 LOSS 1-2 (+50 coins)");
    }

    supabase.from("clubs").update({ coins }).eq("id", club.id);

    setClub({ ...club, coins });
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>⚽ Football Empire MVP</h1>

      {!club && (
        <button onClick={createClub}>
          Create Club
        </button>
      )}

      {club && (
        <>
          <h2>{club.club_name}</h2>
          <h3>Coins: {club.coins}</h3>

          <button onClick={playMatch}>
            Play Match
          </button>

          <p>{result}</p>

          <h3>Players</h3>

          {players.map((p) => (
            <div key={p.id}>
              {p.name} — {p.rating}
            </div>
          ))}
        </>
      )}
    </div>
  );
}