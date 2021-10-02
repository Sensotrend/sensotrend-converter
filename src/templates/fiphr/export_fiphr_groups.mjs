import { medicationAdministrationA10ACGroup } from './export_MedicationAdministrationA10AC.mjs';
import { medicationAdministrationinsShortFastGroup } from './export_MedicationAdministrationins-short-fast.mjs';
import { medicationAdministrationsIntermediateLongGroup } from './export_MedicationAdministrations-intermediate-long.mjs';
import { observation90597Group } from './export_Observation9059-7.mjs';
import { observation147439Group } from './export_Observation14743-9.mjs';
import { observation147454Group } from './export_Observation14745-4.mjs';

export const exportFiphrGroups = {
  ...medicationAdministrationA10ACGroup,
  ...medicationAdministrationinsShortFastGroup,
  ...medicationAdministrationsIntermediateLongGroup,
  ...observation90597Group,
  ...observation147439Group,
  ...observation147454Group,
};
