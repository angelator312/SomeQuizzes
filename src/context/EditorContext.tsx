import React, { createContext, useContext } from 'react';

type EditorContextType = {
  isEditorMode: boolean;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{
  children: React.ReactNode;
  isEditorMode?: boolean;
}> = ({ children, isEditorMode = false }) => {
  return (
    <EditorContext.Provider value={{ isEditorMode }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorMode = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    return { isEditorMode: false };
  }
  return context;
};
