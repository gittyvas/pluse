import React from 'react';

function FilesTable({ files, theme }) {
  const textColor = theme === "dark" ? "#E0E6EB" : "#303030";
  const mutedTextColor = theme === "dark" ? "#A0A8B0" : "#606060";
  const headerBg = theme === "dark" ? "#2A343D" : "#F0F5F0";
  const rowBg = theme === "dark" ? "#1F2830" : "#FFFFFF";
  const borderColor = theme === "dark" ? "#3A454F" : "#E0E5E0";

  if (!files || files.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          background: headerBg,
          borderRadius: "8px",
          color: mutedTextColor,
          textAlign: "center",
        }}
      >
        No files found. Make sure you granted Drive permission during Google login.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: headerBg }}>
            <th style={{ padding: "12px 16px", textAlign: "left", color: textColor, borderBottom: `1px solid ${borderColor}` }}>
              Icon
            </th>
            <th style={{ padding: "12px 16px", textAlign: "left", color: textColor, borderBottom: `1px solid ${borderColor}` }}>
              Name
            </th>
            <th style={{ padding: "12px 16px", textAlign: "left", color: textColor, borderBottom: `1px solid ${borderColor}` }}>
              Type
            </th>
            <th style={{ padding: "12px 16px", textAlign: "left", color: textColor, borderBottom: `1px solid ${borderColor}` }}>
              Modified
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} style={{ background: rowBg, borderBottom: `1px solid ${borderColor}` }}>
              <td style={{ padding: "12px 16px" }}>
                {file.iconLink ? (
                  <img src={file.iconLink} alt="" style={{ width: "24px", height: "24px" }} />
                ) : (
                  <span style={{ fontSize: "24px" }}>📄</span>
                )}
              </td>
              <td style={{ padding: "12px 16px", color: textColor, fontWeight: 500 }}>
                {file.name}
              </td>
              <td style={{ padding: "12px 16px", color: mutedTextColor, fontSize: "14px" }}>
                {file.mimeType || "Unknown"}
              </td>
              <td style={{ padding: "12px 16px", color: mutedTextColor, fontSize: "14px" }}>
                {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FilesTable;
