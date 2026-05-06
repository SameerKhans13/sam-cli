export function addWatermark(filePath, content) {
  const fileName = filePath.split("/").pop();
  const ext = fileName.split(".").pop().toLowerCase();

  let watermarkedContent = content;

  if (ext === "html") {
    const notice = ``;
    watermarkedContent = notice + "" + content;

    // Add watermark badge to footer
    const footerWatermark = ``;

    if (watermarkedContent.includes("</body>")) {
      watermarkedContent = watermarkedContent.replace(
        "</body>",
        footerWatermark + "</body>"
      );
    }
  } else if (ext === "css") {
    const notice = ``;
    watermarkedContent = notice + "" + content;

    // Add watermark style
    const watermarkStyle = ``;
    watermarkedContent = notice + "" + content;
  }

  return watermarkedContent;
}

export function getResponsibleUseNotice() {
  return ;
}
