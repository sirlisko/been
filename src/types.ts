declare const _brand: unique symbol;
export type CountryCode = string & { readonly [_brand]: "CountryCode" };
