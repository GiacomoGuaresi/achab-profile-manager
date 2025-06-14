// FileActionsContext.js
import React, { createContext, useState, useContext } from 'react';

const FileActionsContext = createContext({
  save: () => { },
  discard: () => { },
  setActions: () => { },
  openInFileExplorer: () => { },
  openInTextEditor: () => { }
});

export const useFileActions = () => useContext(FileActionsContext);

export const FileActionsProvider = ({ children }) => {
  const [actions, setActions] = useState({ save: () => { }, discard: () => { }, openInFileExplorer: () => { }, openInTextEditor: () => { } });

  return (
    <FileActionsContext.Provider value={{ ...actions, setActions }}>
      {children}
    </FileActionsContext.Provider>
  );
};
