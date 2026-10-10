import { rawBrand } from "./brand-data.js";
import { type Brand, brandSchema } from "./brand-schema.js";

/** The validated brand facts. A schema violation fails every consumer's build. */
export const brand: Brand = brandSchema.parse(rawBrand);
