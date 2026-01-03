// Trailer capacity constants
export const TRAILER_CAPACITY_SMALL = 8;
export const TRAILER_CAPACITY_LARGE = 12;
export const TRAILER_CAPACITY_BOOGIE = 16;
export function getTrailerCapacity(size?: string | null) {
    switch ((size || '').toLowerCase()) {
        case 'small': return TRAILER_CAPACITY_SMALL;
        case 'large': return TRAILER_CAPACITY_LARGE;
        case 'boogie': return TRAILER_CAPACITY_BOOGIE;
        default: return TRAILER_CAPACITY_SMALL;
    }
};
