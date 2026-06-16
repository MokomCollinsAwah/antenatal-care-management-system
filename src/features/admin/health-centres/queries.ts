import {
  getHealthCentre,
  getHealthCentreOptions,
  listHealthCentres,
} from "@/server/services/healthCentreService";

export const getHealthCentres = listHealthCentres;
export const getHealthCentreDetails = getHealthCentre;
export const getHealthCentresForSelect = getHealthCentreOptions;
