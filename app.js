const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// api 1
app.get("/players/", async (req, res) => {
  const query = `select player_id as playerId,player_name as playerName from player_details;`;
  const response = await db.all(query);
  res.send(response);
});

app.get("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const query = `select player_id as playerId,player_name as playerName from player_details where player_id = ${playerId};`;
  const response = await db.get(query);
  res.send(response);
});

app.put("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const playerData = req.body;
  const { playerName } = playerData;
  const query = `update player_details set player_name = "${playerName}" where player_id = ${playerId};`;
  const response = await db.run(query);
  res.send("Player Details Updated");
});

// api4 match details of Id

app.get("/matches/:matchId", async (req, res) => {
  const { matchId } = req.params;
  const query = `select match_id as matchId,match,year from match_details where match_id = ${matchId};`;
  const response = await db.get(query);
  res.json(response);
});

//api 5 list of all matches by playerId

app.get("/players/:playerId/matches", async (req, res) => {
  const { playerId } = req.params;
  const query = `select match_details.match_id as matchId,match,year from match_details inner join player_match_score  where player_id = ${playerId};`;
  const response = await db.all(query);
  res.json(response);
});

// api 6 list of all players of  a specific match

app.get("/matches/:matchId/players", async (req, res) => {
  const { matchId } = req.params;
  const query = `select player_details.player_id as playerId,player_name as playerName from player_details inner join player_match_score where match_id = ${matchId} group by match_id;`;
  const response = await db.all(query);
  res.json(response);
});

// api 7 stats of player based on iD

app.get("/players/:playerId/playerScores", async (req, res) => {
  const { playerId } = req.params;
  const query = `select player_details.player_id as playerId,player_name as playerName,sum(score) as totalScore,sum(fours) as totalFours,sum(sixes) as totalSixes from player_details inner join player_match_score where player_match_score.player_id = ${playerId};`;
  const response = await db.get(query);
  res.json(response);
});

module.exports = app;
