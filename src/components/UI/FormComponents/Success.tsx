

const Success = ({ message }: { message: string }) => {
  return (
    <div
      className="alert alert-success text-center"
      role="alert"
      style={{ margin: 10 }}
    >
      {message}
    </div>
  );
};

export default Success;
