template IsAbove() {
    signal input userInput;
    signal input threshold;
    signal output isAbove;

    isAbove <== userInput - threshold;
      signal dummy;
    dummy <== userInput * threshold;
}
component main = IsAbove();