// server.js

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { gql, GraphQLClient } from 'graphql-request'
// Load environment variables from .env file
dotenv.config();

const app = express();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = "http://localhost:3000/github/callback";
const EXAMPLE_REPO_OWNER = "Multinate";
const EXAMPLE_REPO = "web3-donation-aggregator";

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

app.get("/github/callback", async (req, res) => {
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
  console.log(gqlres.viewer.sponsors.totalCount)
  console.log(gqlres.viewer.repositories.nodes[0].stargazerCount)
  // console.log(gqlres.viewer.repositories.nodes[0].forks.totalCount)
  console.log(gqlres.viewer.pullRequests.totalCount)
  // let contributions = contributionResponse.data[0].contributions;
  // Generate ZK-SNARK proof for number of contributions
  // const proof = await generateProof(contributions);
  // console.log("Proof: ", proof);
  res.send({
    repo: EXAMPLE_REPO,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
