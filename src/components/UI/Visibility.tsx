const Visibility = ({
  children,
  visible,
}: {
  children: any;
  visible: boolean;
}) => {
  return visible ? children : null;
};

export default Visibility;
