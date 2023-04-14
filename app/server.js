// server.js

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { gql, GraphQLClient } from 'graphql-request'
import { generateProof } from "./zk-snarks.js";
// Load environment variables from .env file
dotenv.config();

const app = express();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = "http://localhost:3000/github/callback";
const EXAMPLE_REPO_OWNER = "Multinate";
const EXAMPLE_REPO = "web3-donation-aggregator";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // replace * with your app's URL if possible
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.get("/github/login", (req, res) => {
  console.log("Trying to login");
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}`
  );
});

app.post("/generate", async (req, res) => {
  try {
    const access_token = req.body.token;
    const sponsorsThreshold = req.body.sponsors;
    const starredThreshold = req.body.starred;
    const prsThreshold = req.body.prs;
    const graphQLClient = new GraphQLClient("https://api.github.com/graphql", {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    })
    const gqlres = await graphQLClient.request(gql`
      query { 
        viewer { 
          login
          sponsors {
            totalCount
          }
          repositories(first: 1, orderBy: {field:STARGAZERS, direction: DESC}) {
            nodes {
              id
              name
              stargazerCount
              forks {
                totalCount
              }
            }
          }
          pullRequests{
            totalCount
          }
        }
      }
    `)
    const sponsors = +gqlres.viewer.sponsors.totalCount
    const starred = +gqlres.viewer.repositories.nodes[0].stargazerCount
    const prs = +gqlres.viewer.pullRequests.totalCount
    // // Generate ZK-SNARK proof for number of contributions
    const sponsorProof = await generateProof(sponsors, sponsorsThreshold);
    const starredProof = await generateProof(starred, starredThreshold);
    const prsProof = await generateProof(prs, prsThreshold);
    res.send({
      sponsorProof: sponsorProof.proof,
      starredProof: starredProof.proof,
      prsProof: prsProof.proof
    });
  } catch (error) {
    res.send({
      e: error,
    });
  }
});

app.post("/stats", async (req, res) => {
  try {
    const access_token = req.body.token;
    const graphQLClient = new GraphQLClient("https://api.github.com/graphql", {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    })
    const gqlres = await graphQLClient.request(gql`
      query { 
        viewer { 
          login
          sponsors {
            totalCount
          }
          repositories(first: 1, orderBy: {field:STARGAZERS, direction: DESC}) {
            nodes {
              id
              name
              stargazerCount
            }
          }
          pullRequests{
            totalCount
          }
        }
      }
    `)
    console.log(gqlres.viewer.repositories)
    res.send({
      sponsors: gqlres.viewer.sponsors.totalCount,
      starred: gqlres.viewer.repositories.nodes[0].stargazerCount,
      prs: gqlres.viewer.pullRequests.totalCount
    });
  } catch (error) {
    console.log(error)
    res.send({
      // user: contributionResponse.data[0].login,
      // contributions: contributions,
      e: error,
    });
  }
});

app.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }
    );
    let data = response.data;
    const access_token = data.split("=")[1].split("&")[0];
    res.send({
      token: access_token,
    });
  } catch (error) {
    res.send({
      e: error,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
