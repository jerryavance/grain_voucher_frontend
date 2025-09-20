// function should be recursive
export const getErrorPaths = (
  errorObject: any,
  path: string[] = []
): string[] => {
  const errorPaths: string[] = [];
  Object.keys(errorObject).forEach((key) => {
    if (
      typeof errorObject[key] === "object" &&
      !Array.isArray(errorObject[key])
    ) {
      errorPaths.push(...getErrorPaths(errorObject[key], [...path, key]));
    } else {
      errorPaths.push([...path, key].join("."));
    }
  });
  return errorPaths;
};

export const setFormErrors = (errors: any, form: any, formfields: any) => {
  const backendErrors = getErrorPaths(errors);
  const expectedErrors = getErrorPaths(formfields);

  // check if backend errors are in expected errors
  const errorsInForm = backendErrors.filter((error) =>
    expectedErrors.includes(error)
  );

  if (errorsInForm.length === 0) {
    return true
  }

  // set errors in form
  form.setErrors(errors);
  return false
};
