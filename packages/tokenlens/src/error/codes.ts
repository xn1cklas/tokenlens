import { defineErrorCodes } from "../utils/error-codes.js";

export const BASE_ERROR_CODES = defineErrorCodes({
  MODEL_NOT_FOUND: "The model could not be found within the selected catalog",
  CATALOG_NOT_FOUND: "The catalog could not be found",
});
