

export const addRobotoFont = (doc) => {
  doc.addFileToVFS("Roboto-regular.ttf", "<base64>");
  doc.addFont("Roboto-regular.ttf", "Roboto", "normal");
};
