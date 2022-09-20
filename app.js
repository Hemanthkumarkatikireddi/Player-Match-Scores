const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let database = null;
const initializeDbAndDatabase = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("working");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndDatabase();
//working with API
const convertingPlayer = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const convertingMatch = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

//Get players API
app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT
        *
    FROM
        player_details;`;
  const dbResponse = await database.all(getPlayers);
  response.send(dbResponse.map((each) => convertingPlayer(each)));
});
//Get Specific Id Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
        *
    FROM
        player_details
    WHERE
        player_id=${playerId};`;
  const dbResponse = await database.get(getPlayer);
  response.send(convertingPlayer(dbResponse));
});
//Update Player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
    UPDATE
        player_details
    SET
       player_name='${playerName}'
    WHERE
        player_id=${playerId};`;
  await database.run(updatePlayer);
  response.send("Player Details Updated");
});
//Get Match API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatch = `
    SELECT
        *
    FROM
        match_details
    WHERE
        match_id = ${matchId};`;
  const dbResponse = await database.get(getMatch);
  response.send(convertingMatch(dbResponse));
});
//GET all Matches of A Player
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getAllMatches = `
    SELECT
       *
    FROM
        player_match_score
    NATURAL JOIN
        match_details
    WHERE
        player_id=${playerId};`;
  const dbResponse = await database.all(getAllMatches);
  response.send(dbResponse.map((each) => convertingMatch(each)));
});
//GET Players in Mach
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersInMatch = `
    SELECT
        player_id,player_name
    FROM
        player_match_score
    NATURAL JOIN
        player_details
    WHERE
        match_id=${matchId};`;
  const dbResponse = await database.all(getPlayersInMatch);
  response.send(dbResponse.map((each) => convertingPlayer(each)));
});
//GET total score of a Player
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScore = `
    SELECT
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM
        player_match_score
    NATURAL JOIN
        player_details
    WHERE
        player_id=${playerId};`;
  const dbResponse = await database.get(getPlayerScore);
  response.send(dbResponse);
});
module.exports = app;
