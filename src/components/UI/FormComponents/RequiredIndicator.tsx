export const RequiredIndicator = ({ required }: { required?: boolean }) =>
  required ? <span className="text-danger">*</span> : null;

export const RequiredIndicator2 = () => <span style={{ color: "red" }}>*</span>;
