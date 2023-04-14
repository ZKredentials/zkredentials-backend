import fs from "fs";
import * as snarkjs from "snarkjs";

const generateProof = async (userInput, threshold) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { userInput: userInput, threshold: threshold },
    "circuit/circuit_js/circuit.wasm",
    "circuit/circuit_final.zkey"
  );

  const vKey = JSON.parse(fs.readFileSync("circuit/verification_key.json"));

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (res === true) {
    console.log("Verification OK");
  } else {
    console.log("Invalid proof");
  }
  return { proof, publicSignals };
};

export { generateProof };
