// Trailer capacity constants
export const TRAILER_CAPACITY_SMALL = 3;
export const TRAILER_CAPACITY_LARGE = 6;
export const TRAILER_CAPACITY_BOOGIE = 9;
export function getTrailerCapacity(size?: string | null) {
    switch ((size || '').toLowerCase()) {
        case 'small': return TRAILER_CAPACITY_SMALL;
        case 'large': return TRAILER_CAPACITY_LARGE;
        case 'boogie': return TRAILER_CAPACITY_BOOGIE;
        default: return TRAILER_CAPACITY_SMALL;
    }
};
