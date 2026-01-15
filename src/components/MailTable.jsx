import React from 'react';

function MailTable({ emails, theme }) {
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const headerBgColor = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100';
  const rowBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const rowHoverColor = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const dividerColor = theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200';
  const borderColor = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';

  if (!emails || emails.length === 0) {
    return (
      <div className={`p-6 ${bgColor} rounded-lg shadow-md ${mutedTextColor} text-center`}>
        No emails found. Make sure you granted email permission during Google login.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${bgColor} rounded-lg shadow-md`}>
      <table className={`min-w-full divide-y ${dividerColor}`}>
        <thead className={headerBgColor}>
          <tr>
            <th
              scope="col"
              className={`px-6 py-3 text-left text-xs font-medium ${mutedTextColor} uppercase tracking-wider rounded-tl-lg`}
            >
              From
            </th>
            <th
              scope="col"
              className={`px-6 py-3 text-left text-xs font-medium ${mutedTextColor} uppercase tracking-wider`}
            >
              Subject
            </th>
            <th
              scope="col"
              className={`px-6 py-3 text-left text-xs font-medium ${mutedTextColor} uppercase tracking-wider`}
            >
              Snippet
            </th>
            <th
              scope="col"
              className={`px-6 py-3 text-left text-xs font-medium ${mutedTextColor} uppercase tracking-wider rounded-tr-lg`}
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody className={`${rowBgColor} divide-y ${borderColor}`}>
          {emails.map((email) => (
            <tr
              key={email.id}
              className={`${rowHoverColor} transition-colors duration-150`}
            >
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textColor}`}>
                {email.from}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
                {email.subject}
              </td>
              <td className={`px-6 py-4 text-sm ${mutedTextColor} max-w-xs truncate`}>
                {email.snippet}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${mutedTextColor}`}>
                {email.date ? new Date(email.date).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MailTable;
