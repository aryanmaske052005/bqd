pragma circom 2.0.0;

// Helper template to decompose a number into bits and enforce it is positive
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1 = 0;
    var e2 = 1;
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0; // Ensure it's 0 or 1
        lc1 += out[i] * e2;
        e2 = e2 + e2;
    }
    lc1 === in; // Ensure the sum of bits equals the input
}

// Helper template to check if in[0] < in[1]
template LessThan(n) {
    signal input in[2];
    signal output out;
    component n2b = Num2Bits(n+1);
    // If in[0] < in[1], then in[0] - in[1] is negative.
    // By adding 2^n, if in[0] < in[1], the n-th bit will be 0.
    // If in[0] >= in[1], the n-th bit will be 1.
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1 - n2b.out[n];
}

template AgeCheck() {
    // Private inputs
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;

    // Public inputs
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;

    // Output
    signal output isAdult;

    // Combine dates into a single integer YYYYMMDD
    // Example: 2005-05-20 -> 20050520
    signal birthDateAsInt;
    birthDateAsInt <== birthYear * 10000 + birthMonth * 100 + birthDay;

    signal currentDateAsInt;
    currentDateAsInt <== currentYear * 10000 + currentMonth * 100 + currentDay;

    // The threshold for 18 years old is simply 180000 in this format.
    // If currentDateAsInt - birthDateAsInt >= 180000, then age >= 18.
    // So we check if (birthDateAsInt + 180000) <= currentDateAsInt.
    
    component lt = LessThan(32); // 32 bits is enough for YYYYMMDD (max ~ 20501231 = 20M < 2^25)
    lt.in[0] <== currentDateAsInt;
    lt.in[1] <== birthDateAsInt + 180000;

    // If currentDateAsInt < birthDateAsInt + 180000, out is 1 (not an adult)
    // If currentDateAsInt >= birthDateAsInt + 180000, out is 0 (is an adult)
    isAdult <== 1 - lt.out;
}

component main { public [currentYear, currentMonth, currentDay] } = AgeCheck();
