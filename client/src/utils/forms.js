// Maps the API's { errors: [{ field, message }] } onto react-hook-form fields.
export const applyServerErrors = (error, setError) => {
  (error?.fieldErrors || []).forEach(({ field, message }) => {
    if (field) setError(field, { type: "server", message });
  });
};
