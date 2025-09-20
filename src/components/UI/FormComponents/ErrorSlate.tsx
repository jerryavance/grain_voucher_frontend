import { CSSProperties } from "react";

const ErrorSlate = ({
  message,
  style,
}: {
  message: string | undefined;
  style?: CSSProperties;
}) => {
  return (
    <div
      className="font12"
      role="alert"
      style={{
        padding: 3,
        width: "100%",
        color: "red",
        ...style,
      }}
    >
      {typeof message === "string"
        ? message
        : Array.isArray(message)
          ? String(message?.[0])
          : "An unkown error occured while processing this request"}
    </div>
  );
};

export default ErrorSlate;
