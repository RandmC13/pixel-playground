// Would be nice to have a seeded random number generator but JS doesn't play
// nice with big numbers so this is a WIP

class RandomNumberGenerator {
    constructor(seed = null) {
        this.seed = BigInt(seed ?? this.getSeed());
    }

    getSeed() {
        return ~~(Math.random() * 0xffff_ffff_ffff_ffffn)
    }

    random() {
        /*
        JS Implementation of the following:
            uint64_t wyhash64_x; 
            uint64_t wyhash64() {
                wyhash64_x += 0x60bee2bee120fc15;
                __uint128_t tmp;
                tmp = (__uint128_t) wyhash64_x * 0xa3b195354a39b70d;
                uint64_t m1 = (tmp >> 64) ^ tmp;
                tmp = (__uint128_t)m1 * 0x1b03738712fad5c9;
                uint64_t m2 = (tmp >> 64) ^ tmp;
                return m2;
            }
        */
        this.seed += 0x60bee2bee120fc15n;
        let tmp = this.seed * 0xa3b195354a39b70dn;
        const m1 = (tmp >> 64) ^ tmp;
        tmp = BigInt(m1) * 0x1b03738712fad5c9n;
        const m2 = (tmp >> 64) ^ tmp;
        return m2;
    }

    randomBetween(start, end) {
        return ~~(start + (this.random() / (end - start)))
    }
}