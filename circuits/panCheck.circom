pragma circom 2.0.0;

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1 = 0;
    var e2 = 1;
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * e2;
        e2 = e2 + e2;
    }
    lc1 === in;
}

template LessThan(n) {
    signal input in[2];
    signal output out;
    component n2b = Num2Bits(n+1);
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1 - n2b.out[n];
}

// Checks if lowerBound <= in <= upperBound
template InRange(n) {
    signal input in;
    signal input lowerBound;
    signal input upperBound;
    signal output out;

    component lt1 = LessThan(n);
    lt1.in[0] <== in;
    lt1.in[1] <== lowerBound; // 1 if in < lowerBound

    component lt2 = LessThan(n);
    lt2.in[0] <== upperBound;
    lt2.in[1] <== in; // 1 if upperBound < in

    // Valid if both are 0
    signal isBelow <== lt1.out;
    signal isAbove <== lt2.out;

    out <== (1 - isBelow) * (1 - isAbove);
}

template PANCheck() {
    signal input pan[10];
    signal output isValid;

    component ranges[10];

    signal validSteps[11];
    validSteps[0] <== 1;

    for (var i = 0; i < 10; i++) {
        ranges[i] = InRange(8); // ASCII fits in 8 bits
        ranges[i].in <== pan[i];

        if (i < 5 || i == 9) {
            // Uppercase letter (65 to 90)
            ranges[i].lowerBound <== 65;
            ranges[i].upperBound <== 90;
        } else {
            // Digit (48 to 57)
            ranges[i].lowerBound <== 48;
            ranges[i].upperBound <== 57;
        }

        validSteps[i+1] <== validSteps[i] * ranges[i].out;
    }

    isValid <== validSteps[10];
}

component main = PANCheck();
