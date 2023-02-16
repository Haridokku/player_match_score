const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
  app.listen(3000, () => console.log("Server Running at localhost:3000"));
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const playerQuery = `
    SELECT 
      player_id AS playerId,player_name AS playerName
    FROM
      player_details;`;
  const playerArray = await db.all(playerQuery);
  response.send(playerArray);
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT 
      player_id AS playerId,player_name AS playerName
    FROM
      player_details
    WHERE player_id=${playerId};`;
  const player = await db.get(playerQuery);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQuery = `
    UPDATE
      player_details
    SET player_name='${playerName}'
    WHERE player_id=${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    SELECT 
      match_id AS matchId,match,year
    FROM
      match_details
    WHERE match_id=${matchId};`;
  const match1 = await db.get(matchQuery);
  response.send(match1);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const gettingPlayers = `
    SELECT 
      match_id AS matchId,match,year
    FROM 
      match_details NATURAL JOIN player_match_score 
    WHERE player_match_score.player_id=${playerId};`;
  const matchesArray = await db.all(gettingPlayers);
  response.send(matchesArray);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const gettingPlayers = `
    SELECT 
      player_id AS playerId,player_name AS playerName
    FROM 
      player_details NATURAL JOIN player_match_score 
    WHERE player_match_score.match_id=${matchId};`;
  const matchesArray = await db.all(gettingPlayers);
  response.send(matchesArray);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const scoreQuery = `
    SELECT 
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(player_match_score.fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_details INNER JOIN player_match_score
    ON player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id=${playerId};`;
  const scores = await db.get(scoreQuery);
  response.send(scores);
});

module.exports = app;
