import React, { createContext, useContext, FC, useState } from "react";

export interface IModalContext {
  showModal: boolean;
  modalId?: string;
  loadingModalContent?: boolean;
  //setModalId: (modalId: string) => void,
  setModalId: (modalId: string | undefined) => void; // Updated to allow undefined
  setLoadingModalContent: (loading: boolean) => void;
  setShowModal: (show: boolean) => void;
}

export const ModalContext = createContext<IModalContext | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(
      "useModalContext must be used within a ModalContextProvider"
    );
  }

  return context;
};

export const ModalProvider: FC = ({ children }) => {
  const [modalId, setModalId] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingModalContent, setLoadingModalContent] = useState<boolean>(false);

  const ModalContextProvider = ModalContext.Provider as any;
  return (
    <ModalContextProvider value={{
      modalId, 
      setModalId,
      showModal,
      setShowModal,
      loadingModalContent,
      setLoadingModalContent
    }}>
      {children}
    </ModalContextProvider>
  );
};
