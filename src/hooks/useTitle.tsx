import { useContext, useEffect } from "react";
import { TitleContext } from "../contexts/TitleContext";

const useTitle = (text: string) => {
  const { title, setTitle } = useContext(TitleContext);

  useEffect(() => setTitle(text), [text, setTitle]);

  return title;
};

export default useTitle;
