export const PK_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Abbottabad', 'Mardan', 'Mingora',
  'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Sheikhupura', 'Jhelum', 'Wah Cantt',
  'Dera Ghazi Khan', 'Nawabshah', 'Okara', 'Chiniot', 'Mirpur', 'Other',
] as const;

export const US_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Dallas, TX', 'Austin, TX', 'Jacksonville, FL', 'San Jose, CA',
  'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'Indianapolis, IN',
  'Seattle, WA', 'Denver, CO', 'Washington, DC', 'Boston, MA',
  'Nashville, TN', 'Detroit, MI', 'Portland, OR', 'Las Vegas, NV',
  'Miami, FL', 'Atlanta, GA', 'Other',
] as const;

export type OrderMarket = 'pk' | 'us';
export type CustomerDetails = {
  name?: unknown;
  phone?: unknown;
  city?: unknown;
  address?: unknown;
  [key: string]: unknown;
};

export type FieldErrors = Record<string, string>;

const PK_PHONE = /^(030[0-9]|031[0-9]|032[0-9]|033[0-9]|034[0-9]|0355|036[0-9])\d{7}$/;
const US_PHONE = /^[2-9]\d{2}[2-9]\d{6}$/;
const ADDRESS_TOKEN = /\b(house|flat|apartment|apt|unit|suite|street|st|road|rd|avenue|ave|lane|ln|block|sector|phase|plot|floor|building|near|opposite|behind|gali|mohalla|town|colony|district|county|drive|dr|boulevard|blvd|highway|hwy|way|court|ct|parkway|pkwy)\b/i;

export function normalizePhone(value: unknown, market: OrderMarket): { value?: string; error?: string } {
  const raw = String(value ?? '').trim();
  const compact = raw.replace(/[\s().-]/g, '');
  if (/[A-Za-z]/.test(compact)) return { error: 'Phone must contain digits only.' };

  if (market === 'pk') {
    const local = compact.startsWith('+92') ? `0${compact.slice(3)}` : compact;
    if (!/^03\d{9}$/.test(local) || !PK_PHONE.test(local)) {
      return { error: 'Enter a valid Pakistani mobile number with a valid network prefix, e.g. 03001234567.' };
    }
    return { value: local };
  }

  const local = compact.startsWith('+1') ? compact.slice(2) : compact;
  if (!US_PHONE.test(local)) return { error: 'Enter a valid 10-digit US phone number.' };
  return { value: local };
}

export function validateName(value: unknown): string | undefined {
  const name = String(value ?? '').trim();
  if (name.length < 2) return 'Name must be at least 2 characters.';
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) return 'Name may contain only letters, spaces, apostrophes, periods, and hyphens.';
  return undefined;
}

export function validateAddress(value: unknown): string | undefined {
  const address = String(value ?? '').trim();
  if (address.length < 8) return 'Address must be at least 8 characters.';
  if (/\s/.test(address) === false) return 'Address must include more than one word.';
  if (!/[0-9]/.test(address) && !ADDRESS_TOKEN.test(address)) return 'Address must include a house/street number or a recognizable street token.';
  if (!/[aeiou]/i.test(address)) return 'Address does not look like a valid address.';
  if (/[^aeiou\s]{6,}/i.test(address)) return 'Address contains an unusually long consonant sequence.';
  if (/[|@#$%^_*+=<>]/.test(address)) return 'Address contains invalid characters.';
  return undefined;
}

function canonicalCity(value: unknown, market: OrderMarket): string | undefined {
  const city = String(value ?? '').trim().toLowerCase();
  const options = market === 'pk' ? PK_CITIES : US_CITIES;
  return options.find(option => option.toLowerCase() === city);
}

export function validateAccountDetails(details: CustomerDetails, market: OrderMarket = 'pk') {
  const fieldErrors: FieldErrors = {};
  const phone = normalizePhone(details.phone, market);
  const nameError = validateName(details.name);
  const addressError = validateAddress(details.address);
  if (nameError) fieldErrors.name = nameError;
  if (phone.error) fieldErrors.phone = phone.error;
  if (addressError) fieldErrors.address = addressError;
  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    normalized: { ...details, name: String(details.name ?? '').trim(), phone: phone.value ?? details.phone, address: String(details.address ?? '').trim() },
  };
}

export function validateCustomerDetails(details: CustomerDetails, market: OrderMarket) {
  const account = validateAccountDetails(details, market);
  const fieldErrors = { ...account.fieldErrors };
  const city = canonicalCity(details.city, market);
  if (!city) fieldErrors.city = `Choose a city from the ${market === 'pk' ? 'Pakistan' : 'US'} city list.`;
  const requiresCityReview = city === 'Other';
  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    requiresCityReview,
    normalized: { ...account.normalized, city: city ?? details.city },
  };
}

export function getOrderVerification(details: CustomerDetails, market: OrderMarket) {
  const result = validateCustomerDetails(details, market);
  const verification = details.verification && typeof details.verification === 'object'
    ? details.verification as { phone?: { confirmed?: boolean }; city?: { reviewed?: boolean } }
    : {};
  const phoneConfirmed = verification.phone?.confirmed === true;
  const cityReviewed = verification.city?.reviewed === true;
  const addressPass = !result.fieldErrors.address;
  const phonePass = !result.fieldErrors.phone && phoneConfirmed;
  const cityPass = !result.fieldErrors.city && (!result.requiresCityReview || cityReviewed);
  return {
    ...result,
    checks: {
      address: { pass: addressPass, reason: result.fieldErrors.address ?? 'Address format is valid.' },
      phone: { pass: phonePass, reason: result.fieldErrors.phone ?? (phoneConfirmed ? 'Phone is confirmed.' : 'Phone needs manual confirmation.') },
      city: { pass: cityPass, reason: result.fieldErrors.city ?? (result.requiresCityReview && !cityReviewed ? 'Other requires admin review.' : 'City is on the approved list.') },
    },
    allPass: addressPass && phonePass && cityPass,
  };
}