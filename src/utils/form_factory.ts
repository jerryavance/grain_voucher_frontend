/*
    name of the field, can be nested, e.g. 'field1.field2.field3'
    initial value for the field
    label for the field
    text, number, date, time, datetime, file, image, color, password, email ...

    {xs, sm, md, lg, xl}
    options for select input
    selector for select input
*/
export interface IFormField {
  name: string;
  initailValue: any;
  initailValueReadPath?: string;
  label: string;
  type?: string;
  uiType: string;
  uiBreakpoints: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  isDisabled?: boolean;
  isHidden?: boolean;
  required?: boolean;
  accepts?: string;
  handleSearch?: (value: string) => void;

  // for select
  options?: any[];
  selector?: {
    value: (option: any) => any;
    label: (option: any) => any;
  };

  isClearable?: boolean;   // 👈 allow removing selection in select dropdowns

  // for date picker
  dateFormat?: string;

  // for phone number
  customFormat?: string;

  // for client account
  multipleAccounts?: boolean;

  // for text input
  multiline?: boolean;
  rows?: number;
  decimalPlaces?: number;
  max?: number;
  min?: number;

  // for select search with pagination
  parseFilter?: (...params: any) => any;
  dataFetcher?: (
    search: string,
    setData: (results: any) => void,
    extraFilters?: any,
    page?: number,
    pageSize?: number
  ) => Promise<{ data: any[]; hasMore: boolean; total?: number }>;
  pageSize?: number; // Number of items per page for paginated select
}

interface NestedObject {
  [key: string]: NestedObject | string;
}

// export function deepMerge<T extends NestedObject>(target: T, source: T): T {
//   for (const key of Object.keys(source)) {
//     if (typeof source[key] === "object" && source[key] !== null) {
//       if (!target[key]) {
//         target[key as keyof T] = {} as T[keyof T];
//       }
//       if (typeof target[key] === "object" && target[key] !== null) {
//         deepMerge(target[key], source[key]);
//       }
//     } else {
//       target[key as keyof T] = source[key as keyof T];
//     }
//   }
//   return target;
// }

// utils/form_factory.ts
export function deepMerge<T>(...objects: T[]): T {
  return objects.reduce((result, obj) => {
    if (!obj) return result;
    return {
      ...result,
      ...obj,
      ...Object.keys(obj).reduce((acc, key) => {
        const objValue = (obj as Record<string, unknown>)[key];
        const resultValue = (result as Record<string, unknown>)[key];
        if (
          typeof objValue === "object" &&
          objValue !== null &&
          !Array.isArray(objValue)
        ) {
          return {
            ...acc,
            [key]: deepMerge(
              (typeof resultValue === "object" && resultValue !== null && !Array.isArray(resultValue)) ? resultValue : {},
              objValue
            ),
          };
        }
        return acc;
      }, {}),
    };
  }, {} as T);
}

export const getInitialValues = (formFields: IFormField[]) => {
  return {
    ...formFields.reduce((acc1: any, field: IFormField) => {
      if (field.name.includes(".")) {
        const fieldNames = field.name.split(".");

        const nestedObject = fieldNames.reduceRight(
          (acc: any, fieldName: string, currentIndex: number) => {
            if (acc && currentIndex < fieldNames.length - 1) {
              return { [fieldName]: acc };
            }
            return { [fieldName]: field.initailValue };
          },
          {}
        );

        if (!acc1[fieldNames[0]]) {
          return { ...acc1, ...nestedObject };
        } else {
          return deepMerge(acc1, nestedObject);
        }
      }
      return { ...acc1, [field.name]: field.initailValue };
    }, {}),
  };
};

export const deepDerefrencer = (obj: any, path: string) => {
  return path.split(".").reduce((acc: any, field: string) => {
    if (acc) {
      return acc[field];
    }
    return undefined;
  }, obj);
};

export const deepDerefrencerValidations = (obj: any, path: string) => {
  return path.split(".").reduce((acc: any, field: string) => {
    if (acc) {
      return acc.fields[field];
    }
    return undefined;
  }, obj);
};

const setFallbackValue = (value: any, fallback: any) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  return value;
};

export const patchInitialValues = (formFields: IFormField[]) => {
  return (initialValues: any) => {
    return {
      ...formFields.reduce((acc1: any, field: IFormField) => {
        if (field.name.includes(".")) {
          const fieldNames = field.name.split(".");
          const nestedObject = fieldNames.reduceRight(
            (acc: any, fieldName: string, currentIndex: number) => {
              if (acc && currentIndex < fieldNames.length - 1) {
                return { [fieldName]: acc };
              }
              const path = field.initailValueReadPath
                ? field.initailValueReadPath
                : fieldNames.slice(0, currentIndex + 1).join(".");
              const value = setFallbackValue(
                deepDerefrencer(initialValues, path),
                ""
              );
              return { [fieldName]: value };
            },
            {}
          );

          if (!acc1[fieldNames[0]]) {
            return { ...acc1, ...nestedObject };
          } else {
            return deepMerge(acc1, nestedObject);
          }
        }
        return {
          ...acc1,
          [field.name]: setFallbackValue(
            deepDerefrencer(
              initialValues,
              field.initailValueReadPath || field.name
            ),
            ""
          ),
        };
      }, {}),
    };
  };
};



// /*
//     name of the field, can be nested, e.g. 'field1.field2.field3'
//     initial value for the field
//     label for the field
//     text, number, date, time, datetime, file, image, color, password, email ...

