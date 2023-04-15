// server.js

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { gql, GraphQLClient } from 'graphql-request'
import { generateProof } from "./zk-snarks.js";
import { Web3Storage, getFilesFromPath, File } from 'web3.storage'

// Load environment variables from .env file
dotenv.config();

const app = express();
const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI =process.env.GITHUB_CALLBACK;
const EXAMPLE_REPO_OWNER = "Multinate";
const EXAMPLE_REPO = "web3-donation-aggregator";

function makeStorageClient () {
  return new Web3Storage({ token: WEB3STORAGE_TOKEN })
}
function makeFileObjects (obj, name) {
  // You can create File objects from a Buffer of binary data
  // see: https://nodejs.org/api/buffer.html
  // Here we're just storing a JSON object, but you can store images,
  // audio, or whatever you want!
  // const obj = { hello: 'world' }
  const buffer = Buffer.from(JSON.stringify(obj))

  const files = [
    new File([buffer], `${name}.json`)
  ]
  return files
}

function makeStringFile (txt, name) {
  const files = [
    new File([txt], `${name}.txt`),
  ]
  return files
}

async function storeFiles (files) {
  const client = makeStorageClient()
  const cid = await client.put(files)
  console.log('stored files with cid:', cid)
  return cid
}

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
    const address = req.body.address;
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
    let sponsorProofFileCID
    if (sponsorsThreshold) {
      const sponsorProof = await generateProof(sponsors, sponsorsThreshold);
      const sponsorProofFile = await makeStringFile(sponsorProof.proof, 'sponsorProof')
      sponsorProofFileCID = await storeFiles(sponsorProofFile)
    }
    let starredProofFileCID
    if (starredThreshold) {
      const starredProof = await generateProof(starred, starredThreshold);
      const starredProofFile = await makeStringFile(starredProof.proof, 'starredProof')
      starredProofFileCID = await storeFiles(starredProofFile)
    }
    let prsProofFileCID
    if (prsThreshold) {
      const prsProof = await generateProof(prs, prsThreshold);
      const prsProofFile = await makeStringFile(prsProof.proof, 'prsProof')
      prsProofFileCID = await storeFiles(prsProofFile)
    }

    const resumeFile = await makeFileObjects({
      address,
      ...(prsThreshold && { prs: prsProofFileCID,
        prsThreshold}),
      starred: starredProofFileCID,
      ...(starredThreshold && {       starred: starredProofFileCID,
        starredThreshold,}),
      ...(sponsorsThreshold && {       sponsor: sponsorProofFileCID,
        sponsorsThreshold})
      }, 'resume')
    const resumeCID = await storeFiles(resumeFile)
    res.send({
      cid: resumeCID
    });
  } catch (error) {
    console.log(error)
    res.send({
      e: error,
    });
  }
});

app.post("/generateworld", async (req, res) => {
  try {
    const address = req.body.address;
    // // Generate ZK-SNARK proof for number of contributions
    const worldProof = await generateProof(1, 0);
    const worldProofFile = await makeStringFile(worldProof.proof, 'worldProof')
    const worldProofFileCID = await storeFiles(worldProofFile)
    res.send({
      cid: worldProofFileCID
    });
  } catch (error) {
    console.log(error)
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
    res.redirect("http://localhost:3000/github/callback?access_token="+access_token);
  } catch (error) {
    res.send({
      e: error,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
