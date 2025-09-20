// useBackNavigation.tsx
import { useNavigate } from "react-router-dom";

const useBackNavigation = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return { goBack };
};

export default useBackNavigation;