//     {xs, sm, md, lg, xl}
//     options for select input
//     selector for select input
// */
// export interface IFormField {
//   name: string;
//   initailValue: any;
//   initailValueReadPath?: string;
//   label: string;
//   type?: string;
//   uiType: string;
//   uiBreakpoints: {
//     xs?: number;
//     sm?: number;
//     md?: number;
//     lg?: number;
//     xl?: number;
//   };
//   isDisabled?: boolean;
//   isHidden?: boolean;
//   required?: boolean;
//   accepts?: string;
//   handleSearch?: (value: string) => void;

//   // for select
//   options?: any[];
//   selector?: {
//     value: (option: any) => any;
//     label: (option: any) => any;
//   };

//   isClearable?: boolean;   // 👈 allow removing selection in select dropdowns

//   // for date picker
//   dateFormat?: string;

//   // for phone number
//   customFormat?: string;

//   // for client account
//   multipleAccounts?: boolean;

//   // for text input
//   multiline?: boolean;
//   rows?: number;
//   decimalPlaces?: number;
//   max?: number;
//   min?: number;

//   // for select search
//   parseFilter?: (...params: any) => any;
//   dataFetcher?: (
//     search: string,
//     setData: (results: any) => void,
//     extraFilters?: any
//   ) => void;
// }

// interface NestedObject {
//   [key: string]: NestedObject | string;
// }

// // export function deepMerge<T extends NestedObject>(target: T, source: T): T {
// //   for (const key of Object.keys(source)) {
// //     if (typeof source[key] === "object" && source[key] !== null) {
// //       if (!target[key]) {
// //         target[key as keyof T] = {} as T[keyof T];
// //       }
// //       if (typeof target[key] === "object" && target[key] !== null) {
// //         deepMerge(target[key], source[key]);
// //       }
// //     } else {
// //       target[key as keyof T] = source[key as keyof T];
// //     }
// //   }
// //   return target;
// // }

// // utils/form_factory.ts
// export function deepMerge<T>(...objects: T[]): T {
//   return objects.reduce((result, obj) => {
//     if (!obj) return result;
//     return {
//       ...result,
//       ...obj,
//       ...Object.keys(obj).reduce((acc, key) => {
//         const objValue = (obj as Record<string, unknown>)[key];
//         const resultValue = (result as Record<string, unknown>)[key];
//         if (
//           typeof objValue === "object" &&
//           objValue !== null &&
//           !Array.isArray(objValue)
//         ) {
//           return {
//             ...acc,
//             [key]: deepMerge(
//               (typeof resultValue === "object" && resultValue !== null && !Array.isArray(resultValue)) ? resultValue : {},
//               objValue
//             ),
//           };
//         }
//         return acc;
//       }, {}),
//     };
//   }, {} as T);
// }

// export const getInitialValues = (formFields: IFormField[]) => {
//   return {
//     ...formFields.reduce((acc1: any, field: IFormField) => {
//       if (field.name.includes(".")) {
//         const fieldNames = field.name.split(".");

//         const nestedObject = fieldNames.reduceRight(
//           (acc: any, fieldName: string, currentIndex: number) => {
//             if (acc && currentIndex < fieldNames.length - 1) {
//               return { [fieldName]: acc };
//             }
//             return { [fieldName]: field.initailValue };
//           },
//           {}
//         );

//         if (!acc1[fieldNames[0]]) {
//           return { ...acc1, ...nestedObject };
//         } else {
//           return deepMerge(acc1, nestedObject);
//         }
//       }
//       return { ...acc1, [field.name]: field.initailValue };
//     }, {}),
//   };
// };

// export const deepDerefrencer = (obj: any, path: string) => {
//   return path.split(".").reduce((acc: any, field: string) => {
//     if (acc) {
//       return acc[field];
//     }
//     return undefined;
//   }, obj);
// };

// export const deepDerefrencerValidations = (obj: any, path: string) => {
//   return path.split(".").reduce((acc: any, field: string) => {
//     if (acc) {
//       return acc.fields[field];
//     }
//     return undefined;
//   }, obj);
// };

// const setFallbackValue = (value: any, fallback: any) => {
//   if (value === undefined || value === null) {
//     return fallback;
//   }
//   return value;
// };

// export const patchInitialValues = (formFields: IFormField[]) => {
//   return (initialValues: any) => {
//     return {
//       ...formFields.reduce((acc1: any, field: IFormField) => {
//         if (field.name.includes(".")) {
//           const fieldNames = field.name.split(".");
//           const nestedObject = fieldNames.reduceRight(
//             (acc: any, fieldName: string, currentIndex: number) => {
//               if (acc && currentIndex < fieldNames.length - 1) {
//                 return { [fieldName]: acc };
//               }
//               const path = field.initailValueReadPath
//                 ? field.initailValueReadPath
//                 : fieldNames.slice(0, currentIndex + 1).join(".");
//               const value = setFallbackValue(
//                 deepDerefrencer(initialValues, path),
//                 ""
//               );
//               return { [fieldName]: value };
//             },
//             {}
//           );

//           if (!acc1[fieldNames[0]]) {
//             return { ...acc1, ...nestedObject };
//           } else {
//             return deepMerge(acc1, nestedObject);
//           }
//         }
//         return {
//           ...acc1,
//           [field.name]: setFallbackValue(
//             deepDerefrencer(
//               initialValues,
//               field.initailValueReadPath || field.name
//             ),
//             ""
//           ),
//         };
//       }, {}),
//     };
//   };
// };
